document.addEventListener("DOMContentLoaded", function() {
    var overlay = document.getElementById("logo-overlay");
    if (!overlay) return;
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    // Calculate position relative to background image's actual rendered size
    positionLogoRelativeToBackground();
    
    // Add smooth scroll behavior
    setupSmoothScroll();
    
    // Add scroll-based logo movement for both desktop and mobile
    setupScrollLogoMovement();
});

// Position logo relative to background image dimensions
function positionLogoRelativeToBackground() {
    const overlay = document.getElementById("logo-overlay");
    const heroSection = document.querySelector('.hero');
    
    if (!overlay || !heroSection) return;
    
    // Get the actual rendered dimensions of the background image
    const sectionRect = heroSection.getBoundingClientRect();
    const sectionWidth = sectionRect.width;
    const sectionHeight = sectionRect.height;
    
    // Calculate the actual height of the background image based on its aspect ratio
    // Background image aspect ratio is 1440/900 = 1.6
    const imageAspectRatio = 1440 / 900;
    const imageHeight = sectionWidth / imageAspectRatio;
    
    // Check if the full first page is in view (at the very top)
    const isAtTop = window.scrollY <= 10; // Small tolerance for exact top position
    
    // Position logo based on scroll position
    const isMobile = window.innerWidth <= 768;
    let logoTopPixels;
    
    if (isMobile) {
        // For mobile, use a fixed position relative to viewport height for consistency
        logoTopPixels = window.innerHeight * 0.45; // 45% of viewport height
    } else {
        // For desktop, use different percentages based on scroll position
        if (isAtTop) {
            // When at top (full page in view), position in middle of archway (50%)
            logoTopPixels = (imageHeight * 50) / 100;
        } else {
            // When scrolled, position at top of archway (40% - original position)
            logoTopPixels = (imageHeight * 40) / 100;
        }
    }
    
    // Debug logging
    console.log('Mobile detection:', isMobile, 'Window width:', window.innerWidth);
    console.log('At top:', isAtTop, 'Scroll Y:', window.scrollY);
    console.log('Logo positioning:', isAtTop ? '50% (middle)' : '40% (top)', 'Pixels:', logoTopPixels);
    console.log('Image height:', imageHeight, 'Section width:', sectionWidth);
    
    // Calculate logo size relative to background image dimensions
    // Logo should be 15% of the background image width (22% on mobile)
    const logoSizePercent = isMobile ? 22 : 15;
    const logoSizePixels = (sectionWidth * logoSizePercent) / 100;
    
    // Set the position and size in pixels relative to the background image
    overlay.style.top = logoTopPixels + 'px';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.width = logoSizePixels + 'px';
    overlay.style.height = logoSizePixels + 'px';
}

// Recalculate on window resize
window.addEventListener('resize', function() {
    positionLogoRelativeToBackground();
    
    // Update mobile menu visibility on resize
    const mobileMenuButtonInside = document.getElementById('mobile-menu-button-inside');
    const isMobile = window.innerWidth <= 768;
    
    if (mobileMenuButtonInside) {
        if (isMobile) {
            mobileMenuButtonInside.style.display = 'block';
            console.log('Mobile menu shown on resize');
        } else {
            mobileMenuButtonInside.style.display = 'none';
            console.log('Mobile menu hidden on resize');
        }
    }
});

// Setup scroll-based logo movement within archway bounds
function setupScrollLogoMovement() {
    const overlay = document.getElementById("logo-overlay");
    const heroSection = document.querySelector('.hero');
    
    if (!overlay || !heroSection) return;
    
    // Store initial position for reference
    let initialLogoTop = null;
    let archwayBounds = null;
    
    function calculateArchwayBounds() {
        const sectionRect = heroSection.getBoundingClientRect();
        const sectionWidth = sectionRect.width;
        const imageAspectRatio = 1440 / 900;
        const imageHeight = sectionWidth / imageAspectRatio;
        
        // Archway starts at top of section, ends at bottom of image
        const archwayStart = 0;
        const archwayEnd = imageHeight;
        
        return {
            start: archwayStart,
            end: archwayEnd,
            height: imageHeight
        };
    }
    
    function updateLogoPosition() {
        if (!initialLogoTop) {
            // Store the initial position based on scroll position
            const bounds = calculateArchwayBounds();
            const isMobile = window.innerWidth <= 768;
            const isAtTop = window.scrollY <= 10;
            
            if (isMobile) {
                initialLogoTop = window.innerHeight * 0.45; // 45% of viewport height
            } else {
                // Use dynamic starting position based on scroll
                if (isAtTop) {
                    initialLogoTop = (bounds.height * 50) / 100; // 50% (middle) when at top
                } else {
                    initialLogoTop = (bounds.height * 40) / 100; // 40% (top) when scrolled
                }
            }
        }
        
        if (!archwayBounds) {
            archwayBounds = calculateArchwayBounds();
        }
        
        // Get current scroll position
        const scrollY = window.scrollY;
        
        // Calculate how much the logo should move based on scroll
        // Logo should start at initial position and move down with scroll
        const scrollProgress = Math.min(scrollY / window.innerHeight, 1); // Clamp between 0 and 1
        
        // Debug logging for mobile
        if (window.innerWidth <= 768) {
            console.log('Mobile scroll:', scrollY, 'Progress:', scrollProgress, 'Initial:', initialLogoTop);
        }
        
        // Calculate new position - use proper mobile dimensions
        const isMobile = window.innerWidth <= 768;
        let newTop;
        
        if (isMobile) {
            // For mobile, calculate based on actual mobile background dimensions
            // Mobile uses 100vh height, so the background is the full viewport
            const mobileBackgroundHeight = window.innerHeight; // Mobile background is 100vh
            const maxMovement = mobileBackgroundHeight - initialLogoTop;
            const currentMovement = scrollProgress * maxMovement;
            newTop = initialLogoTop + currentMovement;
            
            // Debug mobile dimensions
            console.log('Mobile background height:', mobileBackgroundHeight, 'Max movement:', maxMovement);
        } else {
            // For desktop, smoothly interpolate based on how much of the page is visible
            const viewportHeight = window.innerHeight;
            const archwayHeight = archwayBounds.height;
            
            // Calculate the ratio: 1.0 = full page visible, 0.0 = page not fully visible
            const visibilityRatio = Math.min(viewportHeight / archwayHeight, 1);
            
            // Apply a curve to make it transition to 40% much faster
            // Using a higher power curve: ratio^4 makes it transition very aggressively toward 40%
            const curvedRatio = Math.pow(visibilityRatio, 4);
            
            // Create a smooth transition between 40% (top) and 50% (middle)
            // When visibilityRatio is HIGH (small window, full page visible) → closer to 50% (middle)
            // When visibilityRatio is LOW (large window, page not fully visible) → closer to 40% (top)
            const topPosition = 40; // Top position for large windows
            const middlePosition = 50; // Middle position for small windows
            const smoothPosition = topPosition + (middlePosition - topPosition) * curvedRatio;
            
            const adjustedInitialTop = (archwayBounds.height * smoothPosition) / 100;
            
            console.log('Viewport height:', viewportHeight, 'Archway height:', archwayHeight.toFixed(0));
            console.log('Ratio:', visibilityRatio.toFixed(2), 'Curved ratio:', curvedRatio.toFixed(2), 'Position:', smoothPosition.toFixed(1) + '%');
            console.log('Top position:', topPosition, 'Middle position:', middlePosition);
            
            const maxMovement = archwayBounds.end - adjustedInitialTop;
            const currentMovement = scrollProgress * maxMovement;
            newTop = adjustedInitialTop + currentMovement;
            
            console.log('Window height:', viewportHeight, 'Archway height:', archwayHeight);
        }
        
        // Apply constraints based on platform
        let constrainedTop;
        
        if (isMobile) {
            // For mobile, stop at 75% of viewport height
            const maxMobilePosition = window.innerHeight * 0.75;
            constrainedTop = Math.min(newTop, maxMobilePosition);
        } else {
            // For desktop, apply the 62% stopping position
            const stopPosition = archwayBounds.end * 0.62;
            constrainedTop = Math.min(newTop, stopPosition);
        }
        
        // Apply the new position
        overlay.style.top = constrainedTop + 'px';
    }
    
    // Initial calculation
    updateLogoPosition();
    
    // Update on scroll
    window.addEventListener('scroll', updateLogoPosition);
    
    // Recalculate bounds on resize
    window.addEventListener('resize', function() {
        initialLogoTop = null;
        archwayBounds = null;
        updateLogoPosition();
    });
}

// Smooth scroll setup
function setupSmoothScroll() {
    // Add scroll snap for better UX
    document.documentElement.style.scrollSnapType = 'y mandatory';
    
    // Add scroll snap to each section
    const sections = document.querySelectorAll('.hero-section');
    sections.forEach(section => {
        section.style.scrollSnapAlign = 'start';
    });
    
    // Scroll indicators disabled - clean scrolling experience
}

// Social Media Links Configuration
const socialLinks = {
    music: '#', // Add your music platform URL here
    cbyc: 'https://www.youtube.com/@custisblueyapcast', // CBYC podcast URL
    store: '#', // Add your store URL here
    youtube: 'https://www.youtube.com/@Custisblue_', // YouTube channel URL
    tiktok: 'https://www.tiktok.com/@custisblue', // TikTok profile URL
    instagram: 'https://www.instagram.com/custisblue/', // Instagram profile URL
    podcast: 'https://www.youtube.com/@custisblueyapcast' // Podcast URL
};

// Initialize social media links
function initializeSocialLinks() {
    Object.keys(socialLinks).forEach(platform => {
        const links = document.querySelectorAll(`[data-url="${platform}"]`);
        links.forEach(link => {
            link.href = socialLinks[platform];
            if (socialLinks[platform] !== '#') {
                link.target = '_blank';
            }
        });
    });
}

// Mobile Menu Functionality
function initializeMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    
    console.log('Mobile menu elements found:', {
        menuToggle: !!menuToggle,
        mobileMenuOverlay: !!mobileMenuOverlay,
        mobileMenuButton: !!mobileMenuButton,
        windowWidth: window.innerWidth
    });
    
    // Show mobile menu button inside scroll container on mobile
    const mobileMenuButtonInside = document.getElementById('mobile-menu-button-inside');
    const isMobile = window.innerWidth <= 768;
    
    console.log('Mobile menu check - Window width:', window.innerWidth, 'Is mobile:', isMobile);
    
    if (isMobile && mobileMenuButtonInside) {
        mobileMenuButtonInside.style.display = 'block';
        console.log('Mobile menu button inside scroll container should be visible on mobile');
        
        // Add click handler with animation
        mobileMenuButtonInside.addEventListener('click', function() {
            console.log('Mobile menu button inside clicked');
            if (mobileMenuOverlay) {
                // Save current scroll position when opening menu
                window.mobileMenuScrollPosition = window.scrollY;
                console.log('Saved scroll position:', window.mobileMenuScrollPosition);
                mobileMenuOverlay.classList.toggle('active');
                
                // Add/remove class to body to hide logo
                if (mobileMenuOverlay.classList.contains('active')) {
                    document.body.classList.add('mobile-menu-open');
                } else {
                    document.body.classList.remove('mobile-menu-open');
                }
            }
        });
        
        // Add click animation to menu button
        const menuButton = document.getElementById('mobile-menu-btn');
        if (menuButton) {
            menuButton.addEventListener('mousedown', function() {
                this.style.transform = 'scale(1.1)';
            });
            menuButton.addEventListener('mouseup', function() {
                this.style.transform = 'scale(1)';
            });
            menuButton.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        }
    } else {
        console.log('Not mobile or mobile menu button inside not found');
        if (mobileMenuButtonInside) {
            mobileMenuButtonInside.style.display = 'none';
        }
    }
    
    // Function to close menu and restore scroll position
    function closeMenuAndRestoreScroll() {
        console.log('closeMenuAndRestoreScroll called');
        console.log('Current scroll position:', window.scrollY);
        console.log('Saved scroll position:', window.mobileMenuScrollPosition);
        
        // Start fade-out animation
        mobileMenuOverlay.classList.remove('active');
        
        // Remove class from body to show logo again
        document.body.classList.remove('mobile-menu-open');
        
        // Restore scroll position after animation completes
        if (window.mobileMenuScrollPosition !== undefined) {
            setTimeout(() => {
                window.scrollTo(0, window.mobileMenuScrollPosition);
                console.log('Restored scroll position:', window.mobileMenuScrollPosition);
            }, 400); // Wait for 0.4s animation to complete
        } else {
            console.log('No saved scroll position found');
        }
    }
    
    if (menuToggle && mobileMenuOverlay) {
        menuToggle.addEventListener('click', function() {
            console.log('Mobile menu toggle clicked');
            mobileMenuOverlay.classList.toggle('active');
        });
        
        // Close menu when clicking outside or on a link
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
                closeMenuAndRestoreScroll();
            }
        });
        
        // Close menu when clicking on any mobile menu link
        const mobileLinks = mobileMenuOverlay.querySelectorAll('.mobile-asset-link, .mobile-icon-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenuAndRestoreScroll();
            });
        });
        
        // Close menu when clicking the X button
        const closeButton = document.getElementById('close-mobile-menu');
        if (closeButton) {
            console.log('Close button found, adding event listener');
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked!');
                closeMenuAndRestoreScroll();
            });
            
        } else {
            console.log('Close button NOT found!');
        }
    } else {
        console.log('Mobile menu elements not found - check HTML structure');
    }
}

// Global function for closing mobile menu (called from onclick)
function closeMobileMenu() {
    console.log('closeMobileMenu called from onclick');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('active');
        
        // Remove class from body to show logo again
        document.body.classList.remove('mobile-menu-open');
        
        // Restore scroll position after animation completes
        if (window.mobileMenuScrollPosition !== undefined) {
            setTimeout(() => {
                window.scrollTo(0, window.mobileMenuScrollPosition);
                console.log('Restored scroll position from onclick:', window.mobileMenuScrollPosition);
            }, 400); // Wait for 0.4s animation to complete
        }
    }
}

// Add animation handlers for X button (separate from initialization)
function addXButtonAnimation() {
    const closeButton = document.getElementById('close-mobile-menu');
    if (closeButton) {
        closeButton.addEventListener('mousedown', function() {
            this.style.transform = 'scale(1.1)';
        });
        closeButton.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        closeButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        console.log('X button animation handlers added');
    }
}

// Initialize background video
function initializeBackgroundVideo() {
    const video = document.getElementById('background-video');
    if (video) {
        // Ensure video plays and loops
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        
        // Try to play the video
        video.play().catch(function(error) {
            console.log('Video autoplay prevented:', error);
            // On some browsers, autoplay might be blocked
            // The video will still be ready when user interacts with page
        });
        
        // Restart video if it ends (backup for loop)
        video.addEventListener('ended', function() {
            video.currentTime = 0;
            video.play();
        });
    }
}

// Call initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    initializeSocialLinks();
    initializeMobileMenu();
    initializeBackgroundVideo();
    
    // Add X button animation with a small delay to ensure element exists
    setTimeout(() => {
        addXButtonAnimation();
    }, 100);
});

// Cursor glow effect
function initializeCursorGlow() {
    // Create glow element
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.cssText = `
        position: fixed;
        width: 60px;
        height: 60px;
        background: radial-gradient(circle, rgba(200, 255, 255, 0.95) 0%, rgba(150, 255, 255, 0.3) 40%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999999;
        transition: transform 0.05s ease;
        transform: translate(-50%, -50%);
    `;
    document.body.appendChild(glow);
    
    // Track mouse movement
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Perfect tracking animation loop
    function animateGlow() {
        // Perfect tracking - no delay
        glowX = mouseX;
        glowY = mouseY;
        
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        
        requestAnimationFrame(animateGlow);
    }
    
    animateGlow();
    
    // Hide glow when cursor leaves window
    document.addEventListener('mouseleave', function() {
        glow.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', function() {
        glow.style.opacity = '1';
    });
}

// Clean scrolling experience - no visual indicators