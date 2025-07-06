let isAnimating = false;

        function animateSelection() {
            if (isAnimating) return;

            const fakeCursor = document.getElementById('fakeCursor');
            const element = document.querySelector('h1');
            const wordRect = element.getBoundingClientRect();
            const text = element.textContent;

            isAnimating = true;

            // Clear any existing selection
            window.getSelection().removeAllRanges();

            // Position cursor at right edge of screen, aligned with word
            const startX = window.innerWidth + 20;
            const cursorY = wordRect.top + wordRect.height / 10;

            fakeCursor.style.left = startX + 'px';
            fakeCursor.style.top = cursorY + 'px';
            fakeCursor.classList.add('active');

            // Calculate positions for each character
            const characterPositions = [];
            for (let i = 0; i <= text.length; i++) {
                const range = document.createRange();
                range.setStart(element.firstChild, i);
                range.setEnd(element.firstChild, i);
                const rect = range.getBoundingClientRect();
                characterPositions.push({
                    x: rect.left,
                    charIndex: i
                });
            }

            // Sort by x position (right to left for Hebrew)
            characterPositions.sort((a, b) => b.x - a.x);

            const wordStartX = wordRect.right;
            const wordEndX = wordRect.left;
            const exitX = -50;

            let currentX = startX;
            let currentSelectionLength = 0;

            const animationSpeed = 2;
            const animateFrame = () => {
                currentX -= animationSpeed;
                fakeCursor.style.left = currentX + 'px';

                if (currentX <= wordStartX && currentX >= wordEndX) {
                    let newSelectionLength = 0;

                    for (let i = 0; i < characterPositions.length; i++) {
                        if (currentX <= characterPositions[i].x) {
                            newSelectionLength = characterPositions[i].charIndex;
                        }
                    }

                    if (newSelectionLength !== currentSelectionLength) {
                        currentSelectionLength = newSelectionLength;
                        updateSelection(currentSelectionLength);
                    }
                }

                if (currentX < wordEndX - 20) {
                    if (currentSelectionLength > 0) {
                        window.getSelection().removeAllRanges();
                        currentSelectionLength = 0;
                    }
                }

                if (currentX > exitX) {
                    requestAnimationFrame(animateFrame);
                } else {

                    fakeCursor.classList.remove('active');
                    isAnimating = false;
                    setTimeout(animateSelection, 1000); // Restart after 2 seconds
                }
            };

            requestAnimationFrame(animateFrame);
        }

        function updateSelection(length) {
            const element = document.querySelector('h1');
            const text = element.textContent;

            if (length === 0) {
                window.getSelection().removeAllRanges();
                return;
            }

            const range = document.createRange();
            range.setStart(element.firstChild, 0);
            range.setEnd(element.firstChild, Math.min(length, text.length));

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Start animation when page loads
        window.addEventListener('load', () => {
            setTimeout(animateSelection, 1000); // Start after 1 second
        });