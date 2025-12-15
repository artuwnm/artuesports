// Reuse Supabase configuration from teams-loader.js
// (SUPABASE_URL and SUPABASE_ANON_KEY already declared in teams-loader.js)

// Initialize Supabase client for events
const supabaseEvents = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch events from Supabase and render event cards
 */
async function loadEvents() {
    const container = document.querySelector('.index-events-grid');
    const loadingIndicator = container.querySelector('.loading-events');

    try {
        // Fetch 3 most recent events sorted by created_at DESC
        const { data: events, error } = await supabaseEvents
            .from('events')
            .select('id, type, title, description, event_date, event_time, location, picture_url, event_url, created_at')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

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
        if (loadingIndicator) {
            loadingIndicator.innerHTML = '<p style="color: #ed1f33; font-family: var(--font-urbanist); font-size: 16px;">Failed to load events. Please refresh the page.</p>';
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

    // Make entire card clickable if event_url exists
    if (event.event_url && event.event_url !== '#') {
        card.style.cursor = 'pointer';
        card.onclick = () => window.location.href = event.event_url;
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

    // Create date element
    const dateElement = document.createElement('p');
    dateElement.className = 'event-card-date p1';
    dateElement.textContent = formatEventDate(event.event_date, event.event_time);

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
 * @param {string} dateString - ISO date string from database (YYYY-MM-DD)
 * @param {string} timeString - Time string from database (HH:MM:SS, nullable)
 * @returns {string} Formatted date string
 */
function formatEventDate(dateString, timeString) {
    if (!dateString) {
        return 'Date TBA';
    }

    try {
        const date = new Date(dateString);

        // Check for invalid date
        if (isNaN(date.getTime())) {
            return 'Date TBA';
        }

        // Part 1: Month name + ordinal day
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        const ordinal = getOrdinalSuffix(day);

        // Part 2: MM/DD/YY format
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yy = String(date.getFullYear()).slice(-2);

        return `${month} ${day}${ordinal} | ${mm}/${dd}/${yy}`;
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
    gsap.set('.index-events-grid .event-card', {
        opacity: 0,
        y: 50,
        x: -80,
        force3D: true
    });

    // Ensure text inside cards is visible from the start
    gsap.set('.index-events-grid .event-card *', {
        opacity: 1,
        y: 0,
        x: 0
    });

    // Animate cards with stagger (matches script.js lines 1299-1315)
    gsap.to('.index-events-grid .event-card', {
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
            trigger: '.index-events-grid',
            start: 'top 75%',
            toggleActions: 'play none none none'
        }
    });
}

// Load events when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEvents);
} else {
    // DOM already loaded
    loadEvents();
}
