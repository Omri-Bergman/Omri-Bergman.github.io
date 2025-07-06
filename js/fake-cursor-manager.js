/**
 * FakeCursorManager - Generic fake cursor system
 * Handles cursor creation, mouse tracking, positioning, and performance optimization
 */
class FakeCursorManager {
    constructor(options = {}) {
        this.cursors = new Map(); // Map of cursorId -> cursor element
        this.activeCursors = new Set();
        this.rafId = null;
        this.mousePosition = { x: 0, y: 0 };
        this.cachedBounds = new Map();
        
        // Configuration
        this.options = {
            cursorSize: options.cursorSize || { width: 26, height: 26 },
            throttleDelay: options.throttleDelay || 0,
            cacheTimeout: options.cacheTimeout || 100,
            intersectionThreshold: options.intersectionThreshold || 0.1,
            ...options
        };

        this.init();
    }

    init() {
        // Single document-level mouse tracking
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Cache invalidation on resize
        window.addEventListener('resize', this.invalidateCache.bind(this));
        
        // Setup intersection observer for performance
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const cursorId = entry.target.dataset.fakeCursorTarget;
                    if (cursorId) {
                        if (entry.isIntersecting) {
                            this.activeCursors.add(cursorId);
                        } else {
                            this.activeCursors.delete(cursorId);
                            this.hideCursor(cursorId);
                        }
                    }
                });
            }, { threshold: this.options.intersectionThreshold });
        }
    }

    /**
     * Create a fake cursor element
     * @param {string} cursorId - Unique identifier for this cursor
     * @param {Object} options - Cursor-specific options
     * @returns {HTMLElement} The cursor element
     */
    createCursor(cursorId, options = {}) {
        if (this.cursors.has(cursorId)) {
            return this.cursors.get(cursorId);
        }

        const cursor = document.createElement('div');
        cursor.className = 'fake-cursor';
        cursor.dataset.cursorId = cursorId;
        
        // Custom SVG or default
        const svgContent = options.svg || this.getDefaultCursorSVG();
        cursor.innerHTML = svgContent;
        
        // Initial styling
        cursor.style.cssText = `
            position: absolute;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.2s;
        `;

        // Size the SVG
        const svg = cursor.querySelector('svg');
        if (svg) {
            svg.style.width = (options.width || this.options.cursorSize.width) + 'px';
            svg.style.height = (options.height || this.options.cursorSize.height) + 'px';
        }

        this.cursors.set(cursorId, cursor);
        return cursor;
    }

    /**
     * Default cursor SVG
     */
    getDefaultCursorSVG() {
        return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="28" height="28" viewBox="0 0 100 100" xml:space="preserve">
            <g transform="scale(0.2)">
                <polygon points="70.9171753,245.8382263 13.7609253,301.528656 8.3693237,19.2884216 212.3517456,217.5081482 
            120.0197144,222.8763123 180.1222534,350.4964294 127.326355,366.8382263"/>
                <path style="fill:#FFFFFF;" d="M16.7397461,38.5769958l176.9996948,171.9996948l-85.9998779,5l61.2220459,129.9996948
            l-37.333252,11.555542L73.406311,232.2433167l-51.9998779,50.6665344L16.7397461,38.5769958 M0,0l0.7426147,38.8825378
            l4.666687,244.3328552l0.7054443,36.9332275l26.4575195-25.7790833l35.8562622-34.9368591L117.12677,363.8924561
            l5.8979492,12.6513977l13.3345947-4.1273804l37.333252-11.555542l17.5888672-5.4440918l-7.8446045-16.6573792
            L132.300354,230.1757202l62.3677979-3.6260376l36.2957764-2.1102295l-26.0740967-25.3373718L27.8901978,27.1023865L0,0L0,0z"/>
            </g>
        </svg>`;
    }

    /**
     * Register an element to be observed for intersection
     */
    observeElement(element, cursorId) {
        if (this.observer && element) {
            element.dataset.fakeCursorTarget = cursorId;
            this.observer.observe(element);
        }
    }

    /**
     * Optimized mouse handling with RAF
     */
    handleMouseMove(e) {
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;

        if (this.rafId) return; // Already scheduled

        this.rafId = requestAnimationFrame(() => {
            this.updateActiveCursors();
            this.rafId = null;
        });
    }

    /**
     * Update all active cursors - to be overridden by specific implementations
     */
    updateActiveCursors() {
        // This method should be overridden by child classes
        // or behavior-specific handlers should be registered
    }

    /**
     * Show cursor at specific coordinates
     * @param {string} cursorId - Cursor identifier
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {HTMLElement} container - Container element for relative positioning
     */
    showCursor(cursorId, x, y, container = null) {
        const cursor = this.cursors.get(cursorId);
        if (!cursor) return;

        if (container) {
            const containerBounds = this.getCachedBounds(container);
            cursor.style.left = (x - containerBounds.left) + 'px';
            cursor.style.top = (y - containerBounds.top) + 'px';
        } else {
            cursor.style.left = x + 'px';
            cursor.style.top = y + 'px';
        }

        cursor.style.opacity = '1';
        cursor.classList.add('visible');
    }

    /**
     * Hide cursor
     * @param {string} cursorId - Cursor identifier
     */
    hideCursor(cursorId) {
        const cursor = this.cursors.get(cursorId);
        if (cursor) {
            cursor.style.opacity = '0';
            cursor.classList.remove('visible');
        }
    }

    /**
     * Get mouse position as percentage within element
     * @param {HTMLElement} element - Target element
     * @returns {Object} {xPercent, yPercent}
     */
    getMousePositionPercentage(element) {
        const bounds = this.getCachedBounds(element);
        const { x, y } = this.mousePosition;
        
        const xPercent = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
        const yPercent = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
        
        return { xPercent, yPercent };
    }

    /**
     * Check if mouse is over element
     * @param {HTMLElement} element - Target element
     * @returns {boolean}
     */
    isMouseOverElement(element) {
        const bounds = this.getCachedBounds(element);
        const { x, y } = this.mousePosition;
        
        return x >= bounds.left && x <= bounds.right &&
               y >= bounds.top && y <= bounds.bottom;
    }

    /**
     * Optimized bounds caching
     */
    getCachedBounds(element) {
        if (this.cachedBounds.has(element)) {
            return this.cachedBounds.get(element);
        }

        const bounds = element.getBoundingClientRect();
        this.cachedBounds.set(element, bounds);

        // Auto-cleanup cache
        setTimeout(() => {
            this.cachedBounds.delete(element);
        }, this.options.cacheTimeout);

        return bounds;
    }

    /**
     * Invalidate bounds cache
     */
    invalidateCache() {
        this.cachedBounds.clear();
    }

    /**
     * Register cursor update handler
     * @param {Function} handler - Function to call on mouse move
     */
    onMouseMove(handler) {
        this.mouseMoveHandlers = this.mouseMoveHandlers || [];
        this.mouseMoveHandlers.push(handler);
    }

    /**
     * Update cursors method that calls registered handlers
     */
    updateActiveCursors() {
        if (this.mouseMoveHandlers) {
            this.mouseMoveHandlers.forEach(handler => {
                try {
                    handler(this.mousePosition, this.activeCursors);
                } catch (error) {
                    console.warn('FakeCursor handler error:', error);
                }
            });
        }
    }

    /**
     * Attach cursor to container
     * @param {string} cursorId - Cursor identifier
     * @param {HTMLElement} container - Container element
     */
    attachCursor(cursorId, container) {
        const cursor = this.cursors.get(cursorId);
        if (cursor && container) {
            container.appendChild(cursor);
        }
    }

    /**
     * Remove cursor
     * @param {string} cursorId - Cursor identifier
     */
    removeCursor(cursorId) {
        const cursor = this.cursors.get(cursorId);
        if (cursor) {
            cursor.remove();
            this.cursors.delete(cursorId);
            this.activeCursors.delete(cursorId);
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        // Remove all cursors
        this.cursors.forEach(cursor => cursor.remove());
        this.cursors.clear();
        this.activeCursors.clear();
        this.cachedBounds.clear();

        // Remove event listeners
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        window.removeEventListener('resize', this.invalidateCache.bind(this));
    }
}

// Export for use
window.FakeCursorManager = FakeCursorManager; 