// Carousel Loader - Fetches active slides from Supabase and injects into homepage carousel

const SUPABASE_URL_CAROUSEL = 'https://ueyhnpazdbtwstkcyedu.supabase.co';
const SUPABASE_ANON_KEY_CAROUSEL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleWhucGF6ZGJ0d3N0a2N5ZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM3NzYsImV4cCI6MjA3ODAzOTc3Nn0.leC8cE_Tlj9UvOkov1IhfPdJ0ppeWJtAX2zS1tyZyPg';

const carouselSupabase = window.supabase.createClient(SUPABASE_URL_CAROUSEL, SUPABASE_ANON_KEY_CAROUSEL);

async function loadCarouselSlides() {
    const carouselEl = document.querySelector('.carousel[data-dynamic]');
    if (!carouselEl) return;

    try {
        const { data: slides, error } = await carouselSupabase
            .from('carousel_slides')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        if (!slides || slides.length === 0) {
            // No active slides — fall back to hardcoded content, init carousel normally
            new Carousel(carouselEl);
            return;
        }

        // Clear existing hardcoded slides
        const deck = carouselEl.querySelector('.carousel-deck');
        if (!deck) {
            new Carousel(carouselEl);
            return;
        }

        deck.innerHTML = '';

        // Clear any existing pagination (will be rebuilt by Carousel.init)
        const paginationWrapper = carouselEl.querySelector('.carousel-pagination-wrapper');
        if (paginationWrapper) paginationWrapper.innerHTML = '';

        // Inject dynamic slides
        slides.forEach(slide => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'carousel-slide';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'carousel-slide-content';

            if (slide.media_type === 'video') {
                const video = document.createElement('video');
                video.src = slide.media_url;
                video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                contentDiv.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = slide.media_url;
                img.alt = slide.alt_text || 'Carousel Image';
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
                contentDiv.appendChild(img);
            }

            slideDiv.appendChild(contentDiv);
            deck.appendChild(slideDiv);
        });

        // Initialize the Carousel JS class on the dynamic carousel
        new Carousel(carouselEl);

    } catch (error) {
        console.error('Error loading carousel slides:', error);
        // On error, fall back to hardcoded slides and init normally
        new Carousel(carouselEl);
    }
}

// Load when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCarouselSlides);
} else {
    loadCarouselSlides();
}
