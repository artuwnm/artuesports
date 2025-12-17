// Supabase configuration
const SUPABASE_URL = 'https://ueyhnpazdbtwstkcyedu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleWhucGF6ZGJ0d3N0a2N5ZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM3NzYsImV4cCI6MjA3ODAzOTc3Nn0.leC8cE_Tlj9UvOkov1IhfPdJ0ppeWJtAX2zS1tyZyPg';

// Initialize Supabase client
const supabaseTeam = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Placeholder images
const PLACEHOLDER_PLAYER_IMAGE = 'img/players/justin.png'; // Default player image
const DEFAULT_PLAYER_DESCRIPTION = 'Team member contributing their skills and passion to our competitive roster.';

/**
 * Get URL parameter value
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getURLParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Initialize card flip interactions for player cards
 * This replicates the functionality from script.js for dynamically loaded cards
 */
function initializeCardFlipInteractions() {
    // Check if jQuery is available
    if (typeof $ === 'undefined') {
        console.warn('jQuery not loaded, skipping card flip interactions');
        return;
    }

    console.log('Initializing card flip interactions...');
    const $cards = $('.varsity-player-card');
    console.log('Found', $cards.length, 'player cards');

    // Function to toggle card animation (from script.js)
    function toggleCardAnimation($card) {
        console.log('Toggling card animation');
        const $cardContent = $card.find('.varsity-player-card-content');
        const $button = $card.find('.btn-filled');
        const $playerName = $card.find('.varsity-player-name');
        const $nameOverlay = $card.find('.varsity-player-name-overlay-text');

        console.log('Card content elements:', {
            cardContent: $cardContent.length,
            button: $button.length,
            playerName: $playerName.length,
            nameOverlay: $nameOverlay.length
        });

        // Get the player name from the card
        if ($playerName.length && $nameOverlay.length) {
            const playerName = $playerName.text().trim();
            $nameOverlay.text(playerName);
        }

        // Toggle the image-shrunk class on BOTH the card content and the card itself
        $cardContent.toggleClass('image-shrunk');
        $card.toggleClass('image-shrunk');

        // Change button text
        if ($cardContent.hasClass('image-shrunk')) {
            $button.text('See less');
        } else {
            $button.text('Learn more');
        }

        console.log('Image-shrunk class toggled, current state:', $cardContent.hasClass('image-shrunk'));
    }

    // Remove any existing event handlers to avoid duplicates
    $('.varsity-player-card').off('click');
    $('.varsity-player-card .btn-filled').off('click');

    // Make the entire card clickable
    $('.varsity-player-card').on('click', function(e) {
        // Don't trigger if clicking directly on the button
        if ($(e.target).closest('.btn-filled').length > 0) {
            return;
        }

        const $card = $(this);
        toggleCardAnimation($card);
    });

    // Keep button click handler for explicit button clicks
    $('.varsity-player-card .btn-filled').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const $button = $(this);
        const $card = $button.closest('.varsity-player-card');
        toggleCardAnimation($card);
    });
}

/**
 * Load and display team data dynamically
 */
async function loadTeamPage() {
    // Get team identifier from URL (could be slug like "overwatch" or id)
    const teamIdentifier = getURLParameter('id') || getURLParameter('slug');

    if (!teamIdentifier) {
        showError('No team specified in URL');
        return;
    }

    try {
        // Fetch all teams and find matching one
        const { data: allTeams, error: teamError } = await supabaseTeam
            .from('teams')
            .select('*');

        if (teamError) throw teamError;

        // Find team by matching slug against name
        // Convert team names to slugs and compare
        const team = allTeams?.find(t => {
            const teamSlug = t.name.toLowerCase().replace(/ /g, '-');
            const teamSlugNoSpaces = t.name.toLowerCase().replace(/ /g, '');
            return teamSlug === teamIdentifier.toLowerCase() ||
                   teamSlugNoSpaces === teamIdentifier.toLowerCase() ||
                   t.name.toLowerCase() === teamIdentifier.toLowerCase() ||
                   t.id === teamIdentifier;
        });

        if (!team) {
            showError('Team not found');
            return;
        }

        // Update page with team data
        updateHeroSection(team);

        // Load players for this team
        await loadPlayers(team.id);

        // Load events for this team
        await loadEvents(team.id);

    } catch (error) {
        console.error('Error loading team page:', error);
        showError('Failed to load team data: ' + error.message);
    }
}

/**
 * Update hero section with team data
 * @param {Object} team - Team data from Supabase
 */
function updateHeroSection(team) {
    // Update page title
    document.title = `${team.name} - Art U Esports`;

    // Update team name
    const titleElement = document.querySelector('.team-hero-title');
    if (titleElement) {
        titleElement.textContent = team.name;
    }

    // Update team description
    const descElement = document.querySelector('.team-hero-description');
    if (descElement && team.description) {
        descElement.textContent = team.description;
    }

    // Update hero background if logo_url exists
    const heroImagePlaceholder = document.querySelector('.team-hero-image-placeholder');
    if (heroImagePlaceholder && team.logo_url) {
        heroImagePlaceholder.style.backgroundImage = `url(${team.logo_url})`;
        heroImagePlaceholder.style.backgroundSize = 'cover';
        heroImagePlaceholder.style.backgroundPosition = 'center';
    }
}

/**
 * Load and display players for the team
 * @param {string} teamId - Team ID
 */
async function loadPlayers(teamId) {
    try {
        // Fetch players via player_teams junction table
        const { data: playerTeams, error } = await supabaseTeam
            .from('player_teams')
            .select(`
                players (
                    id, name, position, major, hometown, quote,
                    k_d, win_percentage, hours_played, picture_url
                )
            `)
            .eq('team_id', teamId);

        if (error) throw error;

        // Extract player data from nested structure
        const players = playerTeams?.map(pt => pt.players).filter(p => p !== null) || [];

        // Get player cards container
        const container = document.querySelector('.varsity-cards-container');
        if (!container) {
            console.error('Player cards container not found');
            return;
        }

        // Clear existing cards
        container.innerHTML = '';

        if (players.length === 0) {
            container.innerHTML = '<p style="width: 100%; text-align: center; color: var(--color-core-100); font-family: var(--font-urbanist); padding: 50px 0;">No players found for this team yet.</p>';
            return;
        }

        // Generate player cards
        players.forEach(player => {
            const card = createPlayerCard(player);
            container.appendChild(card);
        });

        // Wait a moment for DOM to be ready, then initialize card flip interactions
        setTimeout(() => {
            initializeCardFlipInteractions();
        }, 100);

        // Re-initialize GSAP animations if available
        if (typeof gsap !== 'undefined') {
            gsap.set('.varsity-player-card', { opacity: 0, y: 50 });
            gsap.to('.varsity-player-card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.varsity-cards-container',
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            });
        }

    } catch (error) {
        console.error('Error loading players:', error);
    }
}

/**
 * Create a player card element
 * @param {Object} player - Player data from Supabase
 * @returns {HTMLElement} Player card element
 */
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'varsity-player-card';
    card.setAttribute('data-name', 'Player-Card');

    const imageUrl = player.picture_url || PLACEHOLDER_PLAYER_IMAGE;
    const playerName = player.name || 'Player Name';
    const position = player.position || 'Player';
    const kd = player.k_d ? player.k_d.toFixed(2) : 'N/A';
    const winPercentage = player.win_percentage ? player.win_percentage.toFixed(2) : 'N/A';
    const hoursPlayed = player.hours_played || 'N/A';
    const major = player.major || 'Not specified';
    const hometown = player.hometown || 'Not specified';
    const quote = player.quote || DEFAULT_PLAYER_DESCRIPTION;

    card.innerHTML = `
        <div class="varsity-player-card-inner">
            <div class="varsity-player-card-content">
                <div class="varsity-player-image-wrapper">
                    <img src="${imageUrl}" alt="${playerName}" class="varsity-player-image" />
                    <div class="varsity-player-gradient-overlay"></div>
                    <div class="varsity-player-name-overlay">
                        <h3 class="varsity-player-name-overlay-text font-pressio-medium">${playerName}</h3>
                    </div>
                </div>
                <div class="varsity-player-black-section">
                    <div class="varsity-player-stats-row">
                        <div class="varsity-player-stat-item">
                            <p class="varsity-player-stat-label">K/D:</p>
                            <p class="varsity-player-stat-value font-pressio-medium">${kd}</p>
                        </div>
                        <div class="varsity-player-stat-item">
                            <p class="varsity-player-stat-label">Win %:</p>
                            <p class="varsity-player-stat-value font-pressio-medium">${winPercentage}</p>
                        </div>
                        <div class="varsity-player-stat-item">
                            <p class="varsity-player-stat-label">Hours</p>
                            <p class="varsity-player-stat-value font-pressio-medium">${hoursPlayed}</p>
                        </div>
                    </div>
                    <div class="varsity-player-info-rows">
                        <div class="varsity-player-info-row">
                            <p class="varsity-player-info-left">${major}</p>
                            <p class="varsity-player-info-right">Major</p>
                        </div>
                        <div class="varsity-player-info-row">
                            <p class="varsity-player-info-left">${hometown}</p>
                            <p class="varsity-player-info-right">Location</p>
                        </div>
                    </div>
                    <div class="varsity-player-quote">
                        <p>${quote}</p>
                    </div>
                </div>
                <p class="varsity-player-role">${position}</p>
                <div class="varsity-player-info">
                    <div class="varsity-player-details">
                        <div class="varsity-player-name-wrapper">
                            <h3 class="varsity-player-name font-pressio-medium">${playerName}</h3>
                        </div>
                        <div class="varsity-player-description-wrapper">
                            <p class="varsity-player-description">${quote}</p>
                        </div>
                    </div>
                    <button class="btn-filled" data-name="Buttons-Desktop">
                        Learn more
                    </button>
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Load and display events for the team
 * @param {string} teamId - Team ID
 */
async function loadEvents(teamId) {
    try {
        // Fetch events filtered by team_id, limit to 3 most recent
        const { data: events, error } = await supabaseTeam
            .from('events')
            .select('*')
            .eq('team_id', teamId)
            .order('event_date', { ascending: false })
            .limit(3);

        if (error) throw error;

        // Get events container
        const container = document.querySelector('.team-events-section .events-grid');
        if (!container) {
            console.error('Events container not found');
            return;
        }

        // Clear existing event cards
        container.innerHTML = '';

        if (!events || events.length === 0) {
            container.innerHTML = '<p style="width: 100%; text-align: center; color: var(--color-core-100); font-family: var(--font-urbanist); padding: 50px 0;">No events found for this team yet.</p>';
            return;
        }

        // Generate event cards
        events.forEach(event => {
            const card = createEventCard(event);
            container.appendChild(card);
        });

        // Re-initialize GSAP animations if available
        if (typeof gsap !== 'undefined') {
            gsap.set('.team-events-section .event-card', { opacity: 0, y: 50 });
            gsap.to('.team-events-section .event-card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.team-events-section .events-grid',
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            });
        }

    } catch (error) {
        console.error('Error loading events:', error);
    }
}

/**
 * Create an event card element
 * @param {Object} event - Event data from Supabase
 * @returns {HTMLElement} Event card element
 */
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.setAttribute('data-event-category', event.type || 'esports');
    card.setAttribute('data-name', 'event-card-' + (event.type || 'esports'));

    const formattedDate = formatEventDate(event.event_date, event.event_time);
    const title = event.title || 'Untitled Event';
    const description = event.description || '';
    const imageUrl = event.picture_url || '';

    card.innerHTML = `
        <div class="event-card-content">
            <div class="event-card-image-wrapper">
                <div class="event-card-image" style="${imageUrl ? `background-image: url(${imageUrl}); background-size: cover; background-position: center;` : ''}"></div>
            </div>
            <div class="event-card-black-section">
                <div class="event-card-body">
                    <p class="event-card-date p1">${formattedDate}</p>
                    <h2 class="event-card-title font-pressio-medium">${title}</h2>
                    <p class="event-card-description p1">${description}</p>
                </div>
            </div>
        </div>
    `;

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
 * Show error message to user
 * @param {string} message - Error message
 */
function showError(message) {
    console.error(message);

    // Update hero title to show error
    const titleElement = document.querySelector('.team-hero-title');
    if (titleElement) {
        titleElement.textContent = 'Team Not Found';
        titleElement.style.color = '#ed1f33';
    }

    // Update description
    const descElement = document.querySelector('.team-hero-description');
    if (descElement) {
        descElement.textContent = message;
    }

    // Clear player cards
    const playerContainer = document.querySelector('.varsity-cards-container');
    if (playerContainer) {
        playerContainer.innerHTML = '<p style="width: 100%; text-align: center; color: #ed1f33; font-family: var(--font-urbanist); padding: 50px 0;">Unable to load team data.</p>';
    }

    // Clear event cards
    const eventsContainer = document.querySelector('.team-events-section .events-grid');
    if (eventsContainer) {
        eventsContainer.innerHTML = '';
    }
}

// Load team page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTeamPage);
} else {
    loadTeamPage();
}
