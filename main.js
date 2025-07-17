// main.js
// Fetches and displays the live Bitcoin price using the CoinGecko API.
// Refactored for clarity, maintainability, and efficiency.

/**
 * Formats a number with commas as thousands separators.
 * @param {number} num - The number to format.
 * @returns {string} The formatted number.
 */
function formatNumber(num) {
    return num.toLocaleString('en-US');
}

/**
 * Updates the displayed Bitcoin price and 24h change with animation.
 * @param {number} newPrice - The latest Bitcoin price in USD.
 * @param {number} change - The 24h percentage change.
 */
function updatePrice(newPrice, change) {
    const priceElement = document.getElementById('btc-price');
    const changeElement = document.getElementById('price-change');

    // Format the price
    const formattedPrice = `$${formatNumber(newPrice.toFixed(2))}`;

    // Animate price update
    priceElement.style.opacity = '0';
    setTimeout(() => {
        priceElement.textContent = formattedPrice;
        priceElement.style.opacity = '1';
    }, 200);

    // Update price change
    if (typeof change === 'number') {
        const changeValue = change.toFixed(2);
        const isPositive = changeValue >= 0;
        const changeText = isPositive ? `+${changeValue}%` : `${changeValue}%`;
        changeElement.textContent = changeText;
        changeElement.className = 'price-change ' + (isPositive ? 'positive' : 'negative');
    } else {
        changeElement.textContent = '';
        changeElement.className = 'price-change';
    }
}

/**
 * Fetches the latest Bitcoin price and 24h change from CoinGecko API.
 * Updates the UI accordingly.
 */
async function fetchBitcoinPrice() {
    const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.bitcoin && typeof data.bitcoin.usd === 'number') {
            updatePrice(data.bitcoin.usd, data.bitcoin.usd_24h_change);
        } else {
            throw new Error('Unexpected API response structure.');
        }
    } catch (error) {
        // Display a user-friendly error message
        const priceElement = document.getElementById('btc-price');
        priceElement.textContent = 'Error loading price';
        priceElement.style.opacity = '1';
        const changeElement = document.getElementById('price-change');
        changeElement.textContent = '';
        changeElement.className = 'price-change';
        // Log error for debugging
        console.error('Error fetching Bitcoin price:', error);
    }
}

// Fetch price immediately and then every 30 seconds
fetchBitcoinPrice();
setInterval(fetchBitcoinPrice, 30000);

// --- Hamburger Menu Toggle ---
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navClose = document.querySelector('.nav-close');
    const nav = document.querySelector('.nav');
    const navbar = document.querySelector('.navbar');

    console.log('Nav elements found:', { navToggle, navClose, nav, navbar }); // Debug log

    if (navToggle && nav) {
        // Toggle menu function
        function toggleMenu() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;

            navToggle.setAttribute('aria-expanded', newState);
            document.body.classList.toggle('nav-open', newState);

            // Focus management for accessibility
            if (newState && navClose) {
                setTimeout(() => navClose.focus(), 100);
            }

            console.log('Menu toggled:', newState); // Debug log
        }

        // Close menu function
        function closeMenu() {
            document.body.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');

            console.log('Menu closed'); // Debug log
        }

        // Main toggle event
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // Close button event
        if (navClose) {
            navClose.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeMenu();
                console.log('Close button clicked'); // Debug log
            });

            // Add keyboard support for close button
            navClose.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeMenu();
                }
            });
        }

        // Handle smooth scroll for both mobile and desktop nav links
        function handleNavLinkClick(e) {
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const headerHeight = document.querySelector('.navbar').offsetHeight || 80;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        }

        // Close menu when clicking on mobile nav links (but not dropdown toggles) and handle smooth scroll
        const mobileNavLinks = document.querySelectorAll('.nav-links a:not(.dropdown-toggle)');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Only close menu if it's not a dropdown toggle
                if (!link.classList.contains('dropdown-toggle')) {
                    closeMenu();
                    handleNavLinkClick(e);
                }
            });
        });

        // Handle smooth scroll for desktop nav links
        const desktopNavLinks = document.querySelectorAll('.desktop-nav-links a');
        desktopNavLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideNav = nav.contains(e.target);
            const isClickInsideNavbar = navbar.contains(e.target);
            if (!isClickInsideNav && !isClickInsideNavbar && document.body.classList.contains('nav-open')) {
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
                closeMenu();
                navToggle.focus();
            }
        });

        // Close menu on window resize (if switching to desktop view)
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768 && document.body.classList.contains('nav-open')) {
                closeMenu();
            }
        });
    } else {
        console.error('Navigation elements not found!');
    }

    // --- Mission Cards Carousel (Desktop Only) ---
    const missionCarousel = document.querySelector('.mission-standfor-cards');
    const missionIndicators = document.querySelectorAll('.mission-standfor-indicator');

    // Only initialize carousel functionality on desktop (not mobile)
    if (missionCarousel && missionIndicators.length > 0 && window.innerWidth > 767) {
        let currentSlide = 0;
        let autoSlideInterval = null;
        let isUserInteracting = false;
        const autoSlideDelay = 4000; // 4 seconds between slides
        const pauseDuration = 8000; // 8 seconds pause after user interaction

        // Initialize carousel position
        function initializeCarousel() {
            console.log('Initializing mission carousel');
            missionCarousel.scrollLeft = 0;
            updateIndicators();
            startAutoSlide();
        }

        // Update indicators
        function updateIndicators() {
            missionIndicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }

        // Auto-slide functionality (desktop only)
        function startAutoSlide() {
            // Only enable auto-slide on desktop screens (mobile shows static cards)
            if (window.innerWidth > 767) {
                console.log('Starting auto-slide for desktop screen');
                stopAutoSlide();
                autoSlideInterval = setInterval(() => {
                    if (!isUserInteracting) {
                        const nextSlide = (currentSlide + 1) % missionIndicators.length;
                        console.log('Auto-sliding to slide:', nextSlide);
                        scrollToSlide(nextSlide);
                    }
                }, autoSlideDelay);
            } else {
                console.log('Auto-slide disabled for mobile screen (static card display)');
            }
        }

        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        }

        function pauseAutoSlide() {
            isUserInteracting = true;
            stopAutoSlide();
            setTimeout(() => {
                isUserInteracting = false;
                startAutoSlide();
            }, pauseDuration);
        }

        // Get card width based on screen size (now always 100% width)
        function getCardWidth() {
            return missionCarousel.clientWidth; // Full container width for single card display
        }

        // Scroll to specific slide
        function scrollToSlide(slideIndex) {
            const cardWidth = getCardWidth();
            const scrollPosition = slideIndex * cardWidth;
            missionCarousel.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
            currentSlide = slideIndex;
            updateIndicators();
        }

        // Handle indicator clicks and keyboard navigation
        missionIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                pauseAutoSlide();
                scrollToSlide(index);
            });

            indicator.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pauseAutoSlide();
                    scrollToSlide(index);
                }
            });
        });

        // Add keyboard navigation for the carousel container
        missionCarousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && currentSlide > 0) {
                e.preventDefault();
                pauseAutoSlide();
                scrollToSlide(currentSlide - 1);
            } else if (e.key === 'ArrowRight' && currentSlide < missionIndicators.length - 1) {
                e.preventDefault();
                pauseAutoSlide();
                scrollToSlide(currentSlide + 1);
            }
        });

        // Make carousel focusable for keyboard navigation
        missionCarousel.setAttribute('tabindex', '0');
        missionCarousel.setAttribute('role', 'region');
        missionCarousel.setAttribute('aria-label', 'Mission cards carousel. Use arrow keys to navigate.');

        // Handle scroll events to update indicators
        let scrollTimeout;
        missionCarousel.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const cardWidth = getCardWidth();
                const scrollLeft = missionCarousel.scrollLeft;
                const newSlide = Math.round(scrollLeft / cardWidth);
                if (newSlide !== currentSlide) {
                    currentSlide = Math.max(0, Math.min(newSlide, missionIndicators.length - 1));
                    updateIndicators();
                }
            }, 100);
        });

        // Enhanced touch/swipe support for single card navigation
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;
        let isScrolling = false;
        let isDragging = false;

        missionCarousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;
            scrollLeft = missionCarousel.scrollLeft;
            isScrolling = false;
            isDragging = false;
            pauseAutoSlide(); // Pause auto-slide when user starts touching
        });

        missionCarousel.addEventListener('touchmove', (e) => {
            if (!isDragging && !isScrolling) {
                const deltaX = Math.abs(e.touches[0].pageX - startX);
                const deltaY = Math.abs(e.touches[0].pageY - startY);

                if (deltaX > deltaY) {
                    isDragging = true;
                } else {
                    isScrolling = true;
                }
            }

            if (isDragging) {
                e.preventDefault();
                const x = e.touches[0].pageX;
                const walk = (x - startX) * 1.5;
                missionCarousel.scrollLeft = scrollLeft - walk;
            }
        });

        missionCarousel.addEventListener('touchend', (e) => {
            if (isDragging) {
                const deltaX = e.changedTouches[0].pageX - startX;
                const threshold = 50; // Minimum swipe distance

                if (Math.abs(deltaX) > threshold) {
                    if (deltaX > 0 && currentSlide > 0) {
                        // Swipe right - go to previous slide
                        scrollToSlide(currentSlide - 1);
                    } else if (deltaX < 0 && currentSlide < missionIndicators.length - 1) {
                        // Swipe left - go to next slide
                        scrollToSlide(currentSlide + 1);
                    } else {
                        // Snap back to current slide
                        scrollToSlide(currentSlide);
                    }
                } else {
                    // Snap back to current slide
                    scrollToSlide(currentSlide);
                }
            }
            isDragging = false;
            isScrolling = false;
        });

        // Handle window resize (only for desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 767) {
                initializeCarousel();
            } else {
                stopAutoSlide(); // Stop carousel when switching to mobile
            }
        });

        // Pause auto-slide when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoSlide();
            } else {
                startAutoSlide();
            }
        });

        // Initialize the carousel
        initializeCarousel();
    }
});

/**
 * Initialize dropdown navigation functionality
 */
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');

        // Handle dropdown clicks
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault(); // Always prevent default for dropdown toggles
                e.stopPropagation(); // Stop event from bubbling up

                // Check if we're in mobile mode (nav overlay is visible)
                const isMobileNavOpen = document.body.classList.contains('nav-open');

                if (isMobileNavOpen) {
                    // Mobile dropdown behavior
                    dropdown.classList.toggle('active');

                    // Close other dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('active');
                        }
                    });
                } else {
                    // Desktop behavior - dropdowns work on hover, but we still handle clicks
                    dropdown.classList.toggle('active');

                    // Close other dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('active');
                        }
                    });
                }
            });
        }
    });

    // Close dropdowns when clicking outside (but not when clicking inside mobile nav)
    document.addEventListener('click', function(e) {
        const isMobileNavOpen = document.body.classList.contains('nav-open');

        // Don't close dropdowns if clicking inside mobile nav
        if (isMobileNavOpen && e.target.closest('.nav')) {
            return;
        }

        // Close dropdowns if clicking outside
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    // Close dropdowns on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

// Initialize dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDropdowns();
});