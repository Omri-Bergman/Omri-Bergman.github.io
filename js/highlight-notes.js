function createHighlighter(containerSelector, delay = 1000) {
    const container = document.querySelector(containerSelector);

    if (!container) {
        console.warn(`Container "${containerSelector}" not found`);
        return;
    }

    const highlightElements = container.querySelectorAll('[data-highlight]');

    if (highlightElements.length === 0) {
        console.warn(`No highlight elements found in "${containerSelector}"`);
        return;
    }

    let currentHighlights = [];

    function highlightRandomText() {
        // Remove previous highlights
        currentHighlights.forEach(highlight => {
            highlight.classList.remove('highlight', 'active');
        });
        currentHighlights = [];

        // Find the highlight="0" element
        const highlightZero = Array.from(highlightElements).find(element =>
            element.getAttribute('data-highlight') === '0'
        );

        // Get all other elements (excluding highlight="0")
        const otherElements = Array.from(highlightElements).filter(element =>
            element.getAttribute('data-highlight') !== '0'
        );

        if (otherElements.length === 0) return;

        // Select a random element from others
        const randomIndex = Math.floor(Math.random() * otherElements.length);
        const randomElement = otherElements[randomIndex];

        // Add both elements to current highlights
        if (highlightZero) currentHighlights.push(highlightZero);
        if (randomElement) currentHighlights.push(randomElement);

        // Apply highlight animation to both elements
        currentHighlights.forEach(element => {
            element.classList.add('highlight');

            setTimeout(() => {
                if (element) {
                    element.classList.add('active');
                }
            }, 200);

            setTimeout(() => {
                if (element) {
                    element.classList.remove('highlight', 'active');
                }
            }, 2000);
        });
    }

    function startRandomHighlighting() {
        highlightRandomText();
        const nextDelay = Math.random() * 3000 + 1500;
        setTimeout(startRandomHighlighting, nextDelay);
    }

    // Start the highlighting
    setTimeout(startRandomHighlighting, delay);

    // Return control object (optional - for stopping/starting)
    return {
        start: startRandomHighlighting,
        stop: () => clearTimeout(startRandomHighlighting)
    };
}

// Initialize multiple highlighters
// createHighlighter('.article-content-second-section-text-01:nth-child(1)', 1000);
createHighlighter('.article-content-second-section-text-01:nth-child(2)', 1500);
createHighlighter('.article-content-fifth-section-text', 1000);
createHighlighter('.article-content-sixth-section-text-01:nth-child(1)', 1400);
createHighlighter('.article-content-sixth-section-text-01:nth-child(3)', 1000);
createHighlighter('.article-content-seventh-section-text-01', 1000);

// Add more as needed