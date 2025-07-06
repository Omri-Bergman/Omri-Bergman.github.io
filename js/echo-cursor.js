/**
 * EchoCursor - Creates trailing echo cursors that follow the real cursor
 * Uses the generic FakeCursorManager for cursor management
 */
class EchoCursor {
    constructor(options = {}) {
        this.options = {
            container: options.container || null, // CSS selector for container (null = global)
            echoCount: options.echoCount || 5, // Number of echo cursors
            delay: options.delay || 100, // Delay between echoes in ms
            fadeRate: options.fadeRate || 0.8, // How much each echo fades (0.8 = 80% of previous)
            scaleRate: options.scaleRate || 0.9, // How much each echo scales down
            enabled: true,
            ...options
        };

        // Initialize with generic cursor manager
        this.cursorManager = new FakeCursorManager({
            cursorSize: { width: 26, height: 26 }
        });

        // Track mouse position history
        this.mouseHistory = [];
        this.maxHistoryLength = this.options.echoCount * 2; // Store more than needed

        // Storage for echo cursors
        this.echoCursors = [];

        // Container element (if specified)
        this.containerElement = null;

        // Update intervals
        this.updateInterval = null;

        this.init();
    }

    init() {
        // Find container element if specified
        if (this.options.container) {
            this.containerElement = document.querySelector(this.options.container);
            if (!this.containerElement) {
                console.warn('EchoCursor: Container element not found:', this.options.container);
                return;
            }
        }

        // Create echo cursors
        this.createEchoCursors();

        // Attach cursors to container or body
        const attachTarget = this.containerElement || document.body;
        this.echoCursors.forEach(cursorInfo => {
            this.cursorManager.attachCursor(cursorInfo.id, attachTarget);
        });

        // Start tracking mouse movement
        this.startTracking();
    }

    createEchoCursors() {
        for (let i = 0; i < this.options.echoCount; i++) {
            const cursorId = `echo-cursor-${i}`;
            
            // Calculate opacity and scale for this echo
            const opacity = Math.pow(this.options.fadeRate, i + 1);
            const scale = Math.pow(this.options.scaleRate, i + 1);
            
            // Create cursor with custom styling
            const cursor = this.cursorManager.createCursor(cursorId);
            
            // Apply echo-specific styling
            const svg = cursor.querySelector('svg');
            if (svg) {
                const size = Math.floor(26 * scale);
                svg.style.width = size + 'px';
                svg.style.height = size + 'px';
                svg.style.opacity = opacity;
                
                // Add some color variation for visual interest
                const hue = (i * 30) % 360; // Different hue for each echo
                svg.style.filter = `hue-rotate(${hue}deg) saturate(0.7)`;
            }

            this.echoCursors.push({
                id: cursorId,
                element: cursor,
                opacity: opacity,
                scale: scale,
                delay: (i + 1) * this.options.delay
            });
        }
    }

    startTracking() {
        // Track mouse movement
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Update echo positions periodically
        this.updateInterval = setInterval(() => {
            this.updateEchoPositions();
        }, 16); // ~60fps
    }

    handleMouseMove(e) {
        // If container is specified, only track mouse when inside it
        if (this.containerElement) {
            const rect = this.containerElement.getBoundingClientRect();
            const isInside = e.clientX >= rect.left && e.clientX <= rect.right &&
                           e.clientY >= rect.top && e.clientY <= rect.bottom;
            
            if (!isInside) {
                // Mouse is outside container, hide all cursors
                this.hideAllEchoCursors();
                return;
            }
            
            // Store position relative to container
            this.mouseHistory.unshift({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                timestamp: Date.now()
            });
        } else {
            // Global tracking - store screen coordinates
            this.mouseHistory.unshift({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now()
            });
        }

        // Trim history to prevent memory growth
        if (this.mouseHistory.length > this.maxHistoryLength) {
            this.mouseHistory = this.mouseHistory.slice(0, this.maxHistoryLength);
        }
    }

    updateEchoPositions() {
        if (!this.options.enabled || this.mouseHistory.length === 0) {
            this.hideAllEchoCursors();
            return;
        }

        const currentTime = Date.now();

        this.echoCursors.forEach((cursorInfo, index) => {
            // Find the mouse position from the appropriate time in the past
            const targetTime = currentTime - cursorInfo.delay;
            const historicalPosition = this.findHistoricalPosition(targetTime);

            if (historicalPosition) {
                // Show cursor at the historical position
                if (this.containerElement) {
                    // Position relative to container
                    this.cursorManager.showCursor(cursorInfo.id, historicalPosition.x, historicalPosition.y);
                } else {
                    // Position on screen
                    this.cursorManager.showCursor(cursorInfo.id, historicalPosition.x, historicalPosition.y);
                }
            } else {
                // Hide cursor if no historical position available
                this.cursorManager.hideCursor(cursorInfo.id);
            }
        });
    }

    findHistoricalPosition(targetTime) {
        // Find the closest historical position to the target time
        let closest = null;
        let closestDiff = Infinity;

        for (const position of this.mouseHistory) {
            const diff = Math.abs(position.timestamp - targetTime);
            if (diff < closestDiff) {
                closestDiff = diff;
                closest = position;
            }
        }

        // Only return position if it's reasonably close to target time
        return closestDiff < this.options.delay * 2 ? closest : null;
    }

    hideAllEchoCursors() {
        this.echoCursors.forEach(cursorInfo => {
            this.cursorManager.hideCursor(cursorInfo.id);
        });
    }

    // Public API methods
    enable() {
        this.options.enabled = true;
    }

    disable() {
        this.options.enabled = false;
        this.hideAllEchoCursors();
    }

    setEchoCount(count) {
        this.options.echoCount = count;
        // Recreate cursors with new count
        this.destroy();
        this.init();
    }

    setDelay(delay) {
        this.options.delay = delay;
        // Update delays for existing cursors
        this.echoCursors.forEach((cursorInfo, index) => {
            cursorInfo.delay = (index + 1) * delay;
        });
    }

    setFadeRate(rate) {
        this.options.fadeRate = rate;
        // Update opacity for existing cursors
        this.echoCursors.forEach((cursorInfo, index) => {
            const opacity = Math.pow(rate, index + 1);
            cursorInfo.opacity = opacity;
            const svg = cursorInfo.element.querySelector('svg');
            if (svg) {
                svg.style.opacity = opacity;
            }
        });
    }

    destroy() {
        // Stop tracking
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        // Remove event listener
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));

        // Remove all echo cursors
        this.echoCursors.forEach(cursorInfo => {
            this.cursorManager.removeCursor(cursorInfo.id);
        });

        // Clean up
        this.echoCursors = [];
        this.mouseHistory = [];
    }
}

// Export for use
window.EchoCursor = EchoCursor; 