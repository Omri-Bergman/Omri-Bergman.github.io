/**
 * BookshelfCursor - Shows fake cursors on other books when hovering over one
 * Uses the generic FakeCursorManager for consistent cursor behavior
 */
class BookshelfCursor {
    constructor(options = {}) {
        this.options = {
            bookshelfSelector: options.bookshelfSelector || '.bibliography-list',
            bookItemSelector: options.bookItemSelector || '.book-item',
            maxCursors: options.maxCursors || 999, // Show cursors on all books by default
            cursorUpdateDelay: options.cursorUpdateDelay || 50,
            enabled: true,
            ...options
        };

        // Initialize with generic cursor manager (using default settings)
        this.cursorManager = new FakeCursorManager({
            cursorSize: { width: 26, height: 26 }
        });

        // State tracking
        this.bookElements = [];
        this.activeCursors = new Map(); // bookId -> cursorId
        this.hoveredBook = null;
        this.activeBooksForCursors = null; // indices of books that should show cursors
        this.updateTimeout = null;

        this.init();
    }

    init() {
        // Get bookshelf and books
        this.bookshelf = document.querySelector(this.options.bookshelfSelector);
        if (!this.bookshelf) {
            console.warn('BookshelfCursor: Bookshelf not found:', this.options.bookshelfSelector);
            return;
        }

        this.bookElements = Array.from(this.bookshelf.querySelectorAll(this.options.bookItemSelector));
        if (this.bookElements.length === 0) {
            console.warn('BookshelfCursor: No books found');
            return;
        }

        // Create cursors for each book
        this.createBookCursors();

        // Add event listeners
        this.addEventListeners();

        // Monitor dragging state
        this.setupDragObserver();

        // Set bookshelf item dimensions to match navbar button
        this.updateBookDimensions();

        // Update dimensions on resize
        window.addEventListener('resize', () => {
            this.updateBookDimensions();
        });

        // Register cursor update handler
        this.cursorManager.onMouseMove(this.handleCursorUpdate.bind(this));
    }

    createBookCursors() {
        // Create cursors for books (we'll show/hide as needed)
        this.bookElements.forEach((book, index) => {
            const bookId = `book-${index}`;
            const cursorId = `bookshelf-cursor-${index}`;
            
            // Create cursor using default from FakeCursorManager
            const cursor = this.cursorManager.createCursor(cursorId);
            // Uses default size and SVG from FakeCursorManager

            // Attach cursor to the book spine area
            this.cursorManager.attachCursor(cursorId, book);
            
            // Store mapping
            this.activeCursors.set(bookId, cursorId);
            
            // Set book ID for identification
            book.dataset.bookId = bookId;
        });
    }

    calculateGridDimensions() {
        // Use EXACT same logic as navbar.js to match button dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Adjust target face size based on total pixel count for performance
        const totalPixels = screenWidth * screenHeight;
        let targetFaceSize;

        if (totalPixels > 3840 * 2160) { // 4K+
            targetFaceSize = 200;
        } else if (totalPixels > 1920 * 1080) { // 1440p
            targetFaceSize = 170;
        } else { // 1080p and below
            targetFaceSize = 150;
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

    updateBookDimensions() {
        // Calculate the same dimensions as navbar button
        const { squareWidth, squareHeight } = this.calculateGridDimensions();
        
        // Apply width from navbar calculation, keep proportional height
        const bookWidth = squareWidth;
        const bookHeight = squareHeight * 4; // Make books taller than panels for bookshelf effect
        
        // Update CSS custom properties for responsive book sizing
        document.documentElement.style.setProperty('--book-width', `${bookWidth}px`);
        document.documentElement.style.setProperty('--book-height', `${bookHeight}px`);
        
        console.log(`📚 Book dimensions updated: ${bookWidth.toFixed(1)}px × ${bookHeight.toFixed(1)}px (matches navbar panel width)`);
    }

    addEventListeners() {
        this.bookElements.forEach((book, index) => {
            book.addEventListener('mouseenter', (e) => {
                if (!this.options.enabled) return;
                this.handleBookHover(book, index);
            });

            book.addEventListener('mouseleave', (e) => {
                this.handleBookLeave(book, index);
            });
        });
    }

    setupDragObserver() {
        // Use MutationObserver to watch for dragging class changes
        if ('MutationObserver' in window) {
            this.dragObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (this.bookshelf.classList.contains('dragging')) {
                            this.hideAllCursors();
                        }
                    }
                });
            });

            this.dragObserver.observe(this.bookshelf, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    handleBookHover(hoveredBook, hoveredIndex) {
        // Don't show cursors if dragging or disabled
        if (this.bookshelf.classList.contains('dragging') || !this.options.enabled) {
            return;
        }

        this.hoveredBook = hoveredBook;
        
        // Clear any existing timeout
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        // Slight delay to prevent flickering
        this.updateTimeout = setTimeout(() => {
            // Double-check we're not dragging before showing cursors
            if (!this.bookshelf.classList.contains('dragging')) {
                this.showCursorsOnOtherBooks(hoveredIndex);
            }
        }, 50);
    }

    handleBookLeave(book, index) {
        this.hoveredBook = null;
        this.activeBooksForCursors = null;
        
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        // Hide all cursors
        this.hideAllCursors();
    }

    showCursorsOnOtherBooks(hoveredIndex) {
        if (!this.hoveredBook) return;

        // Get other books (not the hovered one)
        const otherBooks = this.bookElements.filter((_, index) => index !== hoveredIndex);
        
        // Limit number of cursors for performance
        const booksToShow = otherBooks.slice(0, this.options.maxCursors);
        
        // Store which books should show cursors
        this.activeBooksForCursors = booksToShow.map(book => this.bookElements.indexOf(book));
        
        // Initial positioning
        this.updateCursorPositions();
    }

    updateCursorPositions() {
        if (!this.hoveredBook || !this.activeBooksForCursors) return;

        // Get mouse position relative to the hovered book
        const mousePos = this.cursorManager.getMousePositionPercentage(this.hoveredBook);
        
        this.activeBooksForCursors.forEach((bookIndex) => {
            const book = this.bookElements[bookIndex];
            const bookId = `book-${bookIndex}`;
            const cursorId = this.activeCursors.get(bookId);
            
            if (cursorId && book) {
                // Position cursor at the same relative position on other books
                const position = this.calculateProportionalPosition(book, mousePos.xPercent, mousePos.yPercent);
                this.cursorManager.showCursor(cursorId, position.x, position.y, book);
            }
        });
    }

    calculateProportionalPosition(book, xPercent, yPercent) {
        const bookBounds = this.cursorManager.getCachedBounds(book);
        
        // Map the mouse position from hovered book to this book
        const x = bookBounds.left + (xPercent * bookBounds.width);
        const y = bookBounds.top + (yPercent * bookBounds.height);
        
        return { x, y };
    }

    hideAllCursors() {
        this.activeCursors.forEach((cursorId) => {
            this.cursorManager.hideCursor(cursorId);
        });
    }

    handleCursorUpdate(mousePosition) {
        // Update cursor positions dynamically as mouse moves
        if (this.hoveredBook && this.activeBooksForCursors && !this.bookshelf.classList.contains('dragging')) {
            this.updateCursorPositions();
        }
    }

    // Public API methods
    enable() {
        this.options.enabled = true;
    }

    disable() {
        this.options.enabled = false;
        this.hideAllCursors();
    }

    setMaxCursors(max) {
        this.options.maxCursors = max;
    }

    // Update cursors when bookshelf content changes
    refresh() {
        this.hideAllCursors();
        this.bookElements = Array.from(this.bookshelf.querySelectorAll(this.options.bookItemSelector));
        this.createBookCursors();
        this.addEventListeners();
    }

    destroy() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        // Disconnect drag observer
        if (this.dragObserver) {
            this.dragObserver.disconnect();
        }

        // Remove all cursors
        this.activeCursors.forEach((cursorId) => {
            this.cursorManager.removeCursor(cursorId);
        });

        this.activeCursors.clear();
        this.cursorManager.destroy();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have the required FakeCursorManager
    if (typeof FakeCursorManager === 'undefined') {
        console.warn('BookshelfCursor: FakeCursorManager not found. Please load fake-cursor-manager.js first.');
        return;
    }

    const bibliographyList = document.querySelector('.bibliography-list');
    if (bibliographyList) {
        // Create the bookshelf cursor system
        window.bookshelfCursor = new BookshelfCursor();
        // Uses defaults: all books, 50ms update delay
    }
});

// Export for use
window.BookshelfCursor = BookshelfCursor; 