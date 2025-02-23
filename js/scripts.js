document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('show');
            console.log('Hamburger toggled:', navMenu.classList.contains('show'));
        });
    } else {
        console.warn('Hamburger or nav menu not found');
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            console.log('Applied saved dark theme');
        } else {
            console.log('No saved theme or light theme applied');
        }

        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            console.log('Theme toggled to:', isDark ? 'dark' : 'light');
        });
    } else {
        console.error('Theme toggle button not found');
    }

    // Dynamic prayer times using latitude and longitude
    async function getPrayerTimes() {
        try {
            const latitude = 6.8061; // Latitude for Bagotville, Guyana
            const longitude = -58.1817; // Longitude for Bagotville, Guyana
            const response = await fetch(`https://api.aladhan.com/v1/timings/${new Date().toISOString().split('T')[0]}?latitude=${latitude}&longitude=${longitude}&method=2`);
            const data = await response.json();
            const times = data.data.timings;
            if (document.getElementById('fajr-time')) document.getElementById('fajr-time').textContent = times.Fajr;
            if (document.getElementById('dhuhr-time')) document.getElementById('dhuhr-time').textContent = times.Dhuhr;
            if (document.getElementById('asr-time')) document.getElementById('asr-time').textContent = times.Asr;
            if (document.getElementById('maghrib-time')) document.getElementById('maghrib-time').textContent = times.Maghrib;
            if (document.getElementById('isha-time')) document.getElementById('isha-time').textContent = times.Isha;
            if (document.getElementById('jumuah-time')) document.getElementById('jumuah-time').textContent = '12:20 PM';
            console.log('Prayer times fetched successfully with lat/long');
        } catch (error) {
            console.error('Error fetching prayer times:', error);
        }
    }

    if (document.querySelector('.prayer-times')) {
        getPrayerTimes();
    }

    // Quran functionality
    const surahSelect = document.getElementById('surah-select');
    const toggleArabic = document.getElementById('toggle-arabic');
    const toggleTranslation = document.getElementById('toggle-translation');
    const toggleTransliteration = document.getElementById('toggle-transliteration');
    const arabicText = document.getElementById('arabic-text');
    const englishText = document.getElementById('english-text');
    const transliterationText = document.getElementById('transliteration-text');

    if (surahSelect && toggleArabic && toggleTranslation && toggleTransliteration && arabicText && englishText && transliterationText) {
        // Fetch surah list
        fetch('https://api.alquran.cloud/v1/surah')
            .then(response => response.json())
            .then(data => {
                data.data.forEach(surah => {
                    const option = document.createElement('option');
                    option.value = surah.number;
                    option.textContent = `${surah.number}. ${surah.englishName} (${surah.name})`;
                    surahSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching surah list:', error));

        // Fetch and display selected surah
        surahSelect.addEventListener('change', function() {
            const surahNumber = this.value;
            if (surahNumber) {
                // Fetch Arabic text
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
                    .then(response => response.json())
                    .then(data => {
                        arabicText.innerHTML = '';
                        data.data.ayahs.forEach(ayah => {
                            const p = document.createElement('p');
                            p.textContent = `${ayah.text} (${ayah.numberInSurah})`;
                            arabicText.appendChild(p);
                        });
                        // Ensure Arabic text is visible by default
                        arabicText.style.display = 'block';
                        toggleArabic.textContent = 'Hide Arabic Text';
                    })
                    .catch(error => console.error('Error fetching Arabic text:', error));

                // Fetch English translation (Sahih International)
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`)
                    .then(response => response.json())
                    .then(data => {
                        englishText.innerHTML = '';
                        data.data.ayahs.forEach(ayah => {
                            const p = document.createElement('p');
                            p.textContent = `${ayah.text} (${ayah.numberInSurah})`;
                            englishText.appendChild(p);
                        });
                    })
                    .catch(error => console.error('Error fetching English text:', error));

                // Fetch transliteration (English phonetic)
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.transliteration`)
                    .then(response => response.json())
                    .then(data => {
                        transliterationText.innerHTML = '';
                        data.data.ayahs.forEach(ayah => {
                            const p = document.createElement('p');
                            p.textContent = `${ayah.text} (${ayah.numberInSurah})`;
                            transliterationText.appendChild(p);
                        });
                    })
                    .catch(error => console.error('Error fetching transliteration:', error));
            }
        });

        // Toggle Arabic text visibility
        toggleArabic.addEventListener('click', function() {
            if (arabicText.style.display === 'none' || arabicText.style.display === '') {
                arabicText.style.display = 'block';
                this.textContent = 'Hide Arabic Text';
            } else {
                arabicText.style.display = 'none';
                this.textContent = 'Show Arabic Text';
            }
        });

        // Toggle English translation visibility
        toggleTranslation.addEventListener('click', function() {
            if (englishText.style.display === 'none' || englishText.style.display === '') {
                englishText.style.display = 'block';
                this.textContent = 'Hide English Translation';
            } else {
                englishText.style.display = 'none';
                this.textContent = 'Show English Translation';
            }
        });

        // Toggle transliteration visibility
        toggleTransliteration.addEventListener('click', function() {
            if (transliterationText.style.display === 'none' || transliterationText.style.display === '') {
                transliterationText.style.display = 'block';
                this.textContent = 'Hide Transliteration';
            } else {
                transliterationText.style.display = 'none';
                this.textContent = 'Show Transliteration';
            }
        });
    }

    // Optional: Add custom video controls or behaviors for gallery videos
    const videos = document.querySelectorAll('.gallery-video');
    videos.forEach(video => {
        // Mute videos by default to prevent audio playback unless user interacts
        video.muted = true;
        // Optional: Autoplay with muted state (if allowed by browser policy)
        // video.autoplay = true;
        // Add event listeners for custom behavior (e.g., play on click)
        video.addEventListener('click', () => {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
    });

    // Gallery filter dropdown functionality
    const galleryFilter = document.getElementById('gallery-filter');
    const galleryVideos = document.getElementById('gallery-videos');
    const galleryImages = document.getElementById('gallery-images');

    if (galleryFilter && galleryVideos && galleryImages) {
        galleryFilter.addEventListener('change', function() {
            const filterValue = this.value;

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

        // Set initial state to show all (default option)
        galleryVideos.classList.remove('hidden');
        galleryImages.classList.remove('hidden');
    }

    // Image Preview Modal Functionality
    const galleryImagesPreview = document.querySelectorAll('.gallery-image');
    const previewModal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');
    const closePreview = document.querySelector('.close-preview');

    if (galleryImagesPreview && previewModal && previewImage && closePreview) {
        console.log('Image preview elements found:', { galleryImagesPreview, previewModal, previewImage, closePreview });

        // Show preview on image click
        galleryImagesPreview.forEach(image => {
            image.addEventListener('click', function() {
                console.log('Image clicked:', this.getAttribute('data-preview'));
                const previewSrc = this.getAttribute('data-preview');
                if (previewSrc) {
                    previewImage.src = previewSrc;
                    previewModal.classList.add('show');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
                } else {
                    console.error('No data-preview attribute found on image:', this);
                }
            });
        });

        // Close preview
        closePreview.addEventListener('click', function() {
            console.log('Closing preview');
            previewModal.classList.remove('show');
            previewImage.src = '';
            document.body.style.overflow = 'auto'; // Restore scrolling
        });

        // Close preview by clicking outside
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal) {
                console.log('Closing preview by clicking outside');
                previewModal.classList.remove('show');
                previewImage.src = '';
                document.body.style.overflow = 'auto'; // Restore scrolling
            }
        });

        // Close preview with Esc key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && previewModal.classList.contains('show')) {
                console.log('Closing preview with Esc key');
                previewModal.classList.remove('show');
                previewImage.src = '';
                document.body.style.overflow = 'auto'; // Restore scrolling
            }
        });
    } else {
        console.error('One or more image preview elements not found:', { galleryImagesPreview, previewModal, previewImage, closePreview });
    }
});
