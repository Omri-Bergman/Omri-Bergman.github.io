/**
 * Three Column Cursor Sync - Add fake cursor behavior to images in middle column
 * Shows fake cursors on other images when hovering over one image
 */

class ThreeColumnCursorSync {
    constructor(containerSelector = '.three-column-container') {
        this.container = document.querySelector(containerSelector);
        this.images = [];
        this.cursors = [];
        this.mousePosition = { x: 0, y: 0 };
        this.activeImageIndex = null;
        this.isHovering = false;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        // Find the middle column and all images in it
        const middleColumn = this.container.querySelector('.middle-column');
        if (!middleColumn) {
            console.warn('ThreeColumnCursorSync: Middle column not found');
            return;
        }
        
        // Find all images in the middle column
        this.images = middleColumn.querySelectorAll('.image-pair img');
        
        if (this.images.length < 2) {
            console.warn('ThreeColumnCursorSync: Need at least 2 images');
            return;
        }
        
        // Create cursors for each image
        this.images.forEach((img, index) => {
            // Create a wrapper div for each image to position cursor correctly
            const wrapper = document.createElement('div');
            wrapper.className = 'image-cursor-wrapper';
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            
            // Wrap the image
            const parent = img.parentElement;
            parent.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            // Create cursor using FakeCursorManager's default cursor
            const cursor = document.createElement('div');
            cursor.className = 'three-column-cursor';
            
            // Use the default cursor SVG from FakeCursorManager
            const tempManager = new FakeCursorManager();
            cursor.innerHTML = tempManager.getDefaultCursorSVG();
            cursor.style.display = 'none';
            
            // Add cursor to the wrapper
            wrapper.appendChild(cursor);
            this.cursors.push(cursor);
            
            // Add event listeners to the image
            img.addEventListener('mousemove', (e) => this.handleMouseMove(e, index));
            img.addEventListener('mouseleave', () => this.handleMouseLeave());
            img.addEventListener('mouseout', () => this.handleMouseLeave());
        });
        
        // Add global mouse leave handler
        document.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.activeImageIndex = null;
            this.updateCursors();
        });
    }
    
    handleMouseMove(e, imageIndex) {
        const img = this.images[imageIndex];
        const rect = img.getBoundingClientRect();
        
        // Calculate relative position (0-100%)
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        this.mousePosition = { x, y };
        this.activeImageIndex = imageIndex;
        this.isHovering = true;
        
        this.updateCursors();
    }
    
    handleMouseLeave() {
        this.isHovering = false;
        this.activeImageIndex = null;
        this.updateCursors();
    }
    
    updateCursors() {
        this.cursors.forEach((cursor, index) => {
            if (this.isHovering && this.activeImageIndex !== null && this.activeImageIndex !== index) {
                // Check if the current image and the active image are in the same pair
                const activeImg = this.images[this.activeImageIndex];
                const currentImg = this.images[index];
                
                // Get the parent image-pair containers
                const activeImagePair = activeImg.closest('.image-pair');
                const currentImagePair = currentImg.closest('.image-pair');
                
                // Only show cursor if they're in the same image pair
                if (activeImagePair && currentImagePair && activeImagePair === currentImagePair) {
                    cursor.style.display = 'block';
                    cursor.style.left = `${this.mousePosition.x}%`;
                    cursor.style.top = `${this.mousePosition.y}%`;
                } else {
                    cursor.style.display = 'none';
                }
            } else {
                cursor.style.display = 'none';
            }
        });
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThreeColumnCursorSync();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeColumnCursorSync;
} 