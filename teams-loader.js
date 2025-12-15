// Supabase configuration
const SUPABASE_URL = 'https://ueyhnpazdbtwstkcyedu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleWhucGF6ZGJ0d3N0a2N5ZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM3NzYsImV4cCI6MjA3ODAzOTc3Nn0.leC8cE_Tlj9UvOkov1IhfPdJ0ppeWJtAX2zS1tyZyPg';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Placeholder image fallback
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';

/**
 * Fetch teams from Supabase and render team cards
 */
async function loadTeams() {
    const container = document.querySelector('.teams-cards-container');
    const loadingIndicator = container.querySelector('.loading-teams');

    try {
        // Fetch teams sorted alphabetically
        const { data: teams, error } = await supabase
            .from('teams')
            .select('id, name, logo_url, page_url')
            .order('name', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Render team cards
        if (teams && teams.length > 0) {
            teams.forEach(team => {
                const card = createTeamCard(team);
                container.appendChild(card);
            });

            // Re-initialize GSAP animations after cards are added
            initializeTeamCardAnimations();
        } else {
            // No teams found
            container.innerHTML = '<p style="width: 100%; text-align: center; color: var(--color-core-100); font-family: var(--font-urbanist);">No teams available at this time.</p>';
        }

    } catch (error) {
        console.error('Error loading teams:', error);

        // Show error message
        if (loadingIndicator) {
            loadingIndicator.innerHTML = '<p style="color: #ed1f33; font-family: var(--font-urbanist); font-size: 16px;">Failed to load teams. Please refresh the page.</p>';
        }
    }
}

/**
 * Create a team card element
 * @param {Object} team - Team data from Supabase
 * @returns {HTMLElement} Team card anchor element
 */
function createTeamCard(team) {
    // Create card link element
    const card = document.createElement('a');
    card.className = 'team-card';
    card.href = team.page_url || '#';
    card.setAttribute('data-name', 'Team-card');
    card.setAttribute('data-team-id', team.id);

    // Create background image
    const bgImage = document.createElement('img');
    bgImage.className = 'team-card-bg';
    bgImage.alt = `${team.name} team background`;

    // Use logo_url if available, otherwise use placeholder
    if (team.logo_url) {
        bgImage.src = team.logo_url;
        bgImage.onerror = function() {
            // If image fails to load, add placeholder class
            this.classList.add('placeholder');
            this.src = PLACEHOLDER_IMAGE;
        };
    } else {
        bgImage.classList.add('placeholder');
        bgImage.src = PLACEHOLDER_IMAGE;
    }

    // Create title element
    const title = document.createElement('p');
    title.className = 'team-card-title font-pressio';

    // Handle multi-line titles (e.g., "League Of Legends")
    if (team.name.includes(' ')) {
        const words = team.name.split(' ');
        if (words.length === 3) {
            // Three words: first two on line 1, third on line 2
            const line1 = document.createElement('p');
            line1.className = 'mb-0';
            line1.textContent = `${words[0]} ${words[1]}`;

            const line2 = document.createElement('p');
            line2.textContent = words[2];

            title.appendChild(line1);
            title.appendChild(line2);
        } else {
            // Default: just use the name as-is
            title.textContent = team.name;
        }
    } else {
        title.textContent = team.name;
    }

    // Assemble card
    card.appendChild(bgImage);
    card.appendChild(title);

    return card;
}

/**
 * Initialize GSAP animations for team cards after dynamic loading
 */
function initializeTeamCardAnimations() {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, skipping team card animations');
        return;
    }

    // Set initial state (same as script.js line 1226)
    gsap.set('.team-card', {
        opacity: 0,
        y: 50
    });

    // Animate cards with stagger (same as script.js line 1344-1355)
    gsap.to('.team-card', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.teams-cards-container',
            start: 'top 75%',
            toggleActions: 'play none none none'
        }
    });
}

// Load teams when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTeams);
} else {
    // DOM already loaded
    loadTeams();
}
