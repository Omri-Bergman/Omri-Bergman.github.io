/**
 * Synchronized Text Column Scrolling
 * Synchronizes scroll position between the two side columns in three-column layout
 */

class SynchronizedTextScroll {
    constructor(containerSelector = '.three-column-container') {
        this.container = document.querySelector(containerSelector);
        this.leftColumn = null;
        this.rightColumn = null;
        this.isScrolling = false; // Prevent infinite scroll loops
        this.scrollTimeout = null;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        // Find the side columns
        const sideColumns = this.container.querySelectorAll('.side-column');
        
        if (sideColumns.length !== 2) {
            console.warn('SynchronizedTextScroll: Expected 2 side columns, found', sideColumns.length);
            return;
        }
        
        // In RTL layout, first side-column is the right one, second is the left one
        this.rightColumn = sideColumns[0]; // First in DOM = right side in RTL
        this.leftColumn = sideColumns[1];  // Second in DOM = left side in RTL
        
        this.setupScrollListeners();
    }
    
    setupScrollListeners() {
        // Add scroll listeners to both columns
        this.rightColumn.addEventListener('scroll', (e) => {
            this.handleScroll(e, this.rightColumn, this.leftColumn);
        });
        
        this.leftColumn.addEventListener('scroll', (e) => {
            this.handleScroll(e, this.leftColumn, this.rightColumn);
        });
    }
    
    handleScroll(event, sourceColumn, targetColumn) {
        // Prevent infinite scroll loops
        if (this.isScrolling) {
            return;
        }
        
        this.isScrolling = true;
        
        // Calculate scroll percentage of source column
        const scrollTop = sourceColumn.scrollTop;
        const scrollHeight = sourceColumn.scrollHeight - sourceColumn.clientHeight;
        const scrollPercentage = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        
        // Apply the same percentage to target column
        const targetScrollHeight = targetColumn.scrollHeight - targetColumn.clientHeight;
        const targetScrollTop = scrollPercentage * targetScrollHeight;
        
        // Smoothly scroll the target column
        targetColumn.scrollTo({
            top: targetScrollTop,
            behavior: 'auto' // Use 'auto' for immediate sync, 'smooth' for animated
        });
        
        // Reset the scrolling flag after a short delay
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
        }, 10);
    }
    
    // Method to enable/disable synchronization
    enableSync() {
        this.setupScrollListeners();
    }
    
    disableSync() {
        this.rightColumn.removeEventListener('scroll', this.handleScroll);
        this.leftColumn.removeEventListener('scroll', this.handleScroll);
    }
    
    // Method to manually sync columns to a specific percentage
    syncToPercentage(percentage) {
        this.isScrolling = true;
        
        const rightScrollHeight = this.rightColumn.scrollHeight - this.rightColumn.clientHeight;
        const leftScrollHeight = this.leftColumn.scrollHeight - this.leftColumn.clientHeight;
        
        const rightScrollTop = percentage * rightScrollHeight;
        const leftScrollTop = percentage * leftScrollHeight;
        
        this.rightColumn.scrollTo({ top: rightScrollTop, behavior: 'smooth' });
        this.leftColumn.scrollTo({ top: leftScrollTop, behavior: 'smooth' });
        
        setTimeout(() => {
            this.isScrolling = false;
        }, 100);
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SynchronizedTextScroll();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SynchronizedTextScroll;
} 