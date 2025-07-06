class ColumnBalancer {
    constructor() {
        this.leftColumn = null;
        this.rightColumn = null;
        this.resizeTimeout = null;
    }

    init() {
        // Wait for DOM and fonts to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        // Re-balance on window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.balance(), 250);
        });
    }

    setup() {
        // Find the side columns
        const columns = document.querySelectorAll('.side-column');
        if (columns.length >= 2) {
            this.rightColumn = columns[0]; // First in DOM (appears right in RTL)
            this.leftColumn = columns[1];  // Second in DOM (appears left in RTL)
            
            // Initial balance after a small delay to ensure all content is rendered
            setTimeout(() => this.balance(), 100);
        }
    }

    balance() {
        if (!this.leftColumn || !this.rightColumn) return;

        // Reset all spacer heights first
        this.resetSpacers();

        // Get all content sections from both columns
        const rightSections = Array.from(this.rightColumn.querySelectorAll('.content-section.active'));
        const leftSections = Array.from(this.leftColumn.querySelectorAll('.content-section.active'));
        
        // Get all spacers from both columns
        const rightSpacers = Array.from(this.rightColumn.querySelectorAll('.content-section.spacer'));
        const leftSpacers = Array.from(this.leftColumn.querySelectorAll('.content-section.spacer'));

        let rightHeight = 0;
        let leftHeight = 0;
        let rightIndex = 0;
        let leftIndex = 0;
        let rightSpacerIndex = 0;
        let leftSpacerIndex = 0;

        // Process sections in the order they should appear visually
        for (let i = 0; i < 10; i++) { // We have 10 sections total
            if (i % 2 === 0) {
                // Odd sections (1, 3, 5, 7, 9) go to RIGHT column
                if (rightIndex < rightSections.length) {
                    const sectionHeight = this.getElementHeight(rightSections[rightIndex]);
                    rightHeight += sectionHeight;
                    rightIndex++;
                }

                // Add spacer to LEFT column to balance
                if (leftSpacerIndex < leftSpacers.length) {
                    const heightDiff = rightHeight - leftHeight;
                    if (heightDiff > 0) {
                        leftSpacers[leftSpacerIndex].style.minHeight = `${heightDiff}px`;
                        leftHeight += heightDiff;
                    }
                    leftSpacerIndex++;
                }
            } else {
                // Even sections (2, 4, 6, 8, 10) go to LEFT column
                if (leftIndex < leftSections.length) {
                    const sectionHeight = this.getElementHeight(leftSections[leftIndex]);
                    leftHeight += sectionHeight;
                    leftIndex++;
                }

                // Add spacer to RIGHT column to balance
                if (rightSpacerIndex < rightSpacers.length) {
                    const heightDiff = leftHeight - rightHeight;
                    if (heightDiff > 0) {
                        rightSpacers[rightSpacerIndex].style.minHeight = `${heightDiff}px`;
                        rightHeight += heightDiff;
                    }
                    rightSpacerIndex++;
                }
            }
        }
    }

    resetSpacers() {
        // Reset all spacer heights
        const allSpacers = document.querySelectorAll('.content-section.spacer');
        allSpacers.forEach(spacer => {
            spacer.style.minHeight = '';
        });
    }

    getElementHeight(element) {
        if (!element) return 0;
        
        // Include margin in height calculation
        const style = window.getComputedStyle(element);
        const marginTop = parseInt(style.marginTop) || 0;
        const marginBottom = parseInt(style.marginBottom) || 0;
        
        return element.offsetHeight + marginTop + marginBottom;
    }
}

// Initialize when script loads
const columnBalancer = new ColumnBalancer();
columnBalancer.init(); 