// pages/index/index.js
const util = require('../../utils/util.js');

Page({
  data: {
    decks: [],
    showSidebar: false
  },

  onShow() {
    console.log('index.js: onShow triggered');
    this.loadDecks();
  },

  loadDecks() {
    console.log('index.js: loadDecks called');
    const data = util.loadData();
    console.log('index.js: Data loaded from util', data);
    this.setData({ decks: data.decks });
    console.log('index.js: decks set to data', this.data.decks);
  },

  navigateToAdd() {
    wx.navigateTo({ url: '../editor/editor' });
  },

  navigateToStudy(e) {
    const deckId = e.currentTarget.dataset.id;
    console.log('index.js: navigateToStudy for deckId', deckId);
    wx.navigateTo({ url: `../study/study?id=${deckId}` });
  },

  navigateToEdit(e) {
    const deckId = e.currentTarget.dataset.id;
    console.log('index.js: navigateToEdit for deckId', deckId);
    wx.navigateTo({ url: `../editor/editor?id=${deckId}` });
  },

  showDeleteModal(e) {
    const deckId = e.currentTarget.dataset.id;
    console.log('index.js: showDeleteModal for deckId', deckId);
    wx.showModal({
      title: '确认删除',
      content: '您确定要将这个卡片集移入回收站吗？',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          console.log('index.js: Delete confirmed for deckId', deckId);
          this.moveToRecycleBin(deckId);
        } else {
          console.log('index.js: Delete cancelled for deckId', deckId);
        }
      }
    });
  },

  moveToRecycleBin(deckId) {
    console.log('index.js: moveToRecycleBin called for deckId', deckId);
    const allData = util.loadData();
    console.log('index.js: allData before modification', allData);
    const deckIndex = allData.decks.findIndex(d => d.id === deckId);

    if (deckIndex > -1) {
      const [deck] = allData.decks.splice(deckIndex, 1);
      console.log('index.js: Deck removed from active decks', deck);
      deck.deletedAt = Date.now(); // Mark deletion time
      // Ensure deletedDecks array exists (though util.loadData now handles this)
      if (!allData.deletedDecks) {
        allData.deletedDecks = [];
      }
      allData.deletedDecks.push(deck);
      console.log('index.js: allData after modification', allData);
      util.saveData(allData);
      this.loadDecks(); // Refreshes the UI
      wx.showToast({ title: '已移入回收站', icon: 'success' });
    } else {
      console.log('index.js: Deck not found in active decks for deletion', deckId);
    }
  },

  // Sidebar related methods
  onOpenSidebar() {
    console.log('index.js: onOpenSidebar triggered');
    this.setData({ showSidebar: true });
  },

  onCloseSidebar() {
    console.log('index.js: onCloseSidebar triggered');
    this.setData({ showSidebar: false });
  },

  navigateToRecycleBinFromSidebar() {
    console.log('index.js: navigateToRecycleBinFromSidebar triggered');
    this.onCloseSidebar(); // Close sidebar first
    wx.navigateTo({
      url: '../recycleBin/recycleBin'
    });
  },

  onSwipeCellClose(e) {
    console.log('index.js: Swipe cell closed', e.detail);
  }
});
