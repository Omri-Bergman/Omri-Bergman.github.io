/**
 * ProportionalTextManager - Optimized library for multiple text selection instances
 * Now uses the generic FakeCursorManager for cursor functionality
 */
class ProportionalTextManager {
    constructor() {
        this.instances = new Map();
        this.activeGroups = new Set();
        this.selectionUpdateThrottle = null;

        // Initialize with generic cursor manager
        this.cursorManager = new FakeCursorManager({
            cursorSize: { width: 26, height: 26 }
        });

        // Register our cursor update handler
        this.cursorManager.onMouseMove(this.handleCursorUpdate.bind(this));

        this.init();
    }

    init() {
        // Selection handling
        document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
        document.addEventListener('click', this.handleClick.bind(this));
    }

    // Register a text pair for proportional selection
    registerGroup(groupId) {
        if (this.instances.has(groupId)) return;

        const elements = document.querySelectorAll(`[data-proportional-group="${groupId}"]`);
        if (elements.length !== 2) {
            console.warn(`ProportionalText: Group "${groupId}" must have exactly 2 elements`);
            return;
        }

        const primary = Array.from(elements).find(el => el.dataset.proportionalRole === 'primary');
        const secondary = Array.from(elements).find(el => el.dataset.proportionalRole === 'secondary');

        if (!primary || !secondary) {
            console.warn(`ProportionalText: Group "${groupId}" must have primary and secondary roles`);
            return;
        }

        const primaryContent = primary.querySelector('.proportional-text-content');
        const secondaryContent = secondary.querySelector('.proportional-text-content');

        if (!primaryContent || !secondaryContent) {
            console.warn(`ProportionalText: Group "${groupId}" elements must contain .proportional-text-content`);
            return;
        }

        // Create cursors using the generic manager
        const primaryCursorId = `${groupId}-primary`;
        const secondaryCursorId = `${groupId}-secondary`;
        
        const primaryCursor = this.cursorManager.createCursor(primaryCursorId);
        const secondaryCursor = this.cursorManager.createCursor(secondaryCursorId);
        
        // Attach cursors to containers
        this.cursorManager.attachCursor(primaryCursorId, primary);
        this.cursorManager.attachCursor(secondaryCursorId, secondary);

        // Observe elements for intersection
        this.cursorManager.observeElement(primary, primaryCursorId);
        this.cursorManager.observeElement(secondary, secondaryCursorId);

        const instance = {
            groupId,
            primary: { 
                container: primary, 
                content: primaryContent, 
                cursorId: primaryCursorId 
            },
            secondary: { 
                container: secondary, 
                content: secondaryContent, 
                cursorId: secondaryCursorId 
            },
            originalTexts: {
                primary: primaryContent.textContent,
                secondary: secondaryContent.textContent
            }
        };

        this.instances.set(groupId, instance);
        this.activeGroups.add(groupId);
    }

    // Handle cursor updates using the generic cursor manager
    handleCursorUpdate(mousePosition, activeCursors) {
        for (const [groupId, instance] of this.instances) {
            if (!this.activeGroups.has(groupId)) continue;

            // When hovering primary -> show cursor on secondary
            this.updateCursorForElement(instance, 'primary', 'secondary');

            // When hovering secondary -> show cursor on primary
            this.updateCursorForElement(instance, 'secondary', 'primary');
        }
    }

    updateCursorForElement(instance, sourceRole, targetRole) {
        const sourceElement = instance[sourceRole].content;
        const targetElement = instance[targetRole].content;
        const targetCursorId = instance[targetRole].cursorId;

        // Check if mouse is over source element
        if (this.cursorManager.isMouseOverElement(sourceElement)) {
            const mousePos = this.cursorManager.getMousePositionPercentage(sourceElement);
            this.showProportionalCursor(instance, sourceRole, targetRole, mousePos.xPercent, mousePos.yPercent);
        } else {
            this.cursorManager.hideCursor(targetCursorId);
        }
    }

    showProportionalCursor(instance, sourceRole, targetRole, xPercent, yPercent) {
        const sourceElement = instance[sourceRole].content;
        const targetElement = instance[targetRole].content;
        const targetCursorId = instance[targetRole].cursorId;

        const coords = this.getProportionalCoordinates(instance, sourceElement, targetElement, xPercent, yPercent);
        if (coords) {
            const targetContainer = instance[targetRole].container;
            this.cursorManager.showCursor(targetCursorId, coords.x, coords.y, targetContainer);
        }
    }

    getProportionalCoordinates(instance, sourceElement, targetElement, xPercent, yPercent) {
        const targetContentBounds = this.cursorManager.getCachedBounds(targetElement);

        let targetScreenX = targetContentBounds.left + (xPercent * targetContentBounds.width);
        const targetScreenY = targetContentBounds.top + (yPercent * targetContentBounds.height);

        // Adjust X position for primary elements (your original logic)
        if (targetElement === instance.primary.content) {
            targetScreenX = targetContentBounds.left + (xPercent * targetContentBounds.width) - targetContentBounds.width / 4;
        }

        return { x: targetScreenX, y: targetScreenY };
    }

    // Throttled selection handling
    handleSelectionChange() {
        if (this.selectionUpdateThrottle) return;

        this.selectionUpdateThrottle = setTimeout(() => {
            this.updateSelections();
            this.selectionUpdateThrottle = null;
        }, 10);
    }

    updateSelections() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            this.clearAllSelections();
            return;
        }

        // Find which instance contains the selection
        for (const [groupId, instance] of this.instances) {
            const primarySelection = this.getSelectionInfo(instance.primary.content, instance.originalTexts.primary);
            const secondarySelection = this.getSelectionInfo(instance.secondary.content, instance.originalTexts.secondary);

            if (primarySelection) {
                this.applyProportionalSelection(instance, 'primary', primarySelection);
                return;
            }

            if (secondarySelection) {
                this.applyProportionalSelection(instance, 'secondary', secondarySelection);
                return;
            }

            // Clear this instance if no selection
            this.clearInstanceSelections(instance);
        }
    }

    getSelectionInfo(element, originalText) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);

        if (!element.contains(range.commonAncestorContainer) &&
            range.commonAncestorContainer !== element) {
            return null;
        }

        const selectedText = selection.toString();
        if (selectedText.length === 0) return null;

        const elementText = element.textContent || element.innerText || '';
        const trimmedElementText = elementText.trim();
        const trimmedSelectedText = selectedText.trim();

        const isFullSelection = trimmedSelectedText === trimmedElementText;

        let startPos, endPos;

        if (isFullSelection) {
            startPos = 0;
            endPos = originalText.length;
        } else {
            const trimmedStart = trimmedElementText.indexOf(trimmedSelectedText);
            if (trimmedStart !== -1) {
                const startPercent = trimmedStart / trimmedElementText.length;
                const endPercent = (trimmedStart + trimmedSelectedText.length) / trimmedElementText.length;

                startPos = Math.floor(startPercent * originalText.length);
                endPos = Math.ceil(endPercent * originalText.length);
            } else {
                startPos = 0;
                endPos = originalText.length;
            }
        }

        startPos = Math.max(0, Math.min(startPos, originalText.length));
        endPos = Math.max(startPos, Math.min(endPos, originalText.length));

        return {
            text: selectedText,
            start: startPos,
            end: endPos,
            length: selectedText.length,
            totalLength: originalText.length
        };
    }

    applyProportionalSelection(instance, sourceRole, selectionInfo) {
        const targetRole = sourceRole === 'primary' ? 'secondary' : 'primary';
        const targetElement = instance[targetRole].content;
        const targetText = instance.originalTexts[targetRole];

        const startPercent = selectionInfo.start / selectionInfo.totalLength;
        const endPercent = selectionInfo.end / selectionInfo.totalLength;

        const targetStart = Math.floor(startPercent * targetText.length);
        const targetEnd = Math.ceil(endPercent * targetText.length);

        const finalStart = Math.max(0, Math.min(targetStart, targetText.length));
        const finalEnd = Math.max(finalStart, Math.min(targetEnd, targetText.length));

        this.applyFakeSelection(targetElement, targetText, finalStart, finalEnd);
    }

    applyFakeSelection(element, originalText, start, end) {
        element.textContent = originalText;

        if (start >= end || start < 0 || end > originalText.length) {
            return;
        }

        const beforeText = originalText.substring(0, start);
        const selectedText = originalText.substring(start, end);
        const afterText = originalText.substring(end);

        element.innerHTML = '';

        if (beforeText) {
            element.appendChild(document.createTextNode(beforeText));
        }

        if (selectedText) {
            const span = document.createElement('span');
            span.className = 'proportional-fake-selected';
            span.textContent = selectedText;
            element.appendChild(span);
        }

        if (afterText) {
            element.appendChild(document.createTextNode(afterText));
        }
    }

    clearFakeSelection(element) {
        const instance = this.findInstanceByElement(element);
        if (instance) {
            const role = element === instance.primary.content ? 'primary' : 'secondary';
            element.textContent = instance.originalTexts[role];
        } else {
            const spans = element.querySelectorAll('.proportional-fake-selected');
            spans.forEach(span => {
                span.parentNode.replaceChild(document.createTextNode(span.textContent), span);
            });
            element.normalize();
        }
    }

    findInstanceByElement(element) {
        for (const instance of this.instances.values()) {
            if (instance.primary.content === element || instance.secondary.content === element) {
                return instance;
            }
        }
        return null;
    }

    clearInstanceSelections(instance) {
        this.clearFakeSelection(instance.primary.content);
        this.clearFakeSelection(instance.secondary.content);
        instance.primary.content.textContent = instance.originalTexts.primary;
        instance.secondary.content.textContent = instance.originalTexts.secondary;
    }

    clearAllSelections() {
        for (const instance of this.instances.values()) {
            this.clearInstanceSelections(instance);
        }
    }

    handleClick(e) {
        const isInsideProportionalText = e.target.closest('[data-proportional-group]');
        if (!isInsideProportionalText) {
            setTimeout(() => {
                if (window.getSelection().toString() === '') {
                    this.clearAllSelections();
                }
            }, 10);
        }
    }

    // Public API methods
    destroy() {
        if (this.selectionUpdateThrottle) {
            clearTimeout(this.selectionUpdateThrottle);
        }

        // Destroy the cursor manager
        this.cursorManager.destroy();

        this.instances.clear();
        this.activeGroups.clear();
    }
}

// Auto-initialize the library
const proportionalTextManager = new ProportionalTextManager();

// Auto-discover and register groups when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const groups = new Set();
    document.querySelectorAll('[data-proportional-group]').forEach(el => {
        groups.add(el.dataset.proportionalGroup);
    });

    groups.forEach(groupId => {
        proportionalTextManager.registerGroup(groupId);
    });
});

// If DOM is already loaded
if (document.readyState === 'loading') {
    // Wait for DOMContentLoaded
} else {
    // DOM is already loaded
    const groups = new Set();
    document.querySelectorAll('[data-proportional-group]').forEach(el => {
        groups.add(el.dataset.proportionalGroup);
    });

    groups.forEach(groupId => {
        proportionalTextManager.registerGroup(groupId);
    });
}

// Export for manual control if needed
window.ProportionalTextManager = ProportionalTextManager;
window.proportionalTextManager = proportionalTextManager;