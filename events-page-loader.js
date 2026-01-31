// Supabase configuration
const SUPABASE_URL = 'https://ueyhnpazdbtwstkcyedu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleWhucGF6ZGJ0d3N0a2N5ZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM3NzYsImV4cCI6MjA3ODAzOTc3Nn0.leC8cE_Tlj9UvOkov1IhfPdJ0ppeWJtAX2zS1tyZyPg';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch all events from Supabase and render event cards
 */
async function loadAllEvents() {
    const container = document.querySelector('.events-grid');
    const loadingIndicator = container ? container.querySelector('.loading-events') : null;

    try {
        // Get today's date in YYYY-MM-DD format (local timezone)
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Fetch all non-recurring parent events, then filter by date in JS for reliability
        const { data: allEvents, error } = await supabaseClient
            .from('events')
            .select('id, type, title, description, start_date, end_date, start_time, end_time, event_date, event_time, location, picture_url, event_url, created_at, is_recurring, is_instance')
            .or('is_recurring.is.null,is_recurring.eq.false')
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Filter to only upcoming events (event hasn't ended yet)
        // Use end_date if available, otherwise fall back to start_date/event_date
        const events = allEvents ? allEvents.filter(event => {
            const endDate = event.end_date || event.start_date || event.event_date;
            return endDate && endDate >= today;
        }) : [];

        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Clear static placeholder cards
        container.innerHTML = '';

        // Render event cards
        if (events && events.length > 0) {
            events.forEach(event => {
                const card = createEventCard(event);
                container.appendChild(card);
            });

            // Re-initialize GSAP animations after cards are added
            initializeEventCardAnimations();
        } else {
            // No events found
            container.innerHTML = '<p style="width: 100%; text-align: center; color: var(--color-core-100); font-family: var(--font-urbanist);">No events available at this time.</p>';
        }

    } catch (error) {
        console.error('Error loading events:', error);

        // Show error message
        if (container) {
            container.innerHTML = '<p style="width: 100%; text-align: center; color: #ed1f33; font-family: var(--font-urbanist); font-size: 16px;">Failed to load events. Please refresh the page.</p>';
        }
    }
}

/**
 * Create an event card element
 * @param {Object} event - Event data from Supabase
 * @returns {HTMLElement} Event card div element
 */
function createEventCard(event) {
    // Map database 'type' field to HTML 'data-event-category' attribute
    const category = event.type === 'esports' ? 'esports' : 'community';

    // Create card wrapper
    const card = document.createElement('div');
    card.className = 'event-card';
    card.setAttribute('data-event-category', category);
    card.setAttribute('data-name', `event-card-${category}`);
    card.setAttribute('data-event-id', event.id);

    // Preserve event_url as data attribute if it exists
    if (event.event_url && event.event_url !== '#') {
        card.setAttribute('data-event-url', event.event_url);
    }

    // Create card content container
    const content = document.createElement('div');
    content.className = 'event-card-content';

    // Create image wrapper
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'event-card-image-wrapper';

    // Create image element
    const image = document.createElement('div');
    image.className = 'event-card-image';

    // Set background image or placeholder
    if (event.picture_url) {
        image.style.backgroundImage = `url(${event.picture_url})`;
        image.style.backgroundSize = 'cover';
        image.style.backgroundPosition = 'center';

        // Add error handling for failed image loads
        const testImg = new Image();
        testImg.onerror = function() {
            image.classList.add('placeholder');
            image.style.backgroundImage = 'none';
        };
        testImg.src = event.picture_url;
    } else {
        // No image URL - add placeholder class
        image.classList.add('placeholder');
    }

    imageWrapper.appendChild(image);

    // Create black section (text content area)
    const blackSection = document.createElement('div');
    blackSection.className = 'event-card-black-section';

    const body = document.createElement('div');
    body.className = 'event-card-body';

    // Create date element - use start_date/end_date if available, fall back to event_date
    const dateElement = document.createElement('p');
    dateElement.className = 'event-card-date p1';
    dateElement.textContent = formatEventDate(
        event.start_date || event.event_date,
        event.end_date,
        event.start_time || event.event_time
    );

    // Create title element
    const title = document.createElement('h2');
    title.className = 'event-card-title font-pressio-medium';
    title.textContent = event.title || 'Untitled Event';

    // Create description element
    const description = document.createElement('p');
    description.className = 'event-card-description p1';
    description.textContent = event.description || '';

    // Assemble card
    body.appendChild(dateElement);
    body.appendChild(title);
    body.appendChild(description);
    blackSection.appendChild(body);
    content.appendChild(imageWrapper);
    content.appendChild(blackSection);
    card.appendChild(content);

    return card;
}

/**
 * Format date to match existing pattern: "October 12th | 10/16/25"
 * For date ranges: "October 12th - 14th | 10/12/25"
 * @param {string} startDateString - ISO date string from database (YYYY-MM-DD)
 * @param {string} endDateString - ISO date string from database (YYYY-MM-DD), optional
 * @param {string} timeString - Time string from database (HH:MM:SS, nullable)
 * @returns {string} Formatted date string
 */
function formatEventDate(startDateString, endDateString, timeString) {
    // Handle old signature (dateString, timeString)
    if (typeof endDateString === 'string' && endDateString && endDateString.includes(':')) {
        // Second arg is actually timeString (old format)
        timeString = endDateString;
        endDateString = null;
    }

    if (!startDateString) {
        return 'Date TBA';
    }

    try {
        // Parse date string as local date (not UTC) to avoid timezone issues
        // Input format: YYYY-MM-DD
        const [year, month, day] = startDateString.split('-').map(Number);
        const startDate = new Date(year, month - 1, day); // month is 0-indexed

        // Check for invalid date
        if (isNaN(startDate.getTime())) {
            return 'Date TBA';
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];

        const startMonth = monthNames[month - 1];
        const startDay = day;
        const startOrdinal = getOrdinalSuffix(startDay);

        // Check if we have a different end date
        const hasEndDate = endDateString && endDateString !== startDateString;

        if (hasEndDate) {
            // Parse end date as local date (not UTC)
            const [endYear, endMonthNum, endDayNum] = endDateString.split('-').map(Number);
            const endDate = new Date(endYear, endMonthNum - 1, endDayNum);
            if (!isNaN(endDate.getTime())) {
                const endDay = endDayNum;
                const endOrdinal = getOrdinalSuffix(endDay);
                const endMonth = monthNames[endMonthNum - 1];

                // Format: MM/DD/YY for start date
                const mm = String(month).padStart(2, '0');
                const dd = String(day).padStart(2, '0');
                const yy = String(year).toString().slice(-2);

                if (month === endMonthNum) {
                    // Same month: "October 12th - 14th | 10/12/25"
                    return `${startMonth} ${startDay}${startOrdinal} - ${endDay}${endOrdinal} | ${mm}/${dd}/${yy}`;
                } else {
                    // Different months: "October 30th - November 2nd | 10/30/25"
                    return `${startMonth} ${startDay}${startOrdinal} - ${endMonth} ${endDay}${endOrdinal} | ${mm}/${dd}/${yy}`;
                }
            }
        }

        // Single day event
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const yy = String(year).toString().slice(-2);

        return `${startMonth} ${startDay}${startOrdinal} | ${mm}/${dd}/${yy}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Date TBA';
    }
}

/**
 * Get ordinal suffix for day number
 * @param {number} day - Day of month (1-31)
 * @returns {string} Ordinal suffix (st, nd, rd, th)
 */
function getOrdinalSuffix(day) {
    // Special case for 11th, 12th, 13th
    if (day >= 11 && day <= 13) {
        return 'th';
    }

    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

/**
 * Initialize GSAP animations for event cards after dynamic loading
 */
function initializeEventCardAnimations() {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, skipping event card animations');
        return;
    }

    // Set initial state (matches script.js lines 1213-1224)
    gsap.set('.events-grid .event-card', {
        opacity: 0,
        y: 50,
        x: -80,
        force3D: true
    });

    // Ensure text inside cards is visible from the start
    gsap.set('.events-grid .event-card *', {
        opacity: 1,
        y: 0,
        x: 0
    });

    // Animate cards with stagger (matches script.js lines 1299-1315)
    gsap.to('.events-grid .event-card', {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 1,
        force3D: true,
        stagger: {
            amount: 0.5,
            from: "start"
        },
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.events-grid',
            start: 'top 75%',
            toggleActions: 'play none none none'
        }
    });
}

/**
 * Load past events (last 3 events that already happened)
 */
async function loadPastEvents() {
    const container = document.querySelector('.events-recaps-grid');
    const loadingIndicator = container ? container.querySelector('.loading-past-events') : null;

    try {
        // Get today's date in YYYY-MM-DD format (local timezone)
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Fetch all non-recurring parent events, then filter by date in JS for reliability
        const { data: allEvents, error } = await supabaseClient
            .from('events')
            .select('id, type, title, description, start_date, end_date, start_time, end_time, event_date, event_time, location, picture_url, event_url, created_at, is_recurring, is_instance')
            .or('is_recurring.is.null,is_recurring.eq.false')
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Supabase error loading past events:', error);
            throw error;
        }

        // Filter to only past events (event has ended)
        // Use end_date if available, otherwise fall back to start_date/event_date
        const events = allEvents ? allEvents.filter(event => {
            const endDate = event.end_date || event.start_date || event.event_date;
            return endDate && endDate < today;
        }).slice(0, 3) : [];

        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Clear container
        container.innerHTML = '';

        // Render event cards
        if (events && events.length > 0) {
            events.forEach(event => {
                const card = createEventCard(event);
                container.appendChild(card);
            });

            // Re-initialize GSAP animations for past events
            initializePastEventCardAnimations();
        } else {
            // No past events found
            container.innerHTML = '<p style="width: 100%; text-align: center; color: var(--color-core-100); font-family: var(--font-urbanist);">No past events available.</p>';
        }

    } catch (error) {
        console.error('Error loading past events:', error);

        // Show error message
        if (container) {
            container.innerHTML = '<p style="width: 100%; text-align: center; color: #ed1f33; font-family: var(--font-urbanist); font-size: 16px;">Failed to load past events.</p>';
        }
    }
}

/**
 * Initialize GSAP animations for past event cards
 */
function initializePastEventCardAnimations() {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, skipping past event card animations');
        return;
    }

    // Set initial state
    gsap.set('.events-recaps-grid .event-card', {
        opacity: 0,
        y: 50,
        x: -80,
        force3D: true
    });

    // Ensure text inside cards is visible from the start
    gsap.set('.events-recaps-grid .event-card *', {
        opacity: 1,
        y: 0,
        x: 0
    });

    // Animate cards with stagger
    gsap.to('.events-recaps-grid .event-card', {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 1,
        force3D: true,
        stagger: {
            amount: 0.5,
            from: "start"
        },
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.events-recaps-grid',
            start: 'top 75%',
            toggleActions: 'play none none none'
        }
    });
}

// Load events when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadAllEvents();
        loadPastEvents();
    });
} else {
    // DOM already loaded
    loadAllEvents();
    loadPastEvents();
}
