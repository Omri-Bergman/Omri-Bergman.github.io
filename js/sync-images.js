/**
 * SynchronizedImages - A class to create synchronized images with mouse tracking, zoom, and pan features
 * Version 1.3 - Fixed dimensions and custom cursor
 */

class SynchronizedImages {
    /**
     * Create a synchronized images component
     * @param {string|HTMLElement} container - The ID of the container element or the element itself
     * @param {string[]} imageUrls - Array of image URLs to display
     * @param {Object} options - Optional configuration
     * @param {string} options.layout - Layout type: 'two', 'four', or 'eight' (default: auto-detect based on image count)
     * @param {boolean} options.showResetButton - Whether to show the reset button (default: true)
     * @param {number} options.maxZoom - Maximum zoom level (default: 2)
     * @param {string} options.height - Fixed height for image containers (e.g., '300px')
     * @param {string} options.width - Fixed width for the grid (e.g., '800px')
     * @param {string} options.aspectRatio - Aspect ratio for image containers (e.g., '4/3')
     * @param {string} options.customCursorSvg - Custom cursor SVG content
     */
    constructor(container, imageUrls, options = {}) {
      // Container and images
      if (typeof container === 'string') {
        this.container = document.getElementById(container);
      } else if (container instanceof HTMLElement) {
        this.container = container;
      } else {
        throw new Error('Container must be an ID string or HTMLElement');
      }
      
      // Read rows and cols from data attributes or options
      const rows = parseInt(this.container.dataset.rows || options.rows || 0);
      const cols = parseInt(this.container.dataset.cols || options.cols || 0);
      let totalCells = (rows > 0 && cols > 0) ? rows * cols : null;
      
      // Check for responsive breakpoints and calculate maximum containers needed
      const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'];
      let maxResponsiveCells = 0;
      
      breakpoints.forEach(breakpoint => {
        const breakpointRows = parseInt(this.container.dataset[`${breakpoint}Rows`] || 0);
        const breakpointCols = parseInt(this.container.dataset[`${breakpoint}Cols`] || 0);
        if (breakpointRows > 0 && breakpointCols > 0) {
          const responsiveCells = breakpointRows * breakpointCols;
          maxResponsiveCells = Math.max(maxResponsiveCells, responsiveCells);
        }
      });
      
      // Use the maximum of original layout and responsive layouts
      if (maxResponsiveCells > 0) {
        totalCells = Math.max(totalCells || 0, maxResponsiveCells);
        console.log(`Creating ${totalCells} containers (max of original: ${rows * cols}, responsive: ${maxResponsiveCells})`);
      }
      
      // If rows and cols are specified, duplicate images as needed
      if (totalCells) {
        if (imageUrls.length === 1) {
          this.imageUrls = Array(totalCells).fill(imageUrls[0]);
        } else if (imageUrls.length < totalCells) {
          // Repeat images in order to fill the grid
          this.imageUrls = [];
          for (let i = 0; i < totalCells; i++) {
            this.imageUrls.push(imageUrls[i % imageUrls.length]);
          }
        } else {
          this.imageUrls = imageUrls.slice(0, totalCells);
        }
      } else {
        // Fallback to old layout logic
        if (options.layout === 'eight' && imageUrls.length === 1) {
          this.imageUrls = Array(8).fill(imageUrls[0]);
        } else if (options.layout === 'nine' && imageUrls.length === 1) {
          this.imageUrls = Array(9).fill(imageUrls[0]);
        } else if (options.layout === 'fifteen' && imageUrls.length === 1) {
          this.imageUrls = Array(15).fill(imageUrls[0]);
        } else if (options.layout === 'eighteen' && imageUrls.length === 1) {
          this.imageUrls = Array(18).fill(imageUrls[0]);
        } else {
          this.imageUrls = imageUrls;
        }
      }
      
      // Options with defaults
      this.options = {
        rows: rows > 0 ? rows : undefined,
        cols: cols > 0 ? cols : undefined,
        layout: options.layout || (imageUrls.length <= 2 ? 'two' : imageUrls.length <= 4 ? 'four' : imageUrls.length === 9 ? 'nine' : imageUrls.length === 15 ? 'fifteen' : imageUrls.length === 18 ? 'eighteen' : 'eight'),
        showResetButton: options.showResetButton !== undefined ? options.showResetButton : true,
        maxZoom: options.maxZoom || 2,
        height: options.height || null,
        width: options.width || null,
        gap: options.gap || null,
        maxWidth: options.maxWidth || null,
        aspectRatio: options.aspectRatio || null,
        cursorSize: options.cursorSize || { width: 28, height: 28 },
        fixedSize: options.fixedSize !== undefined ? options.fixedSize : true,
        customCursorSvg: options.customCursorSvg || null
      };
      
      // State variables
      this.mousePosition = { x: 0, y: 0 };
      this.isHovering = false;
      this.zoomLevel = 1;
      this.zoomOrigin = { x: 50, y: 50 };
      this.isPanning = false;
      this.panOffset = { x: 0, y: 0 };
      this.startPanPosition = { x: 0, y: 0 };
      this.activeImageIndex = null;
      
      // Initialize the component
      this.init();
      
      // Return this for chaining
      return this;
    }
    
    /**
     * Initialize the component
     * @private
     */
    init() {
      // Check if container exists
      if (!this.container) {
        console.error('SynchronizedImages: Container not found');
        return;
      }
      
      // Create grid container
      this.gridContainer = document.createElement('div');
      this.gridContainer.className = `sync-images-grid ${this.options.layout === 'two' ? 'two-images' : this.options.layout === 'four' ? 'four-images' : 'eight-images'}`;
      this.container.appendChild(this.gridContainer);
      
      // Apply grid gap if specified
      if (this.options.gap) {
        this.gridContainer.style.gap = this.options.gap;
      }
      
      // Apply container max width if specified
      if (this.options.maxWidth) {
        this.container.style.maxWidth = this.options.maxWidth;
      }
      
      // Create image containers
      this.imageContainers = [];
      this.images = [];
      this.cursors = [];
      
      this.imageUrls.forEach((url, index) => {
        // Create container
        const container = document.createElement('div');
        container.className = 'sync-image-container';
        
        this.gridContainer.appendChild(container);
        this.imageContainers.push(container);
        
        // Create image
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Synchronized Image ${index + 1}`;
        img.className = 'sync-image';
        img.draggable = false; // Critical to prevent default dragging
        container.appendChild(img);
        this.images.push(img);
        
        // Create custom cursor that matches your cursor
        const cursor = document.createElement('div');
        cursor.className = 'sync-cursor';
        cursor.innerHTML = this.options.customCursorSvg || `
          <svg width="${this.options.cursorSize.width}" height="${this.options.cursorSize.height}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="shadow-${index}" x="-2" y="-2" width="32" height="32" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="2"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
            </filter>
            <g filter="url(#shadow-${index})">
              <path d="M10 25L6 4L22 20L13 20L10 25Z" fill="black"/>
              <path d="M10 25L6 4L22 20L13 20L10 25Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
            </g>
          </svg>
        `;
        cursor.style.display = 'none';
        container.appendChild(cursor);
        this.cursors.push(cursor);
        
        // Add event listeners
        container.addEventListener('mousemove', (e) => this.handleMouseMove(e, index));
        container.addEventListener('mouseleave', () => this.handleMouseLeave());
        container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        container.addEventListener('mouseup', () => this.handleMouseUp());
        
        // Use mouseout as a backup for mouseleave
        container.addEventListener('mouseout', () => this.handleMouseLeave());
        
        // Double click handler
        container.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        
        // Prevent default behaviors that might interfere with dragging
        container.addEventListener('dragstart', (e) => e.preventDefault());
        img.addEventListener('dragstart', (e) => e.preventDefault());
      });
      
      // Apply fixed dimensions to maintain size when window resizes
      this.applyFixedDimensions();
      
      // Add reset button if enabled
      if (this.options.showResetButton) {
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Zoom & Pan';
        resetButton.className = 'sync-reset-button';
        resetButton.addEventListener('click', () => {
          this.zoomLevel = 1;
          this.panOffset = { x: 0, y: 0 };
          this.updateAllImages();
        });
        
        this.container.appendChild(resetButton);
      }
      
      // Add global event listeners
      document.addEventListener('mouseup', () => {
        if (this.isPanning) {
          this.isPanning = false;
          this.updateAllImages();
        }
      });
      
      // Handle mouse leaving the window entirely
      document.addEventListener('mouseleave', () => {
        this.isPanning = false;
        this.isHovering = false;
        this.updateAllImages();
      });
      
      // Handle window resize - reapply dimensions to maintain consistency
      if (this.options.fixedSize) {
        window.addEventListener('resize', () => {
          this.applyFixedDimensions();
        });
      }
    }
    
    /**
     * Apply fixed dimensions to the image containers
     * @private
     */
    applyFixedDimensions() {
      if (!this.container || !this.gridContainer) return;
      
      // Set a fixed width for the grid if specified
      if (this.options.width) {
        this.gridContainer.style.width = this.options.width;
      }
      
      // Apply height and aspect ratio to all image containers
      this.imageContainers.forEach(container => {
        // If both height and aspect ratio are specified, do not set width, only set height and aspect ratio
        if (this.options.height) {
          container.style.setProperty('--custom-height', this.options.height);
          container.style.height = this.options.height;
        }
        if (this.options.aspectRatio) {
          container.style.aspectRatio = this.options.aspectRatio;
        }
      });
      
      // Generic grid logic
      if (this.options.rows && this.options.cols) {
        this.gridContainer.style.gridTemplateColumns = `repeat(${this.options.cols}, 1fr)`;
        this.gridContainer.style.gridTemplateRows = `repeat(${this.options.rows}, auto)`;
        return;
      }
      
      // Fallback to old layout logic
      switch (this.options.layout) {
        case 'two':
          this.gridContainer.style.gridTemplateColumns = "1fr 1fr";
          break;
        case 'four':
          this.gridContainer.style.gridTemplateColumns = "1fr 1fr";
          this.gridContainer.style.gridTemplateRows = "auto auto";
          break;
        case 'eight':
          this.gridContainer.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
          this.gridContainer.style.gridTemplateRows = "auto auto";
          break;
        case 'nine':
          this.gridContainer.style.gridTemplateColumns = "1fr 1fr 1fr";
          this.gridContainer.style.gridTemplateRows = "auto auto auto";
          break;
        case 'fifteen':
          this.gridContainer.style.gridTemplateColumns = "1fr 1fr 1fr";
          this.gridContainer.style.gridTemplateRows = "auto auto auto auto auto";
          break;
        case 'eighteen':
          this.gridContainer.style.gridTemplateColumns = "1fr 1fr 1fr";
          this.gridContainer.style.gridTemplateRows = "auto auto auto auto auto auto";
          break;
      }
    }
    
    /**
     * Handle mouse movement over an image
     * @param {MouseEvent} e - Mouse event
     * @param {number} index - Index of the image
     * @private
     */
    handleMouseMove(e, index) {
      // Get the image container
      const container = this.imageContainers[index];
      const rect = container.getBoundingClientRect();
      
      // Set active image
      this.activeImageIndex = index;
      
      // Calculate relative position
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      this.mousePosition = { x, y };
      this.isHovering = true;
      
      // Handle panning when zoomed in
      if (this.isPanning && this.zoomLevel > 1) {
        // Calculate pixel movement since last position
        const pixelDeltaX = e.clientX - this.startPanPosition.x;
        const pixelDeltaY = e.clientY - this.startPanPosition.y;
        
        // Convert to percentage of container width/height
        const percentDeltaX = (pixelDeltaX / rect.width) * 100;
        const percentDeltaY = (pixelDeltaY / rect.height) * 100;
        
        // Update pan offset directly
        this.panOffset.x += percentDeltaX;
        this.panOffset.y += percentDeltaY;
        
        // Limit panning to prevent image from moving too far out of view
        const maxPanX = (this.zoomLevel - 1) / this.zoomLevel * 100 * 1.5;
        const maxPanY = (this.zoomLevel - 1) / this.zoomLevel * 100 * 1.5;
        
        this.panOffset.x = Math.max(-maxPanX, Math.min(maxPanX, this.panOffset.x));
        this.panOffset.y = Math.max(-maxPanY, Math.min(maxPanY, this.panOffset.y));
        
        // Update reference position for next move
        this.startPanPosition = { x: e.clientX, y: e.clientY };
      }
      
      this.updateAllImages();
    }
    
    /**
     * Handle mouse down event
     * @param {MouseEvent} e - Mouse event
     * @private
     */
    handleMouseDown(e) {
      if (this.zoomLevel > 1) {
        this.isPanning = true;
        this.startPanPosition = { x: e.clientX, y: e.clientY };
        
        // Prevent default behaviors (text selection, image dragging)
        e.preventDefault();
        
        // Don't change cursor - keep original cursor
      }
    }
    
    /**
     * Handle mouse up event
     * @private
     */
    handleMouseUp() {
      this.isPanning = false;
      
      // Don't change cursor - keep original cursor
    }
    
    /**
     * Handle mouse leave event
     * @private
     */
    handleMouseLeave() {
      this.isHovering = false;
      this.activeImageIndex = null;
      this.updateAllImages();
    }
    
    /**
     * Handle double click event for zooming
     * @param {MouseEvent} e - Mouse event
     * @private
     */
    handleDoubleClick(e) {
      // Get the container that was clicked
      const containerIndex = this.imageContainers.findIndex(container => container.contains(e.target));
      if (containerIndex === -1) return;
      
      const container = this.imageContainers[containerIndex];
      const rect = container.getBoundingClientRect();
      
      // Calculate relative position for zoom origin
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Toggle zoom level
      this.zoomLevel = this.zoomLevel === 1 ? this.options.maxZoom : 1;
      
      // Reset pan offset when zooming out
      if (this.zoomLevel === 1) {
        this.panOffset = { x: 0, y: 0 };
      }
      
      this.zoomOrigin = { x, y };
      this.updateAllImages();
    }
    
    /**
     * Update all images and cursors
     * @private
     */
    updateAllImages() {
      // Update all images and cursors
      this.images.forEach((img, index) => {
        // Update image transform and position
        // Apply zoom and pan
        img.style.transform = `scale(${this.zoomLevel})`;
        img.style.transformOrigin = `${this.zoomOrigin.x}% ${this.zoomOrigin.y}%`;
        
        // Disable transition during panning for smoother drag experience
        img.style.transition = this.isPanning ? 'none' : 'transform 0.2s ease-out';
        
        // Use direct left/top positioning with translate for better performance
        img.style.position = 'absolute';
        img.style.left = '0';
        img.style.top = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.transform = `scale(${this.zoomLevel}) translate(${this.panOffset.x / this.zoomLevel}%, ${this.panOffset.y / this.zoomLevel}%)`;
        
        // Don't change container cursor - keep original cursor
        const container = this.imageContainers[index];
        
        // Ensure event listeners are working by adding a debug class
        if (this.isPanning) {
          container.classList.add('is-panning');
        } else {
          container.classList.remove('is-panning');
        }
        
        // Update custom cursor (only on non-active images)
        const cursor = this.cursors[index];
        if (this.isHovering && this.activeImageIndex !== null && this.activeImageIndex !== index) {
          cursor.style.display = 'block';
          
          // Position the cursor at the mouse position
          // Note: No need for transform offset since the SVG handles it
          cursor.style.left = `${this.mousePosition.x}%`;
          cursor.style.top = `${this.mousePosition.y}%`;
        } else {
          cursor.style.display = 'none';
        }
      });
    }
    
    /**
     * Public method to programmatically reset zoom and pan
     */
    reset() {
      this.zoomLevel = 1;
      this.panOffset = { x: 0, y: 0 };
      this.updateAllImages();
    }
    
    /**
     * Public method to programmatically set zoom level and position
     * @param {number} level - Zoom level
     * @param {Object} origin - Zoom origin as percentages
     * @param {number} origin.x - X position (0-100)
     * @param {number} origin.y - Y position (0-100)
     */
    setZoom(level, origin = { x: 50, y: 50 }) {
      this.zoomLevel = Math.max(1, Math.min(this.options.maxZoom, level));
      this.zoomOrigin = origin;
      this.updateAllImages();
    }
    
    /**
     * Automatically initialize all synchronized image containers on the page
     * Looks for elements with [data-sync-images] attribute
     * @param {Object} defaultOptions - Default options to apply to all instances
     * @returns {Array} Array of initialized SynchronizedImages instances
     */
    static initAll(defaultOptions = {}) {
      const instances = [];
      
      // Find all elements with data-sync-images attribute
      const containers = document.querySelectorAll('[data-sync-images]');
      
      // Initialize each container
      containers.forEach(container => {
        try {
          // Parse the image URLs from the data attribute
          const images = JSON.parse(container.dataset.images || '[]');
          
          // Get dimension options from data attributes
          const height = container.dataset.height;
          const width = container.dataset.width;
          const gap = container.dataset.gap;
          const maxWidth = container.dataset.maxWidth;
          const aspectRatio = container.dataset.aspectRatio;
          const cursorWidth = parseInt(container.dataset.cursorWidth || defaultOptions.cursorWidth || 28);
          const cursorHeight = parseInt(container.dataset.cursorHeight || defaultOptions.cursorHeight || 28);
          const fixedSize = container.dataset.fixedSize !== undefined 
            ? container.dataset.fixedSize !== 'false'
            : (defaultOptions.fixedSize !== undefined ? defaultOptions.fixedSize : true);
          
          // Get options from data attributes, falling back to default options
          const options = {
            ...defaultOptions,
            layout: container.dataset.layout || defaultOptions.layout,
            maxZoom: parseFloat(container.dataset.maxZoom) || defaultOptions.maxZoom || 2,
            showResetButton: container.dataset.showResetButton !== undefined 
              ? container.dataset.showResetButton !== 'false'
              : defaultOptions.showResetButton !== false,
            // Add dimension options
            height: height || defaultOptions.height,
            width: width || defaultOptions.width,
            gap: gap || defaultOptions.gap,
            maxWidth: maxWidth || defaultOptions.maxWidth,
            aspectRatio: aspectRatio || defaultOptions.aspectRatio,
            cursorSize: { 
              width: cursorWidth, 
              height: cursorHeight 
            },
            fixedSize: fixedSize
          };
          
          // Initialize and store the instance
          const instance = new SynchronizedImages(container, images, options);
          instances.push(instance);
        } catch (error) {
          console.error('Error initializing synchronized images:', error, container);
        }
      });
      
      return instances;
    }
  }
  
  // If using as a module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SynchronizedImages;
  }