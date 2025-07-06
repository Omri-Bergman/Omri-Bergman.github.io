/**
 * Mobile Bibliography Interaction
 * Handles tap-to-expand functionality for bibliography items on mobile devices
 */

class MobileBibliography {
    constructor() {
        this.init();
    }

    init() {
        // Only initialize on mobile/tablet devices
        if (!this.isMobileDevice()) {
            return;
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    isMobileDevice() {
        // Debug info
        console.log('Device detection:', {
            width: window.innerWidth,
            hasTouch: 'ontouchstart' in window,
            maxTouchPoints: navigator.maxTouchPoints
        });
        
        // Prioritize screen size over touch detection to avoid Chrome DevTools emulation issues
        if (window.innerWidth <= 768) {
            console.log('---Mobile mode: Screen width <= 768px');
            return true;
        }
        
        // Only consider touch if screen is also reasonably small
        if (window.innerWidth <= 1024 && (
            'ontouchstart' in window || 
            navigator.maxTouchPoints > 0
        )) {
            console.log('---Mobile mode: Touch device with width:', window.innerWidth);
            return true;
        }
        
        console.log('---Desktop mode: Large screen, no touch or touch ignored');
        return false;
    }

    setupEventListeners() {
        // Find all bibliography items
        const bibliographyItems = document.querySelectorAll('.bibliography-list .book-item, .bibliography-list .dvd-item');
        
        bibliographyItems.forEach(item => {
            // Add click/tap event listener
            item.addEventListener('click', (e) => this.handleBookTap(e, item));
            
            // Prevent text selection while tapping
            item.addEventListener('selectstart', (e) => e.preventDefault());
        });

        console.log(`Mobile bibliography initialized with ${bibliographyItems.length} items`);
    }

    handleBookTap(event, bookItem) {
        event.preventDefault();
        event.stopPropagation();

        // Toggle expanded state
        const isExpanded = bookItem.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse the book
            this.collapseBook(bookItem);
        } else {
            // Collapse any other expanded books first
            this.collapseAllBooks();
            
            // Expand this book
            this.expandBook(bookItem);
        }
    }

    expandBook(bookItem) {
        bookItem.classList.add('expanded');
        
        // Smooth scroll to make sure the expanded book is visible
        setTimeout(() => {
            bookItem.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);

        console.log('Book expanded:', bookItem.querySelector('.book-spine')?.textContent?.trim());
    }

    collapseBook(bookItem) {
        bookItem.classList.remove('expanded');
        
        console.log('Book collapsed:', bookItem.querySelector('.book-spine')?.textContent?.trim());
    }

    collapseAllBooks() {
        const expandedBooks = document.querySelectorAll('.bibliography-list .book-item.expanded, .bibliography-list .dvd-item.expanded');
        expandedBooks.forEach(book => {
            book.classList.remove('expanded');
        });
    }

    // Public method to collapse all books (can be called from outside)
    reset() {
        this.collapseAllBooks();
    }
}

// Initialize the mobile bibliography system
const mobileBibliography = new MobileBibliography();

// Make it available globally for debugging
window.mobileBibliography = mobileBibliography; 