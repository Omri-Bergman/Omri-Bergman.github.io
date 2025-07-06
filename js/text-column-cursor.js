/**
 * TextColumnCursor - Mirrors cursor between left and right text columns
 * Uses the generic FakeCursorManager for the side columns
 */
class TextColumnCursor {
    constructor(options = {}) {
        this.options = {
            columnSelector: options.columnSelector || '.side-column',
            enabled: true,
            cursorSize: { width: 25, height: 25 }, // Use FakeCursorManager default size
            ...options
        };

        // Initialize with generic cursor manager
        this.cursorManager = new FakeCursorManager({
            cursorSize: this.options.cursorSize
        });

        // Create cursors for both columns
        this.leftCursorId = 'left-column-cursor';
        this.rightCursorId = 'right-column-cursor';
        
        // Use default cursor from FakeCursorManager
        this.leftCursor = this.cursorManager.createCursor(this.leftCursorId);
        this.rightCursor = this.cursorManager.createCursor(this.rightCursorId);

        // Get column elements
        this.columnElements = document.querySelectorAll(this.options.columnSelector);
        if (this.columnElements.length < 2) {
            console.warn('TextColumnCursor: Need at least 2 columns, found:', this.columnElements.length);
            return;
        }

        // In RTL layout: first column in DOM = right column, second = left column
        this.rightColumnElement = this.columnElements[0];
        this.leftColumnElement = this.columnElements[1];

        // Create cursor overlay containers
        this.createCursorOverlays();

        // Attach cursors to their respective overlay containers
        this.cursorManager.attachCursor(this.rightCursorId, this.rightOverlay);
        this.cursorManager.attachCursor(this.leftCursorId, this.leftOverlay);

        // Register our cursor update handler
        this.cursorManager.onMouseMove(this.handleColumnCursorUpdate.bind(this));

        this.init();
    }

    init() {
        // Set up intersection observer for performance
        this.cursorManager.observeElement(this.leftColumnElement, this.leftCursorId);
        this.cursorManager.observeElement(this.rightColumnElement, this.rightCursorId);
    }

    createCursorOverlays() {
        // Get the parent container
        const container = document.querySelector('.three-column-container');
        const containerBounds = container.getBoundingClientRect();
        
        // Get exact bounds of the columns
        const rightBounds = this.rightColumnElement.getBoundingClientRect();
        const leftBounds = this.leftColumnElement.getBoundingClientRect();
        
        // Create overlay for right column
        this.rightOverlay = document.createElement('div');
        this.rightOverlay.className = 'side-column-cursor-overlay';
        this.rightOverlay.style.left = (rightBounds.left - containerBounds.left) + 'px';
        this.rightOverlay.style.width = rightBounds.width + 'px';
        container.appendChild(this.rightOverlay);

        // Create overlay for left column  
        this.leftOverlay = document.createElement('div');
        this.leftOverlay.className = 'side-column-cursor-overlay';
        this.leftOverlay.style.left = (leftBounds.left - containerBounds.left) + 'px';
        this.leftOverlay.style.width = leftBounds.width + 'px';
        container.appendChild(this.leftOverlay);
    }

    handleColumnCursorUpdate(mousePosition) {
        if (!this.options.enabled) {
            this.hideCursor(this.leftCursorId);
            this.hideCursor(this.rightCursorId);
            return;
        }

        const isInLeftColumn = this.isMouseInColumn(mousePosition, this.leftColumnElement);
        const isInRightColumn = this.isMouseInColumn(mousePosition, this.rightColumnElement);

        if (isInLeftColumn) {
            // Show cursor in right column (mirror position)
            this.showMirrorCursor(mousePosition, this.leftColumnElement, this.rightColumnElement, this.rightCursorId);
            this.hideCursor(this.leftCursorId);
        } else if (isInRightColumn) {
            // Show cursor in left column (mirror position)
            this.showMirrorCursor(mousePosition, this.rightColumnElement, this.leftColumnElement, this.leftCursorId);
            this.hideCursor(this.rightCursorId);
        } else {
            // Hide both cursors when not in either column
            this.hideCursor(this.leftCursorId);
            this.hideCursor(this.rightCursorId);
        }
    }

    isMouseInColumn(mousePosition, columnElement) {
        const columnBounds = this.cursorManager.getCachedBounds(columnElement);
        const { x, y } = mousePosition;
        
        return x >= columnBounds.left && x <= columnBounds.right &&
               y >= columnBounds.top && y <= columnBounds.bottom;
    }

    showMirrorCursor(mousePosition, sourceColumn, targetColumn, targetCursorId) {
        const { x, y } = mousePosition;
        const sourceBounds = this.cursorManager.getCachedBounds(sourceColumn);
        
        // Get the target overlay (not the target column)
        const targetOverlay = targetCursorId === this.leftCursorId ? this.leftOverlay : this.rightOverlay;
        const targetBounds = targetOverlay.getBoundingClientRect();

        // Calculate relative position in source column
        const relativeX = x - sourceBounds.left;
        const relativeY = y - sourceBounds.top;

        // Calculate percentage position
        const xPercent = relativeX / sourceBounds.width;
        const yPercent = relativeY / sourceBounds.height;

        // Calculate position within target overlay (positioned relative to overlay)
        const targetRelativeX = xPercent * targetBounds.width;
        const targetRelativeY = yPercent * targetBounds.height;

        // Show cursor at mirrored position (positioned relative to overlay)
        const cursor = this.cursorManager.cursors.get(targetCursorId);
        if (cursor) {
            cursor.style.left = targetRelativeX + 'px';
            cursor.style.top = targetRelativeY + 'px';
            cursor.style.opacity = '0.7';
            cursor.classList.add('visible');
        }
    }

    hideCursor(cursorId) {
        const cursor = this.cursorManager.cursors.get(cursorId);
        if (cursor) {
            cursor.style.opacity = '0';
            cursor.classList.remove('visible');
        }
    }

    // Public API methods
    enable() {
        this.options.enabled = true;
    }

    disable() {
        this.options.enabled = false;
        this.hideCursor(this.leftCursorId);
        this.hideCursor(this.rightCursorId);
    }

    setColumnSelector(selector) {
        this.options.columnSelector = selector;
        this.columnElements = document.querySelectorAll(selector);
        
        if (this.columnElements.length >= 2) {
            this.rightColumnElement = this.columnElements[0];
            this.leftColumnElement = this.columnElements[1];
            
            // Re-attach cursors to new column elements
            if (this.cursorManager.cursors.has(this.rightCursorId)) {
                const rightCursor = this.cursorManager.cursors.get(this.rightCursorId);
                this.rightColumnElement.appendChild(rightCursor);
            }
            if (this.cursorManager.cursors.has(this.leftCursorId)) {
                const leftCursor = this.cursorManager.cursors.get(this.leftCursorId);
                this.leftColumnElement.appendChild(leftCursor);
            }

            // Re-setup observers
            this.cursorManager.observeElement(this.leftColumnElement, this.leftCursorId);
            this.cursorManager.observeElement(this.rightColumnElement, this.rightCursorId);
        }
    }

    destroy() {
        this.cursorManager.removeCursor(this.leftCursorId);
        this.cursorManager.removeCursor(this.rightCursorId);
    }
}

// Export for use
window.TextColumnCursor = TextColumnCursor; 