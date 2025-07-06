/**
 * HeaderMirrorCursor - Mirrors cursor on X-axis in the header section
 * Uses the generic FakeCursorManager for the header area split in half
 */
class HeaderMirrorCursor {
    constructor(options = {}) {
        this.options = {
            headerSelector: options.headerSelector || '.article-header',
            enabled: true,
            ...options
        };

        console.log('HeaderMirrorCursor: Initializing with options:', this.options);

        // Initialize with generic cursor manager - using same settings as proportional text
        this.cursorManager = new FakeCursorManager({
            cursorSize: { width: 26, height: 26 }
        });

        console.log('HeaderMirrorCursor: FakeCursorManager created');

        // Create the header mirror cursor - using default SVG like proportional text
        this.headerCursorId = 'header-mirror-cursor';
        this.headerCursor = this.cursorManager.createCursor(this.headerCursorId);

        console.log('HeaderMirrorCursor: Cursor created:', this.headerCursor);

        // Get header element
        this.headerElement = document.querySelector(this.options.headerSelector);
        if (!this.headerElement) {
            console.warn('HeaderMirrorCursor: Header element not found:', this.options.headerSelector);
            return;
        }

        console.log('HeaderMirrorCursor: Header element found:', this.headerElement);

        // Attach cursor to header
        this.cursorManager.attachCursor(this.headerCursorId, this.headerElement);
        console.log('HeaderMirrorCursor: Cursor attached to header');

        // Register our cursor update handler
        this.cursorManager.onMouseMove(this.handleHeaderMirrorUpdate.bind(this));
        console.log('HeaderMirrorCursor: Mouse move handler registered');

        this.init();
    }

    init() {
        // Always consider this cursor active for the header area
        this.cursorManager.activeCursors.add(this.headerCursorId);
    }

    handleHeaderMirrorUpdate(mousePosition) {
        if (!this.options.enabled || !this.headerElement) {
            this.cursorManager.hideCursor(this.headerCursorId);
            return;
        }

        // Check if mouse is within the header area
        const inHeader = this.isMouseInHeader(mousePosition);
        
        if (inHeader) {
            const mirrorPos = this.calculateHeaderMirrorPosition(mousePosition);
            
            // Show cursor at mirrored position (relative to header container)
            // Convert relative coordinates to absolute for showCursor
            const headerBounds = this.cursorManager.getCachedBounds(this.headerElement);
            const absoluteX = headerBounds.left + mirrorPos.x;
            const absoluteY = headerBounds.top + mirrorPos.y;
            
            console.log('HeaderMirrorCursor: Mouse in header, showing cursor at:', {
                mouse: mousePosition,
                mirrorPos,
                headerBounds,
                absoluteX,
                absoluteY
            });
            
            this.cursorManager.showCursor(this.headerCursorId, absoluteX, absoluteY, this.headerElement);
        } else {
            // Hide cursor when not in header
            this.cursorManager.hideCursor(this.headerCursorId);
        }
    }

    isMouseInHeader(mousePosition) {
        const headerBounds = this.cursorManager.getCachedBounds(this.headerElement);
        const { x, y } = mousePosition;
        
        return x >= headerBounds.left && x <= headerBounds.right &&
               y >= headerBounds.top && y <= headerBounds.bottom;
    }

    calculateHeaderMirrorPosition(mousePosition) {
        const { x, y } = mousePosition;
        const headerBounds = this.cursorManager.getCachedBounds(this.headerElement);

        // Calculate position relative to header
        const relativeX = x - headerBounds.left;
        const relativeY = y - headerBounds.top;

        // Mirror X-axis: if cursor is at 25% from left, mirror should be at 75% from left
        const headerWidth = headerBounds.width;
        const mirrorRelativeX = headerWidth - relativeX;

        // Return relative coordinates since we're using container positioning
        return { 
            x: mirrorRelativeX, 
            y: relativeY 
        };
    }

    // Public API methods
    enable() {
        this.options.enabled = true;
    }

    disable() {
        this.options.enabled = false;
        this.cursorManager.hideCursor(this.headerCursorId);
    }

    setHeaderSelector(selector) {
        this.options.headerSelector = selector;
        this.headerElement = document.querySelector(selector);
        
        if (this.headerElement && this.cursorManager.cursors.has(this.headerCursorId)) {
            // Re-attach cursor to new header element
            const cursor = this.cursorManager.cursors.get(this.headerCursorId);
            this.headerElement.appendChild(cursor);
        }
    }

    destroy() {
        this.cursorManager.removeCursor(this.headerCursorId);
    }
}

// Export for use
window.HeaderMirrorCursor = HeaderMirrorCursor; 