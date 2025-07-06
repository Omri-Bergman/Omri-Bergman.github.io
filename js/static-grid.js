class StaticGridLayout {
    constructor() {
        this.gridContainer = document.getElementById('gridContainer');
        this.panels = [];
        this.textPanelCount = 0; // Counter for text panels to alternate colors
        
        // PERFORMANCE: Setup intersection observer for lazy loading
        this.imageObserver = null;
        this.setupImageObserver();
        
        // PERFORMANCE: Debounce resize handler
        this.resizeTimeout = null;
        
        // GROUP MODAL SYSTEM
        this.modalOverlay = null;
        this.groups = []; // Will store identified groups
        
        // SYNCHRONIZED CURSORS SYSTEM
        this.cursors = []; // Store cursor elements for each panel
        this.mousePosition = { x: 0, y: 0 };
        this.isHovering = false;
        this.activeImageIndex = null;
        
        // Sample content - you can replace this with your actual content
        this.content = [
            { type: 'text', title: '', content: 'הסוסים של סטנפורד ', author: 'אלהם רוקני', year: '2011', medium: 'דיו והקרנה' },
            { type: 'image', src: '../../images/Screen/Eder/0.webp', alt: 'תמונה 1' },
            { type: 'image', src: '../../images/Screen/Eder/1.webp', alt: 'תמונה 2' },
            { type: 'image', src: '../../images/Screen/Eder/2.webp', alt: 'תמונה 3' },
            { type: 'image', src: '../../images/Screen/Eder/3.webp', alt: 'תמונה 4' },
            { type: 'image', src: '../../images/Screen/Eder/4.webp', alt: 'תמונה 5' },
            { type: 'image', src: '../../images/Screen/Eder/5.webp', alt: 'תמונה 6' },
            { type: 'image', src: '../../images/Screen/Eder/6.webp', alt: 'תמונה 7' },
            { type: 'text', title: '', content: 'נהר האדום', author: 'הווארד הוקס', year: '1948', medium: 'סרט' },
            { type: 'image', src: '../../images/Screen/RedRiver/0.webp', alt: 'תמונה 8' },
            { type: 'image', src: '../../images/Screen/RedRiver/1.webp', alt: 'תמונה 9' },
            { type: 'image', src: '../../images/Screen/RedRiver/2.webp', alt: 'תמונה 10' },
            { type: 'image', src: '../../images/Screen/RedRiver/3.webp', alt: 'תמונה 11' },
            { type: 'image', src: '../../images/Screen/RedRiver/4.webp', alt: 'תמונה 12' },
            { type: 'image', src: '../../images/Screen/RedRiver/5.webp', alt: 'תמונה 13' },
            { type: 'image', src: '../../images/Screen/RedRiver/6.webp', alt: 'תמונה 14' },
            { type: 'image', src: '../../images/Screen/RedRiver/7.webp', alt: 'תמונה 15' },
            { type: 'text', title: '', content: 'האל הלבן', author: 'קורנל מונדרוצו', year: '2014', medium: 'סרט' },
            { type: 'image', src: '../../images/Screen/whiteGod/0.webp', alt: 'תמונה 16' },
            { type: 'image', src: '../../images/Screen/whiteGod/1.webp', alt: 'תמונה 17' },
            { type: 'image', src: '../../images/Screen/whiteGod/2.webp', alt: 'תמונה 18' },
            { type: 'image', src: '../../images/Screen/whiteGod/3.webp', alt: 'תמונה 19' },
            { type: 'image', src: '../../images/Screen/whiteGod/4.webp', alt: 'תמונה 20' },
            { type: 'image', src: '../../images/Screen/whiteGod/5.webp', alt: 'תמונה 21' },
            { type: 'image', src: '../../images/Screen/whiteGod/6.webp', alt: 'תמונה 22' },
            { type: 'image', src: '../../images/Screen/whiteGod/7.webp', alt: 'תמונה 22' },
            { type: 'image', src: '../../images/Screen/whiteGod/8.webp', alt: 'תמונה 22' },
            { type: 'text', title: '', content: 'Face Disappearing', author: 'יוכבד וינפלד ', year: '1976', medium: ' סדרת תצלומים' },
            { type: 'image', src: '../../images/Screen/Face/0.webp', alt: 'תמונה 23' },
            { type: 'image', src: '../../images/Screen/Face/1.webp', alt: 'תמונה 24' },
            { type: 'image', src: '../../images/Screen/Face/2.webp', alt: 'תמונה 25' },
            { type: 'image', src: '../../images/Screen/Face/3.webp', alt: 'תמונה 26' },
            { type: 'image', src: '../../images/Screen/Face/4.webp', alt: 'תמונה 27' },
            { type: 'image', src: '../../images/Screen/Face/5.webp', alt: 'תמונה 28' },
            { type: 'image', src: '../../images/Screen/Face/6.webp', alt: 'תמונה 29' },
            { type: 'image', src: '../../images/Screen/Face/7.webp', alt: 'תמונה 30' },
            { type: 'image', src: '../../images/Screen/Face/8.webp', alt: 'תמונה 31' },
            { type: 'text', title: '', content: 'טל אלפרשטיין', author: 'טל אלפרשטיין', year: '2021', medium: 'קולאז׳ דיגיטלי' },
            { type: 'image', src: '../../images/Screen/tal/0.webp', alt: 'תמונה 32' },
            { type: 'image', src: '../../images/Screen/tal/1.webp', alt: 'תמונה 33' },
            { type: 'image', src: '../../images/Screen/tal/2.webp', alt: 'תמונה 34' },
            { type: 'image', src: '../../images/Screen/tal/3.webp', alt: 'תמונה 35' },
            { type: 'image', src: '../../images/Screen/tal/4.webp', alt: 'תמונה 36' },
            { type: 'image', src: '../../images/Screen/tal/5.webp', alt: 'תמונה 37' },
            { type: 'text', title: '', content: 'אגדת חורבן ', author: ' דוד פולונסקי ומיכאל פאוסט', year: '2021', medium: ' סרט' },
            { type: 'image', src: '../../images/Screen/Agadat/0.webp', alt: 'תמונה 38' },
            { type: 'image', src: '../../images/Screen/Agadat/1.webp', alt: 'תמונה 39' },
            { type: 'image', src: '../../images/Screen/Agadat/2.webp', alt: 'תמונה 40' },
            { type: 'image', src: '../../images/Screen/Agadat/3.webp', alt: 'תמונה 41' },
            { type: 'image', src: '../../images/Screen/Agadat/4.webp', alt: 'תמונה 42' },
            { type: 'image', src: '../../images/Screen/Agadat/5.webp', alt: 'תמונה 43' },
            { type: 'image', src: '../../images/Screen/Agadat/6.webp', alt: 'תמונה 44' },
            { type: 'image', src: '../../images/Screen/Agadat/7.webp', alt: 'תמונה 45' },
            { type: 'image', src: '../../images/Screen/Agadat/8.webp', alt: 'תמונה 46' },
            { type: 'image', src: '../../images/Screen/Agadat/9.webp', alt: 'תמונה 47' },

        ];
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.calculateGrid();
        this.identifyGroups();
        this.createPanels();
        
        // PERFORMANCE: Only create modal overlay once
        if (!this.modalOverlay) {
            this.createModalOverlay();
        }
        
        this.updateDebugInfo();
    }

    identifyGroups() {
        // Automatically identify groups: text panel followed by images
        this.groups = [];
        let currentGroup = null;
        
        this.content.forEach((item, index) => {
            if (item.type === 'text') {
                // Start a new group
                if (currentGroup) {
                    this.groups.push(currentGroup);
                }
                currentGroup = {
                    title: item.content,
                    titleIndex: index,
                    items: [{ ...item, contentIndex: index }]
                };
            } else if (item.type === 'image' && currentGroup) {
                // Add image to current group
                currentGroup.items.push({ ...item, contentIndex: index });
            }
        });
        
        // Don't forget the last group
        if (currentGroup) {
            this.groups.push(currentGroup);
        }
        
        console.log('📁 Identified groups:', this.groups.map(g => `"${g.title}" (${g.items.length} items)`));
    }

    findGroupByContentIndex(contentIndex) {
        // Find which group a content item belongs to
        for (let group of this.groups) {
            if (group.items.some(item => item.contentIndex === contentIndex)) {
                return group;
            }
        }
        return null;
    }

    calculateGrid() {
        // CONTENT-DRIVEN GRID: Base grid on content amount, not screen size
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const totalPixels = screenWidth * screenHeight;
        
        // Keep original panel sizes for consistency
        let targetPanelSize;
        if (totalPixels > 3840 * 2160) { // 4K+
            targetPanelSize = 200;
        } else if (totalPixels > 1920 * 1080) { // 1440p  
            targetPanelSize = 170;
        } else { // 1080p and below
            targetPanelSize = 150;
        }

        // Calculate columns to fit screen width with desired panel size
        this.cols = Math.ceil(screenWidth / targetPanelSize);
        
        // Calculate rows needed for ALL content (no screen-based limit)
        this.totalPanels = this.content.length;
        this.rows = Math.ceil(this.totalPanels / this.cols);
        
        // Calculate exact panel dimensions (keep original sizes)
        this.panelWidth = screenWidth / this.cols;
        this.panelHeight = this.panelWidth; // Make panels square for consistency
        
        // Set CSS Grid properties for CONTENT-DRIVEN layout
        this.gridContainer.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        this.gridContainer.style.gridTemplateRows = `repeat(${this.rows}, ${this.panelHeight}px)`;
        
        // Set grid container height to accommodate ALL content (will scroll if needed)
        const gridHeight = this.panelHeight * this.rows;
        this.gridContainer.style.height = `${gridHeight}px`;
        
        console.log(`🎯 CONTENT-DRIVEN Grid: ${this.cols}x${this.rows} = ${this.totalPanels} panels`);
        console.log(`Panel size: ${this.panelWidth.toFixed(1)}x${this.panelHeight.toFixed(1)}px (square panels)`);
        console.log(`Grid height: ${gridHeight.toFixed(1)}px (will scroll if needed)`);
    }

    createPanels() {
        // Clear existing panels
        this.gridContainer.innerHTML = '';
        this.panels = [];
        this.cursors = []; // Reset cursors array for synchronized cursor system
        this.textPanelCount = 0; // Reset text panel counter for alternating colors
        
        // PERFORMANCE: Use document fragment for batched DOM operations
        const fragment = document.createDocumentFragment();
        
        // Create ONE panel per content item (no repetition)
        for (let i = 0; i < this.content.length; i++) {
            const panel = this.createPanel(i);
            fragment.appendChild(panel); // Add to fragment instead of DOM
            this.panels.push(panel);
        }
        
        // PERFORMANCE: Single DOM operation instead of multiple
        this.gridContainer.appendChild(fragment);
        
        console.log(`⚡ Created ${this.content.length} panels (1:1 with content) with batched DOM operations`);
        console.log(`🎯 Synchronized cursors ready for ${this.groups.length} groups`);
    }

    createPanel(index) {
        const panel = document.createElement('div');
        panel.className = 'panel';
        panel.dataset.index = index;
        
        // Direct 1:1 mapping with content (no repetition)
        const content = this.content[index];
        panel.dataset.contentIndex = index; // Store for group detection
        
        if (content.type === 'text') {
            this.createTextPanel(panel, content, index);
        } else if (content.type === 'image') {
            this.createImagePanel(panel, content, index);
        } else {
            this.createPlaceholderPanel(panel, index);
        }
        
        // Add click handler for group modal
        panel.addEventListener('click', () => this.onPanelClick(panel, index, index));
        
        return panel;
    }

    createTextPanel(panel, content, index) {
        panel.classList.add('text');
        
        // Alternate between dark and light styling for each text panel
        if (this.textPanelCount % 2 === 1) {
            panel.classList.add('alternate'); // Light background, dark text
        }
        // Even numbered text panels use default styling (dark background, light text)
        
        this.textPanelCount++; // Increment counter for next text panel
        
        const title = document.createElement('h3');
        title.textContent = content.title;
        
        const text = document.createElement('p');
        text.textContent = content.content;
        
        panel.appendChild(title);
        panel.appendChild(text);
        
        // SYNCHRONIZED CURSORS: Create cursor element for text panels too
        const cursor = document.createElement('div');
        cursor.className = 'sync-cursor';
        cursor.innerHTML = `
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="28" height="28" viewBox="0 0 100 100" xml:space="preserve">
                <g transform="scale(0.2)">
                    <polygon points="70.9171753,245.8382263 13.7609253,301.528656 8.3693237,19.2884216 212.3517456,217.5081482 
                120.0197144,222.8763123 180.1222534,350.4964294 127.326355,366.8382263"/>
                    <path style="fill:#FFFFFF;" d="M16.7397461,38.5769958l176.9996948,171.9996948l-85.9998779,5l61.2220459,129.9996948
                l-37.333252,11.555542L73.406311,232.2433167l-51.9998779,50.6665344L16.7397461,38.5769958 M0,0l0.7426147,38.8825378
                l4.666687,244.3328552l0.7054443,36.9332275l26.4575195-25.7790833l35.8562622-34.9368591L117.12677,363.8924561
                l5.8979492,12.6513977l13.3345947-4.1273804l37.333252-11.555542l17.5888672-5.4440918l-7.8446045-16.6573792
                L132.300354,230.1757202l62.3677979-3.6260376l36.2957764-2.1102295l-26.0740967-25.3373718L27.8901978,27.1023865L0,0L0,0z"/>
                </g>
            </svg>
        `;
        cursor.style.display = 'none';
        panel.appendChild(cursor);
        this.cursors.push(cursor);
        
        // SYNCHRONIZED CURSORS: Add mouse event listeners for text panels
        panel.addEventListener('mousemove', (e) => this.handleTextPanelMouseMove(e, index));
        panel.addEventListener('mouseleave', () => this.handleImageMouseLeave());
        panel.addEventListener('mouseout', () => this.handleImageMouseLeave()); // Backup for mouseleave
        
        // GROUP SCALING: Scale all items in group on hover
        panel.addEventListener('mouseenter', () => this.handleGroupHoverEnter(index));
        panel.addEventListener('mouseleave', () => this.handleGroupHoverLeave(index));
    }

    createImagePanel(panel, content, index) {
        panel.classList.add('image');
        
        const img = document.createElement('img');
        
        // OPTIMIZED: Better lazy loading with intersection observer
        img.alt = content.alt;
        img.loading = 'lazy';
        img.decoding = 'async'; // Async image decoding
        
        // Start with a placeholder and load image when in view
        img.style.backgroundColor = '#222';
        img.style.opacity = '0'; // Ensure it starts invisible
        img.dataset.src = content.src; // Store actual src
        
        // Use intersection observer for better lazy loading
        if ('IntersectionObserver' in window) {
            this.observeImage(img);
        } else {
            // Fallback for older browsers with random delay
            const randomDelay = Math.random() * 600; // Random delay between 0-600ms
            setTimeout(() => {
                img.src = content.src;
                img.onload = () => {
                    // Force reflow to ensure opacity 0 is applied first
                    img.offsetHeight;
                    
                    // Use requestAnimationFrame for better timing
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            img.classList.add('fade-in');
                            console.log(`🎬 Random grid image faded in (fallback, delay: ${randomDelay.toFixed(0)}ms):`, img.src);
                        }, 100);
                    });
                };
                img.onerror = () => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            img.classList.add('fade-in'); // Still show placeholder if image fails
                        }, 100);
                    });
                };
            }, randomDelay);
        }
        
        panel.appendChild(img);
        
        // SYNCHRONIZED CURSORS: Create cursor element for this panel
        const cursor = document.createElement('div');
        cursor.className = 'sync-cursor';
        cursor.innerHTML = `
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="28" height="28" viewBox="0 0 100 100" xml:space="preserve">
                <g transform="scale(0.2)">
                    <polygon points="70.9171753,245.8382263 13.7609253,301.528656 8.3693237,19.2884216 212.3517456,217.5081482 
                120.0197144,222.8763123 180.1222534,350.4964294 127.326355,366.8382263"/>
                    <path style="fill:#FFFFFF;" d="M16.7397461,38.5769958l176.9996948,171.9996948l-85.9998779,5l61.2220459,129.9996948
                l-37.333252,11.555542L73.406311,232.2433167l-51.9998779,50.6665344L16.7397461,38.5769958 M0,0l0.7426147,38.8825378
                l4.666687,244.3328552l0.7054443,36.9332275l26.4575195-25.7790833l35.8562622-34.9368591L117.12677,363.8924561
                l5.8979492,12.6513977l13.3345947-4.1273804l37.333252-11.555542l17.5888672-5.4440918l-7.8446045-16.6573792
                L132.300354,230.1757202l62.3677979-3.6260376l36.2957764-2.1102295l-26.0740967-25.3373718L27.8901978,27.1023865L0,0L0,0z"/>
                </g>
            </svg>
        `;
        cursor.style.display = 'none';
        panel.appendChild(cursor);
        this.cursors.push(cursor);
        
        // TEXT PANEL: Create text overlay for metadata
        const textPanel = document.createElement('div');
        textPanel.className = 'image-text-panel';
        
        // Find the group this image belongs to and get metadata
        const group = this.findGroupByContentIndex(content.contentIndex);
        if (group) {
            const textItem = group.items.find(item => item.type === 'text');
            if (textItem) {
                const title = document.createElement('div');
                title.className = 'text-panel-title';
                title.textContent = group.title;
                textPanel.appendChild(title);
                
                if (textItem.author || textItem.year || textItem.medium) {
                    const metadata = document.createElement('div');
                    metadata.className = 'text-panel-metadata';
                    
                    const metadataParts = [];
                    if (textItem.author) metadataParts.push(textItem.author);
                    if (textItem.year) metadataParts.push(textItem.year);
                    if (textItem.medium) metadataParts.push(textItem.medium);
                    
                    metadata.textContent = metadataParts.join(', ');
                    textPanel.appendChild(metadata);
                }
            }
        }
        
        textPanel.style.display = 'none';
        panel.appendChild(textPanel);
        
        // SYNCHRONIZED CURSORS: Add mouse event listeners
        panel.addEventListener('mousemove', (e) => this.handleImageMouseMove(e, index));
        panel.addEventListener('mouseleave', () => this.handleImageMouseLeave());
        panel.addEventListener('mouseout', () => this.handleImageMouseLeave()); // Backup for mouseleave
        
        // TEXT PANEL: Show/hide text panel on hover
        panel.addEventListener('mouseenter', () => this.showTextPanel(index));
        panel.addEventListener('mouseleave', () => this.hideTextPanel(index));
        
        // GROUP SCALING: Scale all items in group on hover
        panel.addEventListener('mouseenter', () => this.handleGroupHoverEnter(index));
        panel.addEventListener('mouseleave', () => this.handleGroupHoverLeave(index));
    }

    createPlaceholderPanel(panel, index) {
        panel.classList.add('placeholder');
        
        const text = document.createElement('span');
        text.textContent = `Panel ${index + 1}`;
        text.style.color = '#666';
        text.style.fontSize = '0.8em';
        
        panel.appendChild(text);
        
        // SYNCHRONIZED CURSORS: Add placeholder for placeholder panels
        this.cursors.push(null); // Maintain array index alignment with panels
    }

    createModalOverlay() {
        // Create modal overlay for group display
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'group-modal-overlay';
        this.modalOverlay.style.display = 'none';
        
        // Modal content container
        const modalContent = document.createElement('div');
        modalContent.className = 'group-modal-content';
        
        // Title area
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'group-modal-title';
        
        // Images grid
        const imagesGrid = document.createElement('div');
        imagesGrid.className = 'group-modal-images';
        
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(imagesGrid);
        this.modalOverlay.appendChild(modalContent);
        
        document.body.appendChild(this.modalOverlay);
        
        // Close modal when clicking outside images or title
        this.modalOverlay.addEventListener('click', (e) => {
            // Check if click target is not an image, image container, or title
            const isImage = e.target.classList.contains('group-modal-image');
            const isImageContainer = e.target.classList.contains('group-modal-image-container');
            const isTitle = e.target.classList.contains('group-modal-title');
            
            // Close modal if clicking anywhere except images, image containers, or title
            if (!isImage && !isImageContainer && !isTitle) {
                this.hideGroupModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalOverlay.style.display !== 'none') {
                this.hideGroupModal();
            }
        });
    }

    onPanelClick(panel, panelIndex, contentIndex) {
        console.log(`🎯 Clicked panel ${panelIndex + 1}, content ${contentIndex + 1}`);
        
        // Find the group this content belongs to
        const group = this.findGroupByContentIndex(contentIndex);
        
        if (group) {
            console.log(`📁 Opening group: "${group.title}" with ${group.items.length} items`);
            this.showGroupModal(group);
        } else {
            console.log('❌ No group found for this content');
            // Fallback: simple click effect
            panel.classList.toggle('clicked');
            setTimeout(() => {
                panel.classList.remove('clicked');
            }, 300);
        }
    }

    showGroupModal(group) {
        const modalTitle = this.modalOverlay.querySelector('.group-modal-title');
        const imagesGrid = this.modalOverlay.querySelector('.group-modal-images');
        
        // Get metadata from the text item
        const textItem = group.items.find(item => item.type === 'text');
        
        // Build title with metadata inline
        let titleText = group.title;
        if (textItem && (textItem.author || textItem.year || textItem.medium)) {
            const metadataParts = [];
            if (textItem.author) metadataParts.push(textItem.author);
            if (textItem.year) metadataParts.push(textItem.year);
            if (textItem.medium) metadataParts.push(textItem.medium);
            
            if (metadataParts.length > 0) {
                titleText += ` - ${metadataParts.join(', ')}`;
            }
        }
        
        // Set title with metadata
        modalTitle.textContent = titleText;
        
        // PERFORMANCE: Clear previous content efficiently
        imagesGrid.innerHTML = '';
        
        // PERFORMANCE: Use document fragment for batched DOM operations
        const fragment = document.createDocumentFragment();
        
        // Add images to grid (skip the text item)
        const images = group.items.filter(item => item.type === 'image');
        
        // Generate random delays for each modal image
        const randomDelays = images.map(() => Math.random() * 1000); // Random delays between 0-1000ms
        
        images.forEach((imageItem, index) => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'group-modal-image-container';
            
            const img = document.createElement('img');
            img.alt = imageItem.alt;
            img.className = 'group-modal-image';
            
            // PERFORMANCE: Progressive loading with placeholder
            img.style.backgroundColor = '#333';
            img.style.minHeight = '200px';
            img.style.opacity = '0'; // Ensure it starts invisible
            
            // PERFORMANCE: Random delayed loading for random fade-in order
            const randomDelay = randomDelays[index];
            setTimeout(() => {
                img.src = imageItem.src;
                img.loading = 'lazy';
                img.decoding = 'async';
                
                // Add fade-in effect when EACH modal image loads individually
                img.onload = () => {
                    // Force reflow to ensure opacity 0 is applied first
                    img.offsetHeight;
                    
                    // Use requestAnimationFrame for better timing
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            img.classList.add('fade-in');
                            console.log(`🎬 Random modal image #${index + 1} faded in (delay: ${randomDelay.toFixed(0)}ms):`, img.src);
                        }, 100);
                    });
                };
                img.onerror = () => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            img.classList.add('fade-in'); // Still show placeholder if image fails
                        }, 100);
                    });
                };
            }, randomDelay); // Random delay instead of sequential
            
            imageContainer.appendChild(img);
            fragment.appendChild(imageContainer); // Add to fragment, not DOM
        });
        
        // PERFORMANCE: Single DOM operation
        imagesGrid.appendChild(fragment);
        
        // Show modal with animation
        this.modalOverlay.style.display = 'flex';
        
        // PERFORMANCE: Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
            this.modalOverlay.classList.add('active');
        });
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
        
        // SYNCHRONIZED CURSORS: Hide all cursors when modal opens
        this.handleImageMouseLeave();
        
        console.log(`🖼️ Starting random fade-in for ${images.length} images (random delays 0-1000ms each)`);
    }

    hideGroupModal() {
        this.modalOverlay.classList.remove('active');
        
        // PERFORMANCE: Clean up images after animation
        setTimeout(() => {
            this.modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
            
            // PERFORMANCE: Clean up image resources to prevent memory leaks
            const imagesGrid = this.modalOverlay.querySelector('.group-modal-images');
            const images = imagesGrid.querySelectorAll('img');
            images.forEach(img => {
                img.src = ''; // Clear image source to free memory
                img.removeAttribute('src');
            });
            
            // Clear the grid content
            imagesGrid.innerHTML = '';
            
            console.log('🧹 Cleaned up modal images and resources');
        }, 300);
    }

    // SYNCHRONIZED CURSORS: Handle mouse movement over images
    handleImageMouseMove(e, panelIndex) {
        // Don't show cursors when modal is open
        if (this.modalOverlay && this.modalOverlay.style.display !== 'none') return;
        
        // Only track for image panels
        const panel = this.panels[panelIndex];
        if (!panel || !panel.classList.contains('image')) return;
        
        // Get panel content index to find the group
        const contentIndex = parseInt(panel.dataset.contentIndex);
        const group = this.findGroupByContentIndex(contentIndex);
        if (!group) return;
        
        // Calculate relative mouse position
        const rect = panel.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Update state
        this.mousePosition = { x, y };
        this.isHovering = true;
        this.activeImageIndex = panelIndex;
        
        // Update cursors for this group
        this.updateGroupCursors(group, panelIndex);
    }

    // SYNCHRONIZED CURSORS: Handle mouse movement over TEXT panels
    handleTextPanelMouseMove(e, panelIndex) {
        // Don't show cursors when modal is open
        if (this.modalOverlay && this.modalOverlay.style.display !== 'none') return;
        
        // Get panel content index to find the group
        const contentIndex = parseInt(this.panels[panelIndex].dataset.contentIndex);
        const group = this.findGroupByContentIndex(contentIndex);
        if (!group) return;
        
        // Calculate relative mouse position
        const rect = this.panels[panelIndex].getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Update state
        this.mousePosition = { x, y };
        this.isHovering = true;
        this.activeImageIndex = panelIndex;
        
        // Update cursors for this group
        this.updateGroupCursors(group, panelIndex);
    }

    // SYNCHRONIZED CURSORS: Handle mouse leaving images/text panels
    handleImageMouseLeave() {
        this.isHovering = false;
        this.activeImageIndex = null;
        
        // Hide all cursors
        this.cursors.forEach(cursor => {
            if (cursor) {
                cursor.style.display = 'none';
            }
        });
    }

    // SYNCHRONIZED CURSORS: Update cursor positions for all items in the same group
    updateGroupCursors(group, activePanelIndex) {
        // Hide all cursors first
        this.cursors.forEach(cursor => {
            if (cursor) {
                cursor.style.display = 'none';
            }
        });
        
        // Show cursors on ALL other items in the same group (both images and text panels)
        group.items.forEach(item => {
            // Skip the active panel itself
            if (item.contentIndex !== parseInt(this.panels[activePanelIndex].dataset.contentIndex)) {
                // Find the panel index for this content
                const panelIndex = this.panels.findIndex(panel => 
                    parseInt(panel.dataset.contentIndex) === item.contentIndex
                );
                
                if (panelIndex !== -1 && this.cursors[panelIndex]) {
                    const cursor = this.cursors[panelIndex];
                    
                    // Position cursor at mouse position
                    cursor.style.display = 'block';
                    cursor.style.left = `${this.mousePosition.x}%`;
                    cursor.style.top = `${this.mousePosition.y}%`;
                }
            }
        });
    }

    // TEXT PANEL: Show text panel for an image
    showTextPanel(panelIndex) {
        // Don't show text panels when modal is open
        if (this.modalOverlay && this.modalOverlay.style.display !== 'none') return;
        
        const panel = this.panels[panelIndex];
        if (!panel) return;
        
        const textPanel = panel.querySelector('.image-text-panel');
        if (textPanel && textPanel.children.length > 0) {
            textPanel.style.display = 'block';
            // Add a slight delay for smoother transition
            requestAnimationFrame(() => {
                textPanel.style.opacity = '1';
            });
        }
    }

    // TEXT PANEL: Hide text panel for an image
    hideTextPanel(panelIndex) {
        const panel = this.panels[panelIndex];
        if (!panel) return;
        
        const textPanel = panel.querySelector('.image-text-panel');
        if (textPanel) {
            textPanel.style.opacity = '0';
            // Hide completely after transition
            setTimeout(() => {
                textPanel.style.display = 'none';
            }, 200);
        }
    }

    // GROUP SCALING: Handle mouse enter for group hover effect
    handleGroupHoverEnter(panelIndex) {
        // Don't apply scaling when modal is open
        if (this.modalOverlay && this.modalOverlay.style.display !== 'none') return;
        
        const panel = this.panels[panelIndex];
        if (!panel || (!panel.classList.contains('image') && !panel.classList.contains('text'))) return;
        
        // Get panel content index to find the group
        const contentIndex = parseInt(panel.dataset.contentIndex);
        const group = this.findGroupByContentIndex(contentIndex);
        if (!group) return;
        
        // Scale all items (images and text) in the same group
        group.items.forEach(item => {
            // Find the panel index for this content
            const targetPanelIndex = this.panels.findIndex(p => 
                parseInt(p.dataset.contentIndex) === item.contentIndex
            );
            
            if (targetPanelIndex !== -1) {
                const targetPanel = this.panels[targetPanelIndex];
                if (targetPanel.classList.contains('image') || targetPanel.classList.contains('text')) {
                    targetPanel.classList.add('group-hover');
                }
            }
        });
    }

    // GROUP SCALING: Handle mouse leave for group hover effect
    handleGroupHoverLeave(panelIndex) {
        const panel = this.panels[panelIndex];
        if (!panel || (!panel.classList.contains('image') && !panel.classList.contains('text'))) return;
        
        // Get panel content index to find the group
        const contentIndex = parseInt(panel.dataset.contentIndex);
        const group = this.findGroupByContentIndex(contentIndex);
        if (!group) return;
        
        // Remove scaling from all items (images and text) in the same group
        group.items.forEach(item => {
            // Find the panel index for this content
            const targetPanelIndex = this.panels.findIndex(p => 
                parseInt(p.dataset.contentIndex) === item.contentIndex
            );
            
            if (targetPanelIndex !== -1) {
                const targetPanel = this.panels[targetPanelIndex];
                if (targetPanel.classList.contains('image') || targetPanel.classList.contains('text')) {
                    targetPanel.classList.remove('group-hover');
                }
            }
        });
    }

    setupImageObserver() {
        // PERFORMANCE: Intersection observer for lazy loading images
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            // Add RANDOM delay for each image to create random fade-in order
                            const randomDelay = Math.random() * 800; // Random delay between 0-800ms
                            setTimeout(() => {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                
                                // Add fade-in effect when EACH image loads individually
                                img.onload = () => {
                                    // Force reflow to ensure opacity 0 is applied first
                                    img.offsetHeight;
                                    
                                    // Use requestAnimationFrame for better timing
                                    requestAnimationFrame(() => {
                                        setTimeout(() => {
                                            img.classList.add('fade-in');
                                            console.log(`🎬 Random grid image faded in (delay: ${randomDelay.toFixed(0)}ms):`, img.src);
                                        }, 100);
                                    });
                                };
                                
                                // Handle image load errors
                                img.onerror = () => {
                                    requestAnimationFrame(() => {
                                        setTimeout(() => {
                                            img.classList.add('fade-in'); // Still show placeholder if image fails
                                        }, 100);
                                    });
                                };
                                
                                this.imageObserver.unobserve(img);
                            }, randomDelay); // Random delay instead of sequential
                        }
                    }
                });
            }, {
                rootMargin: '50px', // Smaller margin for more individual loading
                threshold: 0.1 // Lower threshold for better performance
            });
        }
    }

    observeImage(img) {
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        }
    }

    updateDebugInfo() {
        // Debug info is commented out in HTML, so skip updating
        const gridSizeEl = document.getElementById('gridSize');
        const screenSizeEl = document.getElementById('screenSize');
        const panelSizeEl = document.getElementById('panelSize');
        
        if (gridSizeEl) gridSizeEl.textContent = `${this.cols}x${this.rows} (${this.totalPanels} panels)`;
        if (screenSizeEl) screenSizeEl.textContent = `${window.innerWidth}x${window.innerHeight}`;
        if (panelSizeEl) panelSizeEl.textContent = `${this.panelWidth.toFixed(1)}x${this.panelHeight.toFixed(1)}px`;
    }

    setupEventListeners() {
        // PERFORMANCE: More aggressive debounced resize handler
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                console.log('🔄 Recalculating grid after resize...');
                this.init(); // Recalculate everything on resize
            }, 500); // Increased debounce time for better performance
        });
        
        // Optional: Hide debug info after 5 seconds (if it exists)
        setTimeout(() => {
            const debugInfo = document.getElementById('debugInfo');
            if (debugInfo) {
                debugInfo.style.opacity = '0.3';
            }
        }, 5000);
    }

    // Method to update content (for when you want to change the displayed content)
    updateContent(newContent) {
        this.content = newContent;
        this.createPanels();
    }
}

// Initialize the grid layout
document.addEventListener('DOMContentLoaded', () => {
    window.staticGrid = new StaticGridLayout();
}); 