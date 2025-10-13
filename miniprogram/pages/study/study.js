// pages/study/study.js
const util = require('../../utils/util.js');

Page({
  data: {
    deck: null, // The full deck object
    currentIndex: 0,
    isFlipped: false
  },

  onLoad(options) {
    // Using onShow to reload data when coming back from editor
  },

  onShow() {
    // Need to find the deckId. It might be from initial load or stored.
    // A more robust way is to get it from the page stack if options is not available in onShow
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const deckId = currentPage.options.id;

    if (!deckId) {
      // This case should ideally not happen in a normal flow
      return;
    }

    const allData = util.loadData();
    const deck = allData.decks.find(d => d.id === deckId);

    if (deck) {
      this.setData({
        deck: deck,
        // Reset study progress when page is shown
        currentIndex: 0,
        isFlipped: false
      });
      wx.setNavigationBarTitle({ title: deck.name });
    } else {
      this.showErrorAndGoBack('找不到卡片集');
    }
  },

  showErrorAndGoBack(title) {
    wx.showToast({
      title: title,
      icon: 'none'
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  flipCard() {
    // Do not flip if there are no cards
    if (this.data.deck.cards.length === 0) return;
    this.setData({ isFlipped: !this.data.isFlipped });
  },

  nextCard() {
    if (this.data.currentIndex < this.data.deck.cards.length - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1,
        isFlipped: false // Reset flip state for the new card
      });
    }
  },

  prevCard() {
    if (this.data.currentIndex > 0) {
      this.setData({
        currentIndex: this.data.currentIndex - 1,
        isFlipped: false // Reset flip state for the new card
      });
    }
  },

  navigateToAddCard() {
    wx.navigateTo({
      url: `../editor/editor?id=${this.data.deck.id}`
    });
  }
});
