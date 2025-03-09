// Use modern passive event listeners to improve scrolling performance
document.addEventListener('DOMContentLoaded', function() {
    // Improved performance for hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('show');
            console.log('Hamburger toggled:', navMenu.classList.contains('show'));
        }, { passive: true });
    } else {
        console.warn('Hamburger or nav menu not found');
    }

    // Theme toggle with improved performance
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Apply theme immediately to prevent flash of incorrect theme
    if (themeToggle) {
        // Get theme from localStorage but fall back to prefers-color-scheme
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            body.classList.add('dark-theme');
            console.log('Applied saved dark theme or system preference');
        } else {
            console.log('No saved theme or light theme applied');
        }

        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            console.log('Theme toggled to:', isDark ? 'dark' : 'light');
        }, { passive: true });
    } else {
        console.error('Theme toggle button not found');
    }

    // Optimized prayer times function with caching
    async function getPrayerTimes() {
        try {
            // Check for cached prayer times from today
            const today = new Date().toISOString().split('T')[0];
            const cachedTimes = localStorage.getItem(`prayer_times_${today}`);
            
            if (cachedTimes) {
                // Use cached times if available
                console.log('Using cached prayer times');
                updatePrayerTimesUI(JSON.parse(cachedTimes));
                return;
            }
            
            // If no cache, fetch from API
            const latitude = 6.8061; // Latitude for Bagotville, Guyana
            const longitude = -58.1817; // Longitude for Bagotville, Guyana
            
            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            console.log('Fetching prayer times with lat/long');
            const response = await fetch(
                `https://api.aladhan.com/v1/timings/${today}?latitude=${latitude}&longitude=${longitude}&method=2`, 
                { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error('Prayer API response not OK');
            
            const data = await response.json();
            
            // Cache the result
            localStorage.setItem(`prayer_times_${today}`, JSON.stringify(data.data.timings));
            console.log('Prayer times fetched successfully and cached');
            
            // Update UI
            updatePrayerTimesUI(data.data.timings);
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            
            // Use fallback times if fetch fails
            const fallbackTimes = {
                'Fajr': '05:30', 
                'Dhuhr': '12:00',
                'Asr': '15:30',
                'Maghrib': '18:00',
                'Isha': '19:30',
            };
            
            console.log('Using fallback prayer times');
            updatePrayerTimesUI(fallbackTimes);
        }
    }

    // Separate function for updating UI
    function updatePrayerTimesUI(times) {
        if (document.getElementById('fajr-time')) document.getElementById('fajr-time').textContent = times.Fajr;
        if (document.getElementById('dhuhr-time')) document.getElementById('dhuhr-time').textContent = times.Dhuhr;
        if (document.getElementById('asr-time')) document.getElementById('asr-time').textContent = times.Asr;
        if (document.getElementById('maghrib-time')) document.getElementById('maghrib-time').textContent = times.Maghrib;
        if (document.getElementById('isha-time')) document.getElementById('isha-time').textContent = times.Isha;
        if (document.getElementById('jumuah-time')) document.getElementById('jumuah-time').textContent = '12:20';
    }

    // Only fetch prayer times if the element exists on the page
    if (document.querySelector('.prayer-times')) {
        getPrayerTimes();
    }

    // Quran functionality with improved error handling and performance
    const surahSelect = document.getElementById('surah-select');
    const toggleArabic = document.getElementById('toggle-arabic');
    const toggleTranslation = document.getElementById('toggle-translation');
    const toggleTransliteration = document.getElementById('toggle-transliteration');
    const arabicText = document.getElementById('arabic-text');
    const englishText = document.getElementById('english-text');
    const transliterationText = document.getElementById('transliteration-text');

    if (surahSelect && toggleArabic && toggleTranslation && toggleTransliteration && arabicText && englishText && transliterationText) {
        // Cache for surahs to reduce API calls
        const surahCache = {};
        
        // Fetch surah list
        const fetchSurahList = async () => {
            try {
                // Check if we have cached the list
                const cachedList = localStorage.getItem('surah_list');
                if (cachedList) {
                    const data = JSON.parse(cachedList);
                    populateSurahList(data);
                    return;
                }
                
                // No cache, fetch from API
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch('https://api.alquran.cloud/v1/surah', { 
                    signal: controller.signal 
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error('Failed to fetch surah list');
                
                const data = await response.json();
                
                // Cache the list for future use
                localStorage.setItem('surah_list', JSON.stringify(data));
                
                populateSurahList(data);
            } catch (error) {
                console.error('Error fetching surah list:', error);
                surahSelect.innerHTML = '<option value="">Failed to load surahs. Please try again later.</option>';
            }
        };
        
        // Populate dropdown with surahs
        const populateSurahList = (data) => {
            // Clear existing options except the default
            while (surahSelect.options.length > 1) {
                surahSelect.remove(1);
            }
            
            // Add each surah to the dropdown
            data.data.forEach(surah => {
                const option = document.createElement('option');
                option.value = surah.number;
                option.textContent = `${surah.number}. ${surah.englishName} (${surah.name})`;
                surahSelect.appendChild(option);
            });
        };
        
        // Start fetching the list
        fetchSurahList();

        // Fetch and display selected surah with improved caching
        surahSelect.addEventListener('change', async function() {
            const surahNumber = this.value;
            if (!surahNumber) return;
            
            // Show loading indicators
            arabicText.innerHTML = '<p>Loading Arabic text...</p>';
            englishText.innerHTML = '<p>Loading English translation...</p>';
            transliterationText.innerHTML = '<p>Loading transliteration...</p>';
            
            try {
                // Set up functions to fetch different texts with caching
                const fetchAndDisplayText = async (endpoint, element, cacheKey) => {
                    // Check cache first
                    const cacheData = localStorage.getItem(cacheKey);
                    if (cacheData) {
                        displaySurahText(JSON.parse(cacheData), element);
                        return;
                    }
                    
                    // Fetch from API
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000);
                    
                    try {
                        const response = await fetch(endpoint, { signal: controller.signal });
                        clearTimeout(timeoutId);
                        
                        if (!response.ok) throw new Error(`Error fetching from ${endpoint}`);
                        
                        const data = await response.json();
                        
                        // Cache the result
                        localStorage.setItem(cacheKey, JSON.stringify(data));
                        
                        // Display the text
                        displaySurahText(data, element);
                    } catch (error) {
                        console.error(`Error fetching ${cacheKey}:`, error);
                        element.innerHTML = `<p>Failed to load text. Please try again later.</p>`;
                    }
                };
                
                // Function to display the surah text in the appropriate element
                const displaySurahText = (data, element) => {
                    element.innerHTML = '';
                    data.data.ayahs.forEach(ayah => {
                        const p = document.createElement('p');
                        p.textContent = `${ayah.text} (${ayah.numberInSurah})`;
                        element.appendChild(p);
                    });
                };
                
                // Fetch all three versions in parallel for better performance
                await Promise.all([
                    fetchAndDisplayText(
                        `https://api.alquran.cloud/v1/surah/${surahNumber}`,
                        arabicText,
                        `arabic_surah_${surahNumber}`
                    ),
                    fetchAndDisplayText(
                        `https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`,
                        englishText,
                        `english_surah_${surahNumber}`
                    ),
                    fetchAndDisplayText(
                        `https://api.alquran.cloud/v1/surah/${surahNumber}/en.transliteration`,
                        transliterationText,
                        `transliteration_surah_${surahNumber}`
                    )
                ]);
                
                // Ensure Arabic text is visible by default
                arabicText.style.display = 'block';
                toggleArabic.textContent = 'Hide Arabic Text';
            } catch (error) {
                console.error('Error loading surah:', error);
            }
        });

        // Toggle text visibility with simplified code
        const setupToggle = (button, element, showText, hideText) => {
            button.addEventListener('click', function() {
                const isHidden = element.style.display === 'none' || element.style.display === '';
                element.style.display = isHidden ? 'block' : 'none';
                this.textContent = isHidden ? hideText : showText;
            }, { passive: true });
        };
        
        setupToggle(toggleArabic, arabicText, 'Show Arabic Text', 'Hide Arabic Text');
        setupToggle(toggleTranslation, englishText, 'Show English Translation', 'Hide English Translation');
        setupToggle(toggleTransliteration, transliterationText, 'Show Transliteration', 'Hide Transliteration');
    }

    // Lazy load images that are off-screen
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        // Apply to all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imgObserver.observe(img);
        });
    }

    // Improved video controls for gallery
    const videos = document.querySelectorAll('.gallery-video');
    videos.forEach(video => {
        // Mute videos by default to prevent audio playback unless user interacts
        video.muted = true;
        
        // Add event listeners for custom behavior with passive option for better performance
        video.addEventListener('click', () => {
            if (video.paused) {
                // Attempt to pause all other videos first
                videos.forEach(v => {
                    if (v !== video && !v.paused) v.pause();
                });
                video.play().catch(err => console.error('Video play error:', err));
            } else {
                video.pause();
            }
        }, { passive: true });
        
        // Add error handling for videos
        video.addEventListener('error', function() {
            console.error('Video error:', this.error);
            this.insertAdjacentHTML('afterend', '<p class="video-error">Video could not be loaded. Please try again later.</p>');
        });
    });

    // Gallery filter dropdown with improved performance
    const galleryFilter = document.getElementById('gallery-filter');
    const galleryVideos = document.getElementById('gallery-videos');
    const galleryImages = document.getElementById('gallery-images');

    if (galleryFilter && galleryVideos && galleryImages) {
        // Use a more efficient approach that doesn't trigger reflows
        galleryFilter.addEventListener('change', function() {
            const filterValue = this.value;
            
            // Apply classes in one batch to minimize reflows
            requestAnimationFrame(() => {
                if (filterValue === 'videos') {
                    galleryVideos.classList.remove('hidden');
                    galleryImages.classList.add('hidden');
                } else if (filterValue === 'images') {
                    galleryVideos.classList.add('hidden');
                    galleryImages.classList.remove('hidden');
                } else { // 'all'
                    galleryVideos.classList.remove('hidden');
                    galleryImages.classList.remove('hidden');
                }
            });
        }, { passive: true });

        // Set initial state to show all (default option)
        galleryVideos.classList.remove('hidden');
        galleryImages.classList.remove('hidden');
    }

    // Optimize gallery image preview with proper event delegation
    const galleryGrid = document.querySelector('.gallery-grid');
    const previewModal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');
    const closePreview = document.querySelector('.close-preview');

    if (galleryGrid && previewModal && previewImage && closePreview) {
        console.log('Image preview elements found');
        
        // Helper function to close modal
        function closePreviewModal() {
            console.log('Closing preview');
            previewModal.classList.remove('show');
            document.body.style.overflow = 'auto'; // Restore scrolling
            // Clear the src after animation completes to save memory
            setTimeout(() => {
                if (!previewModal.classList.contains('show')) {
                    previewImage.src = '';
                }
            }, 300);
        }
        
        // Use event delegation instead of adding listeners to each image
        galleryGrid.addEventListener('click', function(e) {
            const clickedImage = e.target.closest('.gallery-image');
            if (clickedImage) {
                console.log('Image clicked:', clickedImage.getAttribute('data-preview'));
                const previewSrc = clickedImage.getAttribute('data-preview');
                if (previewSrc) {
                    previewImage.src = previewSrc;
                    previewModal.classList.add('show');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
                } else {
                    console.error('No data-preview attribute found on image');
                }
            }
        }, { passive: true });

        // Close preview
        closePreview.addEventListener('click', closePreviewModal, { passive: true });

        // Close preview by clicking outside
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal) {
                console.log('Closing preview by clicking outside');
                closePreviewModal();
            }
        }, { passive: true });

        // Close preview with Esc key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && previewModal.classList.contains('show')) {
                console.log('Closing preview with Esc key');
                closePreviewModal();
            }
        });
    } else {
        console.error('One or more image preview elements not found');
    }
    
    // Clean up old cache entries to prevent storage overflow
    function cleanupOldCache() {
        try {
            // Keep only the most recent 7 days of prayer times
            const now = new Date();
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('prayer_times_')) {
                    const dateStr = key.replace('prayer_times_', '');
                    const date = new Date(dateStr);
                    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                    if (daysDiff > 7) {
                        localStorage.removeItem(key);
                    }
                }
            }
            
            // Clear very old Quran caches (older than 30 days)
            const cacheTimestamp = localStorage.getItem('quran_cache_timestamp');
            if (!cacheTimestamp || (Date.now() - parseInt(cacheTimestamp)) > (30 * 24 * 60 * 60 * 1000)) {
                // Clear all surah caches but keep the list
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('arabic_surah_') || 
                               key.startsWith('english_surah_') || 
                               key.startsWith('transliteration_surah_'))) {
                        localStorage.removeItem(key);
                    }
                }
                localStorage.setItem('quran_cache_timestamp', Date.now());
            }
        } catch (e) {
            console.error('Error cleaning cache:', e);
        }
    }
    
    // Run cache cleanup once per visit
    cleanupOldCache();
    
    // =========== FACEBOOK INTEGRATION START ===========
    
    // 1. Update all Facebook links to the correct URL
    const facebookLinks = document.querySelectorAll('.social-media a');
    facebookLinks.forEach(link => {
        if (link.textContent === 'Facebook') {
            link.href = 'https://www.facebook.com/profile.php?id=100081668231878';
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // 2. Create and insert Facebook Live notification component
    const notificationHTML = `
        <div id="fb-live-notification" class="fb-live-notification" style="display: none;">
            <div class="notification-content">
                <span class="live-icon">🔴 LIVE</span>
                <span class="notification-message">We're live on Facebook now!</span>
                <a href="https://www.facebook.com/profile.php?id=100081668231878" target="_blank" rel="noopener noreferrer" class="notification-link">Join us</a>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', notificationHTML);
    
    // 3. Add styles for the notification
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        .fb-live-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 0.8rem 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px var(--shadow-color);
            z-index: 9999;
            max-width: 300px;
            animation: slideInRight 0.5s ease-out;
            transform-origin: top right;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .live-icon {
            font-weight: bold;
            display: inline-flex;
            align-items: center;
        }
        
        .notification-link {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            text-decoration: none;
            font-size: 0.8rem;
            transition: background 0.3s ease;
        }
        
        .notification-link:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .notification-close {
            background: transparent;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            line-height: 1;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .dark-theme .fb-live-notification {
            background: var(--secondary-color);
        }
        
        @media (max-width: 480px) {
            .fb-live-notification {
                top: 80px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(styleTag);
    
    // 4. Add event listener for close button
    const closeButton = document.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            document.getElementById('fb-live-notification').style.display = 'none';
            // Save state in session storage so it doesn't show again this session
            sessionStorage.setItem('fbLiveNotificationClosed', 'true');
        }, { passive: true });
    }
    
    // 5. GitHub Pages compatible Live notification solutions
    
    // OPTION 1: Manual configuration using a JSON file
    // Create a file named fb-live-status.json in your repository with content: {"isLive": false}
    // When you go live, update this file to: {"isLive": true}
    function checkManualLiveStatus() {
        fetch('fb-live-status.json')
            .then(response => response.json())
            .then(data => {
                if (data.isLive) {
                    showLiveNotification(true);
                } else {
                    showLiveNotification(false);
                }
            })
            .catch(error => {
                console.error('Error checking live status:', error);
                // Fallback to scheduled check in case of error
                checkScheduledLiveStatus();
            });
    }
    
    // OPTION 2: Test schedule for 9:50 AM (for testing purposes)
function checkScheduledLiveStatus() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Check if time is between 9:50 AM and 10:50 AM (test session)
    // This will activate the notification at 9:50 AM and keep it active for 1 hour
    const isLiveHour = (hours === 9 && minutes >= 50) || (hours === 10 && minutes < 50);
    
    console.log("Time check:", hours + ":" + minutes, "Is live hour:", isLiveHour);
    
    if (isLiveHour) {
        showLiveNotification(true);
        console.log("Live notification should be showing (by schedule)");
    } else {
        showLiveNotification(false);
    }
}
    
    // Start with query param check, which cascades to other methods if needed
    checkQueryParamOverride();
    
    // Periodically check status (every 5 minutes)
    setInterval(checkQueryParamOverride, 5 * 60 * 1000);
    
    // =========== FACEBOOK INTEGRATION END ===========
});
