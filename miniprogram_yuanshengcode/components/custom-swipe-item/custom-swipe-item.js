// components/custom-swipe-item/custom-swipe-item.js
Component({
  properties: {
    leftWidth: {
      type: Number,
      value: 0 // Width of actions on the left side
    },
    rightWidth: {
      type: Number,
      value: 0 // Width of actions on the right side
    },
    // Property to determine if it's a restore action (for button text/color)
    isRestore: {
      type: Boolean,
      value: false
    }
  },

  data: {
    translateX: 0,
    startX: 0,
    startY: 0,
    isMoving: false, // To disable transition during touchmove
  },

  methods: {
    onTouchStart(e) {
      if (e.touches.length !== 1) return;
      this.setData({
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        isMoving: true, // Disable transition while dragging
      });
    },

    onTouchMove(e) {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - this.data.startX;
      const deltaY = touch.clientY - this.data.startY;

      // If scrolling vertically, do nothing (allow page scroll)
      if (Math.abs(deltaY) > Math.abs(deltaX) && this.data.translateX === 0) {
        return;
      }

      let newTranslateX = this.data.translateX + deltaX;

      // Boundary checks
      // For right swipe (revealing left actions)
      if (newTranslateX < 0) {
        newTranslateX = 0; // No left swipe beyond 0 if left actions are not defined
      }
      if (newTranslateX > this.properties.leftWidth) {
        newTranslateX = this.properties.leftWidth;
      }

      // For left swipe (revealing right actions)
      if (newTranslateX > 0) {
        newTranslateX = 0; // No right swipe beyond 0 if right actions are not defined
      }
      if (newTranslateX < -this.properties.rightWidth) {
        newTranslateX = -this.properties.rightWidth;
      }

      this.setData({
        translateX: newTranslateX,
        startX: touch.clientX, // Update startX for continuous movement
        startY: touch.clientY,
      });
    },

    onTouchEnd(e) {
      this.setData({ isMoving: false }); // Re-enable transition

      // Snap open or closed based on direction and threshold
      if (this.data.translateX > this.properties.leftWidth / 2) {
        this.setData({ translateX: this.properties.leftWidth }); // Snap open left
      } else if (this.data.translateX < -this.properties.rightWidth / 2) {
        this.setData({ translateX: -this.properties.rightWidth }); // Snap open right
      } else {
        this.setData({ translateX: 0 }); // Snap closed
      }
    },

    // Triggered when left action button is clicked
    onLeftAction() {
      this.triggerEvent('leftaction');
      this.setData({ translateX: 0 }); // Close swipe cell
    },

    // Triggered when right action button is clicked
    onRightAction() {
      this.triggerEvent('rightaction');
      this.setData({ translateX: 0 }); // Close swipe cell
    },

    // Method to close the swipe cell programmatically
    close() {
      this.setData({ translateX: 0 });
    }
  }
})
