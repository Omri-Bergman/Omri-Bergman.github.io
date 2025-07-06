/**
 * Container-Specific Responsive Sync Images
 * Allows each sync-images container to define its own responsive parameters
 * 
 * Breakpoints:
 * - xs (extra small): ≤320px
 * - sm (small/mobile): ≤480px  
 * - md (medium/tablet): ≤768px
 * - lg (large): ≤1024px
 * - xl (extra large): ≤1200px
 * - xxl (extra extra large): ≤1400px
 * - xxxl (ultra large): ≤1600px
 * - desktop: >1600px
 * 
 * Usage:
 * <div data-sync-images 
 *      data-rows="17" data-cols="13"
 *      data-xs-rows="2" data-xs-cols="1" data-xs-gap="3px"
 *      data-sm-rows="3" data-sm-cols="2" data-sm-gap="5px"
 *      data-md-rows="6" data-md-cols="4" data-md-gap="8px"
 *      data-lg-rows="10" data-lg-cols="6" data-lg-gap="10px"
 *      data-xl-rows="15" data-xl-cols="10" data-xl-gap="12px"
 *      data-xxl-rows="18" data-xxl-cols="12" data-xxl-gap="15px"
 *      data-xxxl-rows="20" data-xxxl-cols="15" data-xxxl-gap="20px">
 * </div>
 */

class ContainerSpecificResponsiveSyncImages {
    constructor() {
        this.breakpoints = {
            xs: 320,    // Extra small phones
            sm: 480,    // Small phones
            md: 768,    // Tablets
            lg: 1024,   // Small desktops
            xl: 1200,   // Large desktops
            xxl: 1400,  // Extra large desktops
            xxxl: 1600  // Ultra large desktops
        };
        
        // Default responsive parameters (used as fallback)
        this.defaultResponsiveParams = {
            xs: {
                rows: 2,
                cols: 1,
                gap: '3px',
                maxWidth: '100vw',
                aspectRatio: '16/9',
                minHeight: '100px'
            },
            sm: {
                rows: 3,
                cols: 2,
                gap: '5px',
                maxWidth: '100vw',
                aspectRatio: '16/9',
                minHeight: '120px'
            },
            md: {
                rows: 4,
                cols: 3,
                gap: '8px',
                maxWidth: '100vw',
                aspectRatio: '16/9',
                minHeight: '140px'
            },
            lg: {
                rows: 6,
                cols: 4,
                gap: '10px',
                maxWidth: '100vw',
                aspectRatio: '4/3',
                minHeight: '160px'
            },
            xl: {
                rows: 8,
                cols: 6,
                gap: '12px',
                maxWidth: '100vw',
                aspectRatio: '4/3',
                minHeight: '180px'
            },
            xxl: {
                rows: 10,
                cols: 8,
                gap: '15px',
                maxWidth: '100vw',
                aspectRatio: '4/3',
                minHeight: '200px'
            },
            xxxl: {
                rows: 12,
                cols: 10,
                gap: '20px',
                maxWidth: '100vw',
                aspectRatio: '4/3',
                minHeight: '250px'
            }
        };
        
        this.originalParams = new Map();
        this.containerResponsiveParams = new Map();
        this.hasModifications = false;
        
        // Store event handlers for later removal
        this.resizeHandler = () => this.applyResponsiveParams();
        this.orientationHandler = () => {
            setTimeout(() => {
                this.applyResponsiveParams();
            }, 100);
        };
        
        this.init();
    }
    
    init() {
        // Store original parameters and parse container-specific responsive params
        this.storeOriginalParams();
        this.parseContainerResponsiveParams();
        
        // Ensure CSS custom properties are properly initialized
        this.initializeCSSCustomProperties();
        
        // Apply responsive parameters
        this.applyResponsiveParams();
        
        // Listen for window resize
        window.addEventListener('resize', this.resizeHandler);
        
        // Listen for orientation change
        window.addEventListener('orientationchange', this.orientationHandler);
    }
    
    storeOriginalParams() {
        const containers = document.querySelectorAll('[data-sync-images]');
        containers.forEach(container => {
            const originalParams = {
                rows: container.dataset.rows,
                cols: container.dataset.cols,
                gap: container.dataset.gap,
                maxWidth: container.dataset.maxWidth,
                aspectRatio: container.dataset.aspectRatio,
                minHeight: this.processHeightValue(container.dataset.minHeight)
            };
            
            // Also capture any existing CSS custom properties
            const computedStyle = getComputedStyle(container);
            const customMinHeight = container.style.getPropertyValue('--custom-min-height') || 
                                   computedStyle.getPropertyValue('--custom-min-height');
            
            if (customMinHeight) {
                originalParams.customMinHeight = customMinHeight;
            }
            
            console.log('Stored original params for container:', originalParams);
            this.originalParams.set(container, originalParams);
        });
    }
    
    parseContainerResponsiveParams() {
        const containers = document.querySelectorAll('[data-sync-images]');
        containers.forEach(container => {
            const responsiveParams = {};
            
            // Parse parameters for each breakpoint
            Object.keys(this.breakpoints).forEach(breakpoint => {
                responsiveParams[breakpoint] = this.parseBreakpointParams(container, breakpoint);
            });
            
            this.containerResponsiveParams.set(container, responsiveParams);
        });
    }
    
        initializeCSSCustomProperties() {
        const containers = document.querySelectorAll('[data-sync-images]');
        containers.forEach(container => {
            const originalParams = this.originalParams.get(container);
            
            // Add data-min-height attribute if it doesn't exist - this is required for the CSS selector
            if (!container.hasAttribute('data-min-height') && container.dataset.minHeight) {
                container.setAttribute('data-min-height', container.dataset.minHeight);
            }
            
            // Initialize CSS custom properties that might be needed
            if (container.dataset.minHeight) {
                const processedHeight = this.processHeightValue(container.dataset.minHeight);
                container.style.setProperty('--custom-min-height', processedHeight);
                container.style.setProperty('--custom-height', processedHeight);
                console.log(`Initialized --custom-min-height and --custom-height to: ${processedHeight}`);
            }
            
            // Also initialize for individual image containers if needed
            const syncGrid = container.querySelector('.sync-images-grid');
            if (syncGrid) {
                const imageContainers = syncGrid.querySelectorAll('.sync-image-container');
                imageContainers.forEach(imgContainer => {
                    if (container.dataset.minHeight) {
                        const processedHeight = this.processHeightValue(container.dataset.minHeight);
                        imgContainer.style.setProperty('--custom-min-height', processedHeight);
                        imgContainer.style.setProperty('--custom-height', processedHeight);
                    }
                });
            }
        });
    }
    
    parseBreakpointParams(container, breakpoint) {
        const defaults = this.defaultResponsiveParams[breakpoint];
        const prefix = breakpoint;
        
        return {
            rows: parseInt(container.dataset[`${prefix}Rows`]) || defaults.rows,
            cols: parseInt(container.dataset[`${prefix}Cols`]) || defaults.cols,
            gap: container.dataset[`${prefix}Gap`] || defaults.gap,
            maxWidth: container.dataset[`${prefix}MaxWidth`] || defaults.maxWidth,
            aspectRatio: container.dataset[`${prefix}AspectRatio`] || defaults.aspectRatio,
            minHeight: this.processHeightValue(container.dataset[`${prefix}MinHeight`]) || defaults.minHeight
        };
    }
    
    processHeightValue(value) {
        if (!value) return value;
        
        // If it already contains calc(), return as is
        if (value.includes('calc(')) {
            return value;
        }
        
        // If it contains mathematical expressions, wrap in calc()
        if (value.includes('/') || value.includes('*') || value.includes('+') || value.includes('-')) {
            // Clean up the expression (remove extra spaces)
            const cleanExpression = value.replace(/\s+/g, ' ').trim();
            return `calc(${cleanExpression})`;
        }
        
        return value;
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        // Check breakpoints from largest to smallest
        if (width > this.breakpoints.xxxl) {
            return 'desktop'; // Original desktop behavior
        } else if (width > this.breakpoints.xxl) {
            return 'xxxl';
        } else if (width > this.breakpoints.xl) {
            return 'xxl';
        } else if (width > this.breakpoints.lg) {
            return 'xl';
        } else if (width > this.breakpoints.md) {
            return 'lg';
        } else if (width > this.breakpoints.sm) {
            return 'md';
        } else if (width > this.breakpoints.xs) {
            return 'sm';
        } else {
            return 'xs';
        }
    }
    
    disableResponsive() {
        console.log('Disabling responsive sync-images');
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('orientationchange', this.orientationHandler);
        
        // Restore all containers to original state
        const containers = document.querySelectorAll('[data-sync-images]');
        containers.forEach(container => {
            this.applyCSSUpdates(container, 'desktop');
        });
    }
    
    applyResponsiveParams() {
        const currentBreakpoint = this.getCurrentBreakpoint();
        const containers = document.querySelectorAll('[data-sync-images]');
        
        // Check if we need to apply desktop logic on first load
        const needsDesktopSetup = currentBreakpoint === 'desktop' && !this.hasModifications;
        if (needsDesktopSetup) {
            // Check if any container has more image containers than expected
            const needsDesktopRestore = Array.from(containers).some(container => {
                const originalParams = this.originalParams.get(container);
                const expectedImages = parseInt(originalParams?.rows || container.dataset.rows || 1) * 
                                     parseInt(originalParams?.cols || container.dataset.cols || 1);
                const syncGrid = container.querySelector('.sync-images-grid');
                const actualImages = syncGrid ? syncGrid.querySelectorAll('.sync-image-container').length : 0;
                return actualImages > expectedImages;
            });
            
            if (!needsDesktopRestore) {
                return; // No need to apply desktop logic
            }
        }
        
        console.log(`Applying responsive params for: ${currentBreakpoint} (${window.innerWidth}px)`);
        
        containers.forEach(container => {
            const originalParams = this.originalParams.get(container);
            const containerResponsiveParams = this.containerResponsiveParams.get(container);
            
            if (currentBreakpoint === 'desktop') {
                // Restore original parameters
                if (originalParams) {
                    if (originalParams.rows) container.dataset.rows = originalParams.rows;
                    if (originalParams.cols) container.dataset.cols = originalParams.cols;
                    if (originalParams.gap) container.dataset.gap = originalParams.gap;
                    if (originalParams.maxWidth) container.dataset.maxWidth = originalParams.maxWidth;
                    if (originalParams.aspectRatio) container.dataset.aspectRatio = originalParams.aspectRatio;
                    if (originalParams.minHeight) container.dataset.minHeight = originalParams.minHeight;
                }
            } else {
                // Apply container-specific responsive parameters
                const params = containerResponsiveParams[currentBreakpoint];
                container.dataset.rows = params.rows;
                container.dataset.cols = params.cols;
                container.dataset.gap = params.gap;
                container.dataset.maxWidth = params.maxWidth;
                container.dataset.aspectRatio = params.aspectRatio;
                container.dataset.minHeight = params.minHeight;
            }
            
            // Apply CSS custom properties for immediate visual updates
            this.applyCSSUpdates(container, currentBreakpoint);
            
            // Track that we've made modifications
            if (currentBreakpoint !== 'desktop') {
                this.hasModifications = true;
            }
        });
        
        console.log(`Applied ${currentBreakpoint} responsive parameters`);
    }
    
    applyCSSUpdates(container, breakpoint) {
        const syncGrid = container.querySelector('.sync-images-grid');
        if (!syncGrid) return;
        
        const containerResponsiveParams = this.containerResponsiveParams.get(container);
        
        if (breakpoint === 'desktop') {
            console.log('🔄 RESTORING DESKTOP MODE');
            
            // Remove ALL custom responsive properties and inline styles
            syncGrid.style.removeProperty('--responsive-gap');
            syncGrid.style.removeProperty('--responsive-columns');
            syncGrid.style.removeProperty('--responsive-rows');
            container.style.removeProperty('--responsive-max-width');
            container.style.removeProperty('--responsive-min-height');
            
            // Remove any inline grid styles we added
            syncGrid.style.removeProperty('grid-template-columns');
            syncGrid.style.removeProperty('grid-template-rows');
            syncGrid.style.removeProperty('gap');
            container.style.removeProperty('max-width');
            
            // IMPORTANT: Restore original grid layout immediately
            const originalParams = this.originalParams.get(container);
            if (originalParams) {
                syncGrid.style.gridTemplateColumns = `repeat(${originalParams.cols}, 1fr)`;
                syncGrid.style.gridTemplateRows = `repeat(${originalParams.rows}, auto)`;
                syncGrid.style.gap = originalParams.gap;
                container.style.maxWidth = originalParams.maxWidth;
                console.log(`🔄 Restored original grid: ${originalParams.cols} cols, ${originalParams.rows} rows`);
            }
            
            // Force the grid container to be visible first
            syncGrid.style.display = 'grid';
            syncGrid.style.visibility = 'visible';
            
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                // Show all images on desktop and completely restore original styles
                const imageContainers = syncGrid.querySelectorAll('.sync-image-container');
                console.log(`Found ${imageContainers.length} image containers to restore on desktop`);
                
                // Force refresh parameter storage if not found
                if (!this.originalParams.has(container)) {
                    console.log('🔄 Container not found in stored params, re-storing...');
                    const originalParams = {
                        rows: container.dataset.rows,
                        cols: container.dataset.cols,
                        gap: container.dataset.gap,
                        maxWidth: container.dataset.maxWidth,
                        aspectRatio: container.dataset.aspectRatio,
                        minHeight: this.processHeightValue(container.dataset.minHeight)
                    };
                    this.originalParams.set(container, originalParams);
                    console.log('🔄 Re-stored params:', originalParams);
                }
                
                // Get original params for restoration
                const originalParams = this.originalParams.get(container);
                console.log('🔍 Looking for original params for container:', container);
                console.log('🔍 All stored original params:', this.originalParams);
                console.log('🔍 Original params found:', originalParams);
                console.log('🔍 Container dataset:', container.dataset);
                
                // Calculate how many containers should be visible in desktop mode
                const desktopRows = parseInt(originalParams.rows || container.dataset.rows || 1);
                const desktopCols = parseInt(originalParams.cols || container.dataset.cols || 1);
                const desktopMaxImages = desktopRows * desktopCols;
                console.log(`🔄 Desktop mode: showing ${desktopMaxImages} images (${desktopRows}×${desktopCols}) out of ${imageContainers.length} total`);
                
                // First, clear all responsive modifications from image containers
                imageContainers.forEach((imgContainer, index) => {
                    if (index < desktopMaxImages) {
                        // Show this image for desktop layout
                        imgContainer.style.display = 'block';
                        imgContainer.style.visibility = 'visible';
                        imgContainer.style.opacity = '1';
                    } else {
                        // Hide extra images on desktop
                        imgContainer.style.display = 'none';
                    }
                    
                    // Remove ALL custom style properties (for all containers)
                    imgContainer.style.removeProperty('min-height');
                    imgContainer.style.removeProperty('height');
                    imgContainer.style.removeProperty('aspect-ratio');
                    
                    // Remove responsive CSS custom properties
                    imgContainer.style.removeProperty('--custom-height');
                    imgContainer.style.removeProperty('--custom-min-height');
                    
                    // Restore image styles too
                    const img = imgContainer.querySelector('.sync-image');
                    if (img) {
                        if (index < desktopMaxImages) {
                            img.style.display = 'block';
                            img.style.visibility = 'visible';
                            img.style.opacity = '1';
                        }
                        img.style.removeProperty('height');
                        img.style.removeProperty('object-fit');
                    }
                });
                
                // Now restore the original CSS custom properties at container level
                let minHeightValue = null;
                
                if (originalParams && (originalParams.customMinHeight || originalParams.minHeight)) {
                    // ALWAYS process through processHeightValue to ensure calc() wrapper
                    const rawValue = originalParams.customMinHeight || originalParams.minHeight;
                    minHeightValue = this.processHeightValue(rawValue);
                    console.log(`✅ Using stored original params: ${rawValue} → processed: ${minHeightValue}`);
                } else {
                    // Fallback: use current dataset values if no stored params
                    if (container.dataset.minHeight) {
                        minHeightValue = this.processHeightValue(container.dataset.minHeight);
                        console.log(`⚠️ No stored params, using dataset fallback: ${minHeightValue}`);
                    } else {
                        console.log('⚠️ No original params or dataset values found for restoration');
                    }
                }
                
                if (minHeightValue) {
                    container.style.setProperty('--custom-min-height', minHeightValue);
                    container.style.setProperty('--custom-height', minHeightValue);
                    console.log(`✅ Restored container --custom-min-height and --custom-height to: ${minHeightValue}`);
                    
                    // Ensure data-min-height attribute is present (use original value, not processed)
                    const originalMinHeight = container.dataset.minHeight;
                    if (!container.hasAttribute('data-min-height') && originalMinHeight) {
                        container.setAttribute('data-min-height', originalMinHeight);
                        console.log(`✅ Added data-min-height attribute: ${originalMinHeight}`);
                    }
                    
                    // Also set on individual image containers for redundancy
                    imageContainers.forEach((imgContainer, index) => {
                        imgContainer.style.setProperty('--custom-min-height', minHeightValue);
                        imgContainer.style.setProperty('--custom-height', minHeightValue);
                    });
                    
                    console.log(`✅ Set custom properties on ${imageContainers.length} image containers`);
                } else {
                    console.log('❌ Could not determine height value for restoration');
                }
                
                console.log('✅ Desktop sync-images state fully restored');
            }, 10); // Small delay to ensure DOM is ready
            
            this.hasModifications = false;
        } else {
            // Apply container-specific responsive CSS
            const params = containerResponsiveParams[breakpoint];
            console.log(`📱 APPLYING ${breakpoint.toUpperCase()} RESPONSIVE:`, params);
            
            syncGrid.style.setProperty('--responsive-gap', params.gap);
            syncGrid.style.setProperty('--responsive-columns', `repeat(${params.cols}, 1fr)`);
            syncGrid.style.setProperty('--responsive-rows', `repeat(${params.rows}, auto)`);
            container.style.setProperty('--responsive-max-width', params.maxWidth);
            container.style.setProperty('--responsive-min-height', params.minHeight);
            
            // Set both custom properties on the container level
            container.style.setProperty('--custom-height', params.minHeight);
            container.style.setProperty('--custom-min-height', params.minHeight);
            console.log(`📱 Set container custom properties to: ${params.minHeight}`);
            
            // Apply the responsive grid layout
            syncGrid.style.gridTemplateColumns = `repeat(${params.cols}, 1fr)`;
            syncGrid.style.gridTemplateRows = `repeat(${params.rows}, auto)`;
            syncGrid.style.gap = params.gap;
            container.style.maxWidth = params.maxWidth;
            
            // Control number of visible images based on rows × cols
            const maxImages = params.rows * params.cols;
            const imageContainers = syncGrid.querySelectorAll('.sync-image-container');
            
            console.log(`📱 ${breakpoint}: showing ${maxImages} images (${params.rows}×${params.cols}) out of ${imageContainers.length} total`);
            
            imageContainers.forEach((imgContainer, index) => {
                if (index < maxImages) {
                    // Show this image
                    imgContainer.style.display = '';
                    
                    // Set the CSS custom property instead of inline styles to avoid the 300px fallback
                    imgContainer.style.setProperty('--custom-height', params.minHeight);
                    imgContainer.style.setProperty('--custom-min-height', params.minHeight);
                    
                    // Force the height with important to override other CSS
                    imgContainer.style.setProperty('min-height', params.minHeight, 'important');
                    imgContainer.style.setProperty('height', params.minHeight, 'important');
                    imgContainer.style.setProperty('aspect-ratio', 'unset', 'important');
                    
                    // Also target the image inside
                    const img = imgContainer.querySelector('.sync-image');
                    if (img) {
                        img.style.setProperty('height', '100%', 'important');
                        img.style.setProperty('object-fit', 'cover', 'important');
                    }
                } else {
                    // Hide extra images
                    imgContainer.style.display = 'none';
                }
            });
            
            console.log(`📱 Applied ${breakpoint} responsive styles successfully`);
        }
    }
    
    // Method to update responsive parameters for a specific container
    updateContainerParams(container, breakpoint, params) {
        const containerResponsiveParams = this.containerResponsiveParams.get(container);
        if (containerResponsiveParams && containerResponsiveParams[breakpoint]) {
            containerResponsiveParams[breakpoint] = {
                ...containerResponsiveParams[breakpoint],
                ...params
            };
            this.applyResponsiveParams();
        }
    }
    
    // Method to get current responsive parameters for a container
    getContainerParams(container, breakpoint) {
        const containerResponsiveParams = this.containerResponsiveParams.get(container);
        return containerResponsiveParams ? containerResponsiveParams[breakpoint] : null;
    }
    
    // Method to get all available breakpoints
    getBreakpoints() {
        return Object.keys(this.breakpoints);
    }
    
    // Method to get current breakpoint info
    getBreakpointInfo() {
        const current = this.getCurrentBreakpoint();
        const width = window.innerWidth;
        return {
            current: current,
            width: width,
            breakpoints: this.breakpoints
        };
    }
    
    // Method to add custom breakpoints
    addBreakpoint(name, width, defaultParams) {
        this.breakpoints[name] = width;
        if (defaultParams) {
            this.defaultResponsiveParams[name] = defaultParams;
        }
        
        // Re-parse container parameters to include new breakpoint
        this.parseContainerResponsiveParams();
        this.applyResponsiveParams();
    }
}

// Initialize when DOM is ready, but only after sync-images are initialized
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure sync-images are fully initialized
    setTimeout(() => {
        const syncContainers = document.querySelectorAll('[data-sync-images]');
        const anyInitialized = Array.from(syncContainers).some(container => 
            container.querySelector('.sync-images-grid')
        );
        
        if (anyInitialized) {
            console.log('Sync-images detected, initializing container-specific responsive...');
            window.containerSpecificResponsiveSyncImages = new ContainerSpecificResponsiveSyncImages();
            
            // Debug: Log breakpoint info
            console.log('Available breakpoints:', window.containerSpecificResponsiveSyncImages.getBreakpoints());
            console.log('Current breakpoint:', window.containerSpecificResponsiveSyncImages.getBreakpointInfo());
        } else {
            console.log('No sync-images found, skipping responsive initialization');
        }
    }, 500);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContainerSpecificResponsiveSyncImages;
} 