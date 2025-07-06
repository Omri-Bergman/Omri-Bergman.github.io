// navbar.js - Grid-based navbar system that matches homePageScript.js grid
class UniversalNavbar {
    constructor() {
        this.navData = [
            {
                headline: "עמוד בית",
                mode: "pixelation",
            },
            {
                headline: "דבר העורכים",
                mode: "effects",
                items: [
                    { title: "מאמר פתיחה", author: "יוסי כהן" },
                    { title: "הקדמה", author: "שרה לוי" }
                ]
            },
            {
                headline: "השפעות", 
                mode: "delay",
                items: [
                    { title: "השפעה א", author: "דנה ישראלי" },
                    { title: "השפעה ב", author: "רון ברק" }
                ]
            },
            {
                headline: "סדרות",
                mode: "zoom",
                items: [
                    { title: "התפתחות הדמויות בסדרות טלוויזיה: מסגרת של מערכת אקולוגית נרטיבית", author: "ורוניקה אינוצ'נטי וגוליילמו פסקאטורה" },
                    { title: "מתחת לברדס הצדק: טראומת הגזע וחזרתיות באקוסיסטם השומרים", author: "יונתן אונגר" },
                    { title: "בחזרה לטווין פיקס דרך הקריסטל", author: "ליאור פרלשטיין" },
                    { title: "האחיות בראון: זמן וחזרתיות בסדרת התצלומים של ניקולס ניקסון", author: "מיה פרנקל טנא" }
                ]
            },
            {
                headline: "רימייקים",
                mode: "effects", 
                items: [
                    { title: "101 דרכים להבחין בין \"פסיכו\" של היצ'קוק ל\"פסיכו\" של גאס ואן סנט", author: "תומס מ. ליטש" }
                ]
            },
            {
                headline: "אפילוג",
                mode: "pixelation",
            },
            {
                headline: "ואל מסך תשוב",
                mode: "effects",
                items: [
                    { title: "אוצרות 1", author: "אורי בן דוד" },
                    { title: "אוצרות 2", author: "רונית שחר" }
                ]
            }
        ];

        this.activeNavIndex = -1;
        this.isHomepage = this.detectHomepage();
        this.gridOverlay = null;
        this.isGridVisible = false;
        
        this.init();
    }

    detectHomepage() {
        return document.getElementById('container') && document.getElementById('video');
    }

    init() {
        this.createCornerButton();
        this.createGridOverlay();
        
        if (this.isHomepage) {
            this.handleHomepageLoad();
        }

        // Handle window resize to recalculate grid and update button size
        window.addEventListener('resize', () => this.handleResize());
        
        // Ensure button size is correct after everything is initialized
        setTimeout(() => this.updateButtonSize(), 100);
    }

    createCornerButton() {
        // Remove existing navbar if it exists
        const existingNav = document.getElementById('navbar');
        if (existingNav && existingNav.parentNode) {
            existingNav.parentNode.removeChild(existingNav);
        }

        // Remove any existing corner button to prevent duplicates
        const existingCornerButton = document.querySelector('.navbar-corner-button');
        if (existingCornerButton && existingCornerButton.parentNode) {
            existingCornerButton.parentNode.removeChild(existingCornerButton);
        }

        // Create corner button
        this.cornerButton = document.createElement('button');
        this.cornerButton.className = 'navbar-corner-button';
        this.cornerButton.onclick = () => this.toggleGrid();

        // Set initial text based on current section
        this.updateButtonText();

        // Set button size to match one panel exactly
        this.updateButtonSize();

        // Add to page
        document.body.appendChild(this.cornerButton);
    }

    updateButtonSize() {
        if (!this.cornerButton) return;

        // Calculate exact panel dimensions and positioning using the same logic as homePageScript.js
        const { cols, rows, squareWidth, squareHeight } = this.calculateGridDimensions();

        // Apply the exact panel dimensions to the button
        this.cornerButton.style.width = `${squareWidth}px`;
        this.cornerButton.style.height = `${squareHeight}px`;
        this.cornerButton.style.minWidth = `${squareWidth}px`;
        this.cornerButton.style.maxWidth = `${squareWidth}px`;
        this.cornerButton.style.minHeight = `${squareHeight}px`;
        this.cornerButton.style.maxHeight = `${squareHeight}px`;

        // Position button exactly on top of bottom-left panel using same logic as homePageScript.js
        // Bottom-left panel is: col=0, row=rows-1
        const bottomLeftCol = 0;
        const bottomLeftRow = rows - 1;
        
        // Calculate exact pixel position (same as Three.js grid but converted to DOM coordinates)
        const bottomLeftPanelLeft = bottomLeftCol * squareWidth;
        const bottomLeftPanelTop = bottomLeftRow * squareHeight;
        
        // Apply positioning with pixel-perfect precision
        this.cornerButton.style.left = `${Math.round(bottomLeftPanelLeft)}px`;
        this.cornerButton.style.top = `${Math.round(bottomLeftPanelTop)}px`;
        
        // Force hardware acceleration for smooth rendering
        this.cornerButton.style.transform = 'translate3d(0, 0, 0)';

        // Calculate responsive font size based on panel size and text length
        const minDimension = Math.min(squareWidth, squareHeight);
        const currentText = this.cornerButton.textContent || '';
        
        // Base font size as percentage of panel size
        let baseFontSize = minDimension * 0.2; // 20% of the smaller dimension
        
        // Adjust font size based on text length to prevent overflow
        if (currentText.length > 10) {
            // For longer texts like "ואל מסך תשוב", reduce font size
            baseFontSize = minDimension * 0.15; // 15% for longer texts
        } else if (currentText.length > 6) {
            // For medium-length texts, slightly reduce font size
            baseFontSize = minDimension * 0.18; // 18% for medium texts
        }
        
        this.cornerButton.style.fontSize = `${baseFontSize}px`;

        // console.log(`📐 Button positioned at bottom-left: col=${bottomLeftCol}, row=${bottomLeftRow}`);
        // console.log(`📐 Button position: left=${Math.round(bottomLeftPanelLeft)}px, top=${Math.round(bottomLeftPanelTop)}px`);
        // console.log(`📐 Button size: ${squareWidth.toFixed(1)}px × ${squareHeight.toFixed(1)}px`);
        // console.log(`📐 Screen: ${window.innerWidth}px × ${window.innerHeight}px, Grid: ${cols}×${rows}`);
    }

    getCurrentSection() {
        // Detect current section based on URL path
        const currentPath = window.location.pathname;
        
        console.log(`🔍 getCurrentSection - currentPath: "${currentPath}", activeNavIndex: ${this.activeNavIndex}`);
        
        // FIRST: Check if activeNavIndex is set (when navigating from grid) - this takes priority
        if (this.activeNavIndex >= 0 && this.activeNavIndex < this.navData.length) {
            const sectionName = this.navData[this.activeNavIndex].headline;
            console.log(`✅ Using activeNavIndex ${this.activeNavIndex}: "${sectionName}"`);
            return sectionName;
        }
        
        // Check for specific article paths
        if (currentPath.includes('editors.html')) {
            console.log(`✅ Detected editors.html - returning "דבר העורכים"`);
            return 'דבר העורכים'; // This is the editors page
        }
        
        if (currentPath.includes('fatFemaleBody.html')) {
            console.log(`✅ Detected fatFemaleBody.html - returning "השפעות"`);
            return 'השפעות'; // This article is in the "השפעות" section
        }
        
        if (currentPath.includes('twinPeaks.html')) {
            console.log(`✅ Detected twinPeaks.html - returning "סדרות"`);
            return 'סדרות'; // This article is in the "סדרות" section
        }
        
        if (currentPath.includes('psyco.html')) {
            console.log(`✅ Detected psyco.html - returning "רימייקים"`);
            return 'רימייקים'; // This article is in the "רימייקים" section
        }
        
        if (currentPath.includes('static-grid.html')) {
            console.log(`✅ Detected static-grid.html - returning "ואל מסך תשוב"`);
            return 'ואל מסך תשוב'; // This is the static grid page
        }
        
        // Add more path detection as needed for other articles/sections
        if (currentPath.includes('articles/')) {
            console.log(`✅ Detected articles/ path - returning "מאמרים"`);
            return 'מאמרים'; // Generic articles section
        }
        
        // Check if we're on home page (last, since this is the most common case)
        if (currentPath === '/' || currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath === '') {
            console.log(`✅ Detected homepage - returning "גחליליות"`);
            return 'עמוד בית'; // Main title for homepage
        }
        
        // Default fallback
        console.log(`⚠️ No section detected - returning fallback "תפריט"`);
        return 'תפריט';
    }

    updateButtonText() {
        if (this.cornerButton) {
            if (this.isGridVisible) {
                // When grid is visible, show "תפריט" to indicate close action
                this.cornerButton.textContent = 'תפריט';
            } else {
                // When grid is hidden, show current section
                const currentSection = this.getCurrentSection();
                this.cornerButton.textContent = currentSection;
            }
            
            // Recalculate font size after text change (since font size depends on text length)
            this.updateButtonSize();
        }
    }

    createGridOverlay() {
        // Remove any existing grid overlay to prevent duplicates
        const existingOverlay = document.querySelector('.navbar-grid-overlay');
        if (existingOverlay && existingOverlay.parentNode) {
            existingOverlay.parentNode.removeChild(existingOverlay);
        }

        // Create overlay container
        this.gridOverlay = document.createElement('div');
        this.gridOverlay.className = 'navbar-grid-overlay';
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'navbar-grid-container';
        
        // Create close button
        // const closeButton = document.createElement('button');
        // closeButton.className = 'navbar-close-button';
        // closeButton.innerHTML = '×';
        // closeButton.onclick = () => this.hideGrid();
        
        this.gridOverlay.appendChild(gridContainer);
        // this.gridOverlay.appendChild(closeButton);
        document.body.appendChild(this.gridOverlay);

        // Close overlay when clicking on blank areas
        this.gridOverlay.addEventListener('click', (e) => {
            if (e.target === this.gridOverlay || e.target.classList.contains('blank')) {
                this.hideGrid();
            }
        });
    }

    calculateGridDimensions() {
        // Use EXACT same logic as homePageScript.js createFacePlanes()
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Adjust target face size based on total pixel count for performance
        const totalPixels = screenWidth * screenHeight;
        let targetFaceSize;

        // Check if mobile device (width < 768px is common mobile breakpoint)
        const isMobile = screenWidth < 768;

        if (isMobile) {
            // MOBILE: Smaller panels = MORE panels
            targetFaceSize = 100; // Much smaller = more panels
        } else {
            // DESKTOP: Keep existing logic unchanged
            if (totalPixels > 3840 * 2160) { // 4K+
                targetFaceSize = 200;
            } else if (totalPixels > 1920 * 1080) { // 1440p
                targetFaceSize = 170;
            } else { // 1080p and below
                targetFaceSize = 150;
            }
        }

        const cols = Math.ceil(screenWidth / targetFaceSize);
        const rows = Math.ceil(screenHeight / targetFaceSize);
        const totalSquares = cols * rows;

        // Calculate exact square dimensions to fill screen completely
        const squareWidth = screenWidth / cols;
        const squareHeight = screenHeight / rows;

        return {
            cols,
            rows,
            totalSquares,
            squareWidth,
            squareHeight
        };
    }

    populateGrid() {
        const gridContainer = this.gridOverlay.querySelector('.navbar-grid-container');
        const { cols, rows, totalSquares } = this.calculateGridDimensions();

        // Clear existing grid
        gridContainer.innerHTML = '';

        // Set CSS Grid properties
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // Create array of all square indices
        const allIndices = Array.from({ length: totalSquares }, (_, i) => i);
        
        // Randomly select positions for navbar items
        const navPositions = this.selectRandomPositions(allIndices, this.navData.length);

        // Create all grid squares
        for (let i = 0; i < totalSquares; i++) {
            const square = document.createElement('div');
            square.className = 'navbar-grid-square';

            // Check if this position should contain a nav item
            const navIndex = navPositions.indexOf(i);
            if (navIndex !== -1) {
                // This square contains a navbar item
                square.classList.add('nav-item');
                square.textContent = this.navData[navIndex].headline;
                square.dataset.navIndex = navIndex;
                
                // Add click handler
                square.onclick = (e) => {
                    e.stopPropagation();
                    this.handleNavClick(navIndex, this.navData[navIndex]);
                };

                // Add active state if this is the current active nav
                if (this.activeNavIndex === navIndex) {
                    square.classList.add('nav-item-active');
                }
            } else {
                // This is a blank square
                square.classList.add('blank');
            }

            gridContainer.appendChild(square);
        }

        console.log(`🎯 Created ${cols}x${rows} grid (${totalSquares} squares) with ${this.navData.length} nav items randomly positioned`);
    }

    selectRandomPositions(allIndices, count) {
        // Randomly select positions for navbar items, ensuring good distribution
        // Exclude the bottom-left area where the corner button is located
        const { cols, rows } = this.calculateGridDimensions();
        
        // Calculate which squares the button overlaps
        // Button size matches one panel exactly and is positioned at bottom-left
        const buttonArea = this.calculateButtonOverlapSquares(cols, rows);
        
        const positions = [];
        const availableIndices = [...allIndices].filter(index => !buttonArea.includes(index));

        for (let i = 0; i < count && availableIndices.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableIndices.length);
            const selectedPosition = availableIndices[randomIndex];
            positions.push(selectedPosition);
            availableIndices.splice(randomIndex, 1);
        }

        console.log(`🚫 Excluded bottom-left area (${buttonArea.length} squares: ${buttonArea.join(', ')}) from navbar positioning`);
        return positions;
    }

    calculateButtonOverlapSquares(cols, rows) {
        // Calculate which grid squares the button overlaps with using actual button dimensions
        const { squareWidth, squareHeight } = this.calculateGridDimensions();
        
        // Button is positioned at bottom-left panel location
        const buttonLeft = 0; // First column
        const buttonTop = window.innerHeight - squareHeight; // Bottom row
        
        // Use actual panel dimensions for button size (since button matches panel size exactly)
        const buttonRight = buttonLeft + squareWidth;
        const buttonBottom = buttonTop + squareHeight;
        
        const overlappingSquares = [];
        
        // Check each square in the bottom-left area
        const startRow = Math.max(0, rows - 3); // Check last 3 rows max
        for (let row = startRow; row < rows; row++) {
            for (let col = 0; col < Math.min(3, cols); col++) { // Check first 3 columns max
                const squareLeft = col * squareWidth;
                const squareTop = row * squareHeight;
                const squareRight = squareLeft + squareWidth;
                const squareBottom = squareTop + squareHeight;
                
                // Check if button overlaps with this square
                const overlapsHorizontally = buttonLeft < squareRight && buttonRight > squareLeft;
                const overlapsVertically = buttonTop < squareBottom && buttonBottom > squareTop;
                
                if (overlapsHorizontally && overlapsVertically) {
                    const squareIndex = row * cols + col;
                    overlappingSquares.push(squareIndex);
                }
            }
        }
        
        // Always include bottom-left panel index as a safety measure
        const bottomLeftIndex = (rows - 1) * cols; // Last row, first column
        if (!overlappingSquares.includes(bottomLeftIndex)) {
            overlappingSquares.push(bottomLeftIndex);
        }
        
        return overlappingSquares;
    }

    toggleGrid() {
        if (this.isGridVisible) {
            this.hideGrid();
        } else {
            this.showGrid();
        }
    }

    showGrid() {
        this.populateGrid(); // Recreate grid with current dimensions
        this.gridOverlay.classList.add('active');
        this.isGridVisible = true;
        
        // Prevent body scrolling while grid is open
        document.body.style.overflow = 'hidden';
        
        // Update button text when grid is shown
        this.updateButtonText();
        
        console.log('📱 Grid navbar opened');
    }

    hideGrid() {
        this.gridOverlay.classList.remove('active');
        this.isGridVisible = false;
        
        // Restore body scrolling
        document.body.style.overflow = '';
        
        // Update button text when grid is hidden
        this.updateButtonText();
        
        console.log('📱 Grid navbar closed');
    }

    handleNavClick(idx, navItem) {
        console.log(`🎯 Nav item clicked: ${navItem.headline} (${navItem.mode})`);
        
        // Special case: "דבר העורכים" - navigate to editors page
        if (navItem.headline === "דבר העורכים") {
            console.log(`🎨 Navigating to editors page for: ${navItem.headline}`);
            const editorsUrl = this.getEditorsUrl();
            window.location.href = editorsUrl;
            return;
        }
        
        // Special case: "ואל מסך תשוב" - navigate to static grid page
        if (navItem.headline === "ואל מסך תשוב") {
            console.log(`🎨 Navigating to static grid page for: ${navItem.headline}`);
            const staticGridUrl = this.getStaticGridUrl();
            window.location.href = staticGridUrl;
            return;
        }
        
        if (this.isHomepage) {
            // Set the active nav item
            this.setActiveNav(idx);
            
            // On homepage: show content and set camera mode
            this.showCenterContent(idx);
            
            // Auto-start camera if not already running, THEN set mode
            if (window.multiFaceDisplay && !window.multiFaceDisplay.isRunning) {
                console.log('📹 Auto-starting camera...');
                window.multiFaceDisplay.startCamera().then(() => {
                    setTimeout(() => {
                        this.setCameraMode(navItem.mode, navItem.headline);
                        console.log(`🎯 Mode set to: ${navItem.mode} with headline: ${navItem.headline} AFTER camera initialization`);
                    }, 100);
                });
            } else {
                this.setCameraMode(navItem.mode, navItem.headline);
            }
            
            // Close the grid after selection
            this.hideGrid();
        } else {
            // On article page: navigate to homepage with mode parameter
            const homepageUrl = this.getHomepageUrl();
            console.log(`🚀 Navigating from article to homepage: ${homepageUrl}?mode=${navItem.mode}&nav=${idx}`);
            window.location.href = `${homepageUrl}?mode=${navItem.mode}&nav=${idx}`;
        }
    }

    setActiveNav(idx) {
        this.activeNavIndex = idx;
        
        // Update active state in grid if it's currently visible
        if (this.isGridVisible) {
            const navItems = this.gridOverlay.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.classList.remove('nav-item-active');
                if (parseInt(item.dataset.navIndex) === idx) {
                    item.classList.add('nav-item-active');
                }
            });
        }
        
        // Update button text to show current section
        this.updateButtonText();
    }

    showCenterContent(idx) {
        const display = document.getElementById('center-display');
        if (!display) return;

        const textDiv = display.querySelector('.center-display-text');
        const nav = this.navData[idx];
        
        if (textDiv) {
            textDiv.textContent = nav.headline;
        }
        
        display.style.display = 'block';
    }

    setCameraMode(mode, headline = null) {
        if (window.multiFaceDisplay) {
            if (headline && typeof window.multiFaceDisplay.setModeWithHeadline === 'function') {
                console.log(`🎯 Setting camera mode to: ${mode} with headline: ${headline}`);
                window.multiFaceDisplay.setModeWithHeadline(mode, headline);
            } else if (typeof window.multiFaceDisplay.setMode === 'function') {
                console.log(`🎯 Setting camera mode to: ${mode}`);
                window.multiFaceDisplay.setMode(mode);
            }
        } else {
            console.log(`⚠️ MultiFaceDisplay not available when trying to set mode: ${mode}`);
        }
    }

    handleHomepageLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const navIdx = urlParams.get('nav');

        console.log(`🏠 Homepage loading with URL params - mode: ${mode}, nav: ${navIdx}`);

        if (mode && navIdx !== null) {
            const idx = parseInt(navIdx);
            if (idx >= 0 && idx < this.navData.length) {
                const navItem = this.navData[idx];
                console.log(`✅ Setting homepage to nav item ${idx}: ${navItem.headline} with mode: ${mode}`);
                
                this.activeNavIndex = idx;
                
                setTimeout(() => {
                    this.showCenterContent(idx);
                    
                    // Auto-start camera if not already running, THEN set mode
                    if (window.multiFaceDisplay && !window.multiFaceDisplay.isRunning) {
                        console.log('📹 Auto-starting camera from URL navigation...');
                        window.multiFaceDisplay.startCamera().then(() => {
                            console.log('📹 Camera started, now setting mode...');
                            setTimeout(() => {
                                this.setCameraModeWithRetry(mode, navItem.headline, 3);
                            }, 200);
                        }).catch(error => {
                            console.error('❌ Failed to start camera:', error);
                            // Try to set mode anyway in case camera is already available
                            this.setCameraModeWithRetry(mode, navItem.headline, 3);
                        });
                    } else {
                        console.log('📹 Camera already running or not available, setting mode directly...');
                        this.setCameraModeWithRetry(mode, navItem.headline, 3);
                    }
                    
                    // Update button text to reflect current section
                    this.updateButtonText();
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 500);
            } else {
                console.log(`❌ Invalid nav index: ${idx} (should be 0-${this.navData.length - 1})`);
            }
        } else {
            console.log(`ℹ️ No URL parameters found for homepage load`);
        }
    }

    setCameraModeWithRetry(mode, headline = null, maxRetries = 3) {
        let attempts = 0;
        
        const attemptSetMode = () => {
            attempts++;
            console.log(`🔄 Attempt ${attempts}/${maxRetries} to set camera mode: ${mode}`);
            
            if (window.multiFaceDisplay) {
                // Set the camera mode
                this.setCameraMode(mode, headline);
                
                setTimeout(() => {
                    // Check if mode was set correctly using the getCurrentModeKey method
                    const currentMode = window.multiFaceDisplay.getCurrentModeKey ? window.multiFaceDisplay.getCurrentModeKey() : null;
                    if (currentMode && currentMode !== mode) {
                        console.log(`⚠️ Mode mismatch detected. Expected: ${mode}, Got: ${currentMode}`);
                        if (attempts < maxRetries) {
                            console.log(`🔄 Retrying to set mode...`);
                            setTimeout(attemptSetMode, 200);
                        } else {
                            console.log(`❌ Failed to set mode after ${maxRetries} attempts`);
                        }
                    } else {
                        console.log(`✅ Mode successfully set to: ${mode} (verified: ${currentMode})`);
                    }
                }, 100);
            } else {
                console.log(`⚠️ MultiFaceDisplay not available on attempt ${attempts}`);
                if (attempts < maxRetries) {
                    setTimeout(attemptSetMode, 300);
                }
            }
        };
        
        attemptSetMode();
    }

    getHomepageUrl() {
        const currentPath = window.location.pathname;
        const directoryPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const pathSegments = directoryPath.split('/').filter(segment => segment.length > 0);
        
        if (pathSegments.length === 0) {
            return './';
        } else {
            return '../'.repeat(pathSegments.length);
        }
    }

    getStaticGridUrl() {
        const currentPath = window.location.pathname;
        const directoryPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const pathSegments = directoryPath.split('/').filter(segment => segment.length > 0);
        
        if (pathSegments.length === 0) {
            // We're in the root directory
            return './articles/screen/static-grid.html';
        } else {
            // We're in a subdirectory, need to go back to root
            return '../'.repeat(pathSegments.length) + 'articles/screen/static-grid.html';
        }
    }
    
    getEditorsUrl() {
        const currentPath = window.location.pathname;
        const directoryPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const pathSegments = directoryPath.split('/').filter(segment => segment.length > 0);
        
        if (pathSegments.length === 0) {
            // We're in the root directory
            return './articles/editors/editors.html';
        } else {
            // We're in a subdirectory, need to go back to root
            return '../'.repeat(pathSegments.length) + 'articles/editors/editors.html';
        }
    }
    
    
    handleResize() {
        // Update button size to match new panel dimensions
        this.updateButtonSize();
        
        // Recalculate grid if it's currently visible
        if (this.isGridVisible) {
            this.populateGrid();
            console.log('📐 Grid recalculated for new screen size');
        }
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple instances
    if (!window.universalNavbar) {
        window.universalNavbar = new UniversalNavbar();
        // For backwards compatibility, export the navData from the single instance
        window.navData = window.universalNavbar.navData;
    }
}); 