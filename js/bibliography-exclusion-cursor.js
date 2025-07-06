/**
 * BibliographyExclusionCursor - Shows cursors on all author names except the hovered one
 * Uses the generic FakeCursorManager for cursor management
 */
class BibliographyExclusionCursor {
    constructor(options = {}) {
        this.options = {
            bibliographySelector: options.bibliographySelector || '.bibliography-text',
            enabled: true,
            ...options
        };

        // Initialize with generic cursor manager - using same settings as proportional text
        this.cursorManager = new FakeCursorManager({
            cursorSize: { width: 26, height: 26 }
        });

        // Storage for author elements and their cursors
        this.authorElements = [];
        this.authorCursors = new Map(); // authorIndex -> cursorId

        // Current hovered author index
        this.hoveredAuthorIndex = -1;

        this.init();
    }

    init() {        
        // Find bibliography container
        this.bibliographyElement = document.querySelector(this.options.bibliographySelector);
        if (!this.bibliographyElement) {
            console.warn('BibliographyExclusionCursor: Bibliography element not found:', this.options.bibliographySelector);
            return;
        }

        // Parse and wrap author names
        this.parseAndWrapAuthorNames();

        // Create cursors for each author
        this.createAuthorCursors();

        // Set up event listeners
        this.setupEventListeners();
            }

    parseAndWrapAuthorNames() {
        const text = this.bibliographyElement.innerHTML;
        
        // Simplified patterns based on the actual bibliography format
        const patterns = [
            // Hebrew names with comma (e.g., "גילון פיסטינר, דורית")
            /([א-ת]+(?:\s+[א-ת]+)*,\s*[א-ת]+)/g,
            
            // Hebrew names without comma (e.g., "יופי")  
            /([א-ת]+),\s*"/g,
            
            // English Last, First format (e.g., "Addison, Heather")
            /([A-Z][a-z]+,\s+[A-Z][a-z]+)/g,
            
            // English First Last format at line start (e.g., "Rosalind Gill")
            /(?:^|\s)([A-Z][a-z]+\s+[A-Z][a-z]+),/g,
            
            // Three names (e.g., "Elisabeth K. Kelan")
            /([A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+)/g
        ];

        let processedText = text;
        let authorIndex = 0;

        // Process each pattern
        patterns.forEach((pattern, patternIndex) => {
            const matches = [...processedText.matchAll(pattern)];
            
            processedText = processedText.replace(pattern, (match, name) => {
                const wrappedName = `<span class="bibliography-author" data-author-index="${authorIndex}">${name}</span>`;
                authorIndex++;
                return match.replace(name, wrappedName);
            });
        });

        this.bibliographyElement.innerHTML = processedText;

        // Store all author elements
        this.authorElements = Array.from(this.bibliographyElement.querySelectorAll('.bibliography-author'));
        
    }

    createAuthorCursors() {
        this.authorElements.forEach((authorElement, index) => {
            const cursorId = `bibliography-cursor-${index}`;
            
            // Create cursor using the generic manager (with default SVG)
            const cursor = this.cursorManager.createCursor(cursorId);

            // Attach cursor to the bibliography container
            this.cursorManager.attachCursor(cursorId, this.bibliographyElement);

            // Store the mapping
            this.authorCursors.set(index, cursorId);
        });
    }



    setupEventListeners() {
        this.authorElements.forEach((authorElement, index) => {
            authorElement.addEventListener('mouseenter', () => {
                this.handleAuthorHover(index);
            });

            authorElement.addEventListener('mouseleave', () => {
                this.handleAuthorLeave(index);
            });
        });

        // Also listen for mouse leaving the entire bibliography area
        this.bibliographyElement.addEventListener('mouseleave', () => {
            this.hideAllCursors();
        });
    }

    handleAuthorHover(hoveredIndex) {
        if (!this.options.enabled) return;

        this.hoveredAuthorIndex = hoveredIndex;

        // Show cursors on all OTHER authors
        let cursorsShown = 0;
        this.authorElements.forEach((authorElement, index) => {
            if (index !== hoveredIndex) {
                this.showCursorOnAuthor(index);
                cursorsShown++;
            }
        });
        
        // Hide cursor on the hovered author
        const hoveredCursorId = this.authorCursors.get(hoveredIndex);
        if (hoveredCursorId) {
            this.cursorManager.hideCursor(hoveredCursorId);
        }
    }

    handleAuthorLeave(leftIndex) {
        // Small delay to prevent flickering when moving between authors
        setTimeout(() => {
            if (this.hoveredAuthorIndex === leftIndex) {
                this.hideAllCursors();
                this.hoveredAuthorIndex = -1;
            }
        }, 50);
    }

    showCursorOnAuthor(authorIndex) {
        const authorElement = this.authorElements[authorIndex];
        const cursorId = this.authorCursors.get(authorIndex);
        
        if (!authorElement || !cursorId) {
            return;
        }

        // Get author element bounds
        const authorBounds = authorElement.getBoundingClientRect();
        const bibliographyBounds = this.bibliographyElement.getBoundingClientRect();

        // Position cursor relative to the bibliography container
        const relativeX = authorBounds.left - bibliographyBounds.left + (authorBounds.width / 2);
        const relativeY = authorBounds.top - bibliographyBounds.top + (authorBounds.height / 2);

        // Show cursor at the author's position (relative to bibliography container)
        this.cursorManager.showCursor(cursorId, relativeX, relativeY);
        
        // Log the final cursor position and verify visibility
        const cursorElement = this.cursorManager.cursors.get(cursorId);
    }

    hideAllCursors() {
        this.authorCursors.forEach((cursorId) => {
            this.cursorManager.hideCursor(cursorId);
        });
    }

    // Public API methods
    enable() {
        this.options.enabled = true;
    }

    disable() {
        this.options.enabled = false;
        this.hideAllCursors();
    }

    destroy() {
        // Remove all cursors
        this.authorCursors.forEach((cursorId) => {
            this.cursorManager.removeCursor(cursorId);
        });

        // Clean up
        this.authorElements = [];
        this.authorCursors.clear();
    }
}

// Export for use
window.BibliographyExclusionCursor = BibliographyExclusionCursor; 