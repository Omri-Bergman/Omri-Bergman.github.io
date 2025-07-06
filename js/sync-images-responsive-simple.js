/**
 * Simple Responsive Sync Images - Only modifies CSS and data attributes
 * Does not reinitialize containers to avoid conflicts
 */

class SimpleResponsiveSyncImages {
    constructor() {
        this.breakpoints = {
            mobile: 480,
            tablet: 768
        };
        
        this.responsiveParams = {
            mobile: {
                rows: 3,
                cols: 2,
                gap: '5px',
                maxWidth: '100vw',
                aspectRatio: '16/9',
                minHeight: '20px'
            },
            tablet: {
                rows: 4,
                cols: 4,
                gap: '8px',
                maxWidth: '90vw',
                aspectRatio: '16/9',
                minHeight: '150px'
            }
        };
        
        this.originalParams = new Map();
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
        // Store original parameters
        this.storeOriginalParams();
        
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
                minHeight: container.dataset.minHeight
            };
            this.originalParams.set(container, originalParams);
        });
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) {
            return 'mobile';
        } else if (width <= this.breakpoints.tablet) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    // Temporary debug method - call this to disable responsive behavior
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
        
        // Early exit if desktop and no previous modifications
        if (currentBreakpoint === 'desktop' && !this.hasModifications) {
            return;
        }
        
        console.log(`Applying responsive params for: ${currentBreakpoint}`);
        
        containers.forEach(container => {
            const originalParams = this.originalParams.get(container);
            
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
                // Apply responsive parameters
                const params = this.responsiveParams[currentBreakpoint];
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
    
    restoreOriginalSyncImages(container) {
        try {
            console.log('Restoring original sync-images for container:', container);
            
            // Get the original parameters
            const originalParams = this.originalParams.get(container);
            if (!originalParams) {
                console.warn('No original parameters found for container');
                return;
            }
            
            // Restore the data attributes
            if (originalParams.rows) container.dataset.rows = originalParams.rows;
            if (originalParams.cols) container.dataset.cols = originalParams.cols;
            if (originalParams.gap) container.dataset.gap = originalParams.gap;
            if (originalParams.maxWidth) container.dataset.maxWidth = originalParams.maxWidth;
            if (originalParams.aspectRatio) container.dataset.aspectRatio = originalParams.aspectRatio;
            if (originalParams.minHeight) container.dataset.minHeight = originalParams.minHeight;
            
            // Apply the original styles that the sync-images system expects
            const syncGrid = container.querySelector('.sync-images-grid');
            if (syncGrid) {
                // Set grid template based on original parameters
                if (originalParams.rows && originalParams.cols) {
                    syncGrid.style.gridTemplateColumns = `repeat(${originalParams.cols}, 1fr)`;
                    syncGrid.style.gridTemplateRows = `repeat(${originalParams.rows}, auto)`;
                }
                
                // Apply gap if specified
                if (originalParams.gap) {
                    syncGrid.style.gap = originalParams.gap;
                }
            }
            
            // Apply container max width if specified
            if (originalParams.maxWidth) {
                container.style.maxWidth = originalParams.maxWidth;
            }
            
            // Apply the original styles to image containers
            const imageContainers = syncGrid.querySelectorAll('.sync-image-container');
            imageContainers.forEach(imgContainer => {
                // Apply height and aspect ratio - this will trigger the CSS custom properties
                if (originalParams.minHeight) {
                    imgContainer.style.height = originalParams.minHeight;
                    imgContainer.style.minHeight = originalParams.minHeight;
                    // Set the CSS custom property that the CSS expects
                    imgContainer.style.setProperty('--custom-height', originalParams.minHeight);
                }
                
                if (originalParams.aspectRatio) {
                    imgContainer.style.aspectRatio = originalParams.aspectRatio;
                    // Set the CSS custom property that the CSS expects
                    imgContainer.style.setProperty('--aspect-ratio', originalParams.aspectRatio);
                }
            });
            
            console.log('Successfully restored original sync-images configuration');
            
        } catch (error) {
            console.error('Error restoring original sync-images:', error);
        }
    }
    
    applyCSSUpdates(container, breakpoint) {
        const syncGrid = container.querySelector('.sync-images-grid');
        if (!syncGrid) return;
        
        if (breakpoint === 'desktop') {
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
            
            // Show all images on desktop and completely restore original styles
            const imageContainers = syncGrid.querySelectorAll('.sync-image-container');
            console.log(`Found ${imageContainers.length} image containers to restore on desktop`);
            
            imageContainers.forEach((imgContainer, index) => {
                console.log(`Restoring container ${index + 1}: currently display="${imgContainer.style.display}"`);
                
                // Force display to be visible (ensure they're not hidden)
                imgContainer.style.display = 'block';
                imgContainer.style.visibility = 'visible';
                imgContainer.style.opacity = '1';
                
                // Remove ALL custom style properties that might interfere
                imgContainer.style.removeProperty('min-height');
                imgContainer.style.removeProperty('height');
                imgContainer.style.removeProperty('aspect-ratio');
                
                // Restore image styles too
                const img = imgContainer.querySelector('.sync-image');
                if (img) {
                    img.style.display = 'block';
                    img.style.visibility = 'visible';
                    img.style.opacity = '1';
                    img.style.removeProperty('height');
                    img.style.removeProperty('object-fit');
                }
                
                // Try to completely reset the container
                setTimeout(() => {
                    imgContainer.removeAttribute('style');
                    if (img) img.removeAttribute('style');
                    console.log(`Container ${index + 1} fully reset`);
                }, 10);
            });
            
            // Also force the grid container to be visible
            syncGrid.style.display = 'grid';
            syncGrid.style.visibility = 'visible';
            
            // Completely reinitialize the sync-images container
            setTimeout(() => {
                // Restore the original sync-images system by calling its applyFixedDimensions method
                this.restoreOriginalSyncImages(container);
                
                // Force a repaint by accessing offsetHeight
                container.offsetHeight;
                
                // Final check - count visible images
                const visibleImages = syncGrid.querySelectorAll('.sync-image-container:not([style*="display: none"])');
                console.log(`Final check: ${visibleImages.length} images should be visible`);
                
            }, 100);
            
            this.hasModifications = false; // Reset modification flag
            console.log('Fully restored desktop sync-images state');
        } else {
            // Apply responsive CSS
            const params = this.responsiveParams[breakpoint];
            syncGrid.style.setProperty('--responsive-gap', params.gap);
            syncGrid.style.setProperty('--responsive-columns', `repeat(${params.cols}, 1fr)`);
            syncGrid.style.setProperty('--responsive-rows', `repeat(${params.rows}, auto)`);
            container.style.setProperty('--responsive-max-width', params.maxWidth);
            container.style.setProperty('--responsive-min-height', params.minHeight);
            
            // Apply the responsive grid layout
            syncGrid.style.gridTemplateColumns = `repeat(${params.cols}, 1fr)`;
            syncGrid.style.gridTemplateRows = `repeat(${params.rows}, auto)`;
            syncGrid.style.gap = params.gap;
            container.style.maxWidth = params.maxWidth;
            
            // Control number of visible images based on rows × cols
            const maxImages = params.rows * params.cols;
            const imageContainers = syncGrid.querySelectorAll('.sync-image-container');
            
            imageContainers.forEach((imgContainer, index) => {
                if (index < maxImages) {
                    // Show this image
                    imgContainer.style.display = '';
                    
                    // Force the height with important to override other CSS and aspect ratio
                    imgContainer.style.setProperty('min-height', params.minHeight, 'important');
                    imgContainer.style.setProperty('height', params.minHeight, 'important');
                    imgContainer.style.setProperty('aspect-ratio', 'unset', 'important');
                    
                    // Also target the image inside if needed
                    const img = imgContainer.querySelector('.sync-image');
                    if (img) {
                        img.style.setProperty('height', '100%', 'important');
                        img.style.setProperty('object-fit', 'cover', 'important');
                    }
                    
                    console.log(`Set image container ${index} height to ${params.minHeight}`);
                } else {
                    // Hide extra images
                    imgContainer.style.display = 'none';
                }
            });
        }
    }
    
    // Method to set custom mobile heights
    setMobileHeights(mobileHeight, tabletHeight) {
        if (mobileHeight) {
            this.responsiveParams.mobile.minHeight = mobileHeight;
            console.log(`Set mobile height to: ${mobileHeight}`);
        }
        if (tabletHeight) {
            this.responsiveParams.tablet.minHeight = tabletHeight;
            console.log(`Set tablet height to: ${tabletHeight}`);
        }
        
        this.applyResponsiveParams();
    }
    
    // Method to test height changes quickly
    testHeight(heightValue) {
        const currentBreakpoint = this.getCurrentBreakpoint();
        if (currentBreakpoint !== 'desktop') {
            this.responsiveParams[currentBreakpoint].minHeight = heightValue;
            this.applyResponsiveParams();
            console.log(`Testing ${currentBreakpoint} height: ${heightValue}`);
        } else {
            console.log('Cannot test height on desktop - responsive not active');
        }
    }
    
    // Method to customize parameters for specific breakpoints
    setCustomParams(breakpoint, params) {
        if (this.responsiveParams[breakpoint]) {
            this.responsiveParams[breakpoint] = {
                ...this.responsiveParams[breakpoint],
                ...params
            };
            this.applyResponsiveParams();
        }
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
            console.log('Sync-images detected, initializing simple responsive...');
            window.simpleResponsiveSyncImages = new SimpleResponsiveSyncImages();
        } else {
            console.log('No sync-images found, skipping responsive initialization');
        }
    }, 500);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleResponsiveSyncImages;
} 