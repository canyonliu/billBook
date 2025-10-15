// pages/recycleBin/recycleBin.js
const util = require('../../utils/util.js');

const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

Page({
  data: {
    deletedDecks: []
  },

  onShow() {
    this.loadDeletedDecks();
  },

  loadDeletedDecks() {
    const allData = util.loadData();
    const now = Date.now();

    // Filter out decks older than 3 days
    const validDeletedDecks = allData.deletedDecks.filter(deck => {
      return (now - deck.deletedAt) < THREE_DAYS_IN_MS;
    });

    // If any decks were auto-deleted, save the updated list
    if (validDeletedDecks.length !== allData.deletedDecks.length) {
      allData.deletedDecks = validDeletedDecks;
      util.saveData(allData);
    }

    // Format deletedAt for display
    const formattedDecks = validDeletedDecks.map(deck => ({
      ...deck,
      deletedAtText: new Date(deck.deletedAt).toLocaleString() // Format date for display
    }));

    this.setData({
      deletedDecks: formattedDecks
    });
  },

  handleRestore(e) {
    const deckId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认恢复',
      content: '您确定要恢复这个卡片集吗？',
      confirmColor: '#1989fa',
      success: (res) => {
        if (res.confirm) {
          this.restoreDeck(deckId);
        }
      }
    });
  },

  restoreDeck(deckId) {
    const allData = util.loadData();
    const deckToRestoreIndex = allData.deletedDecks.findIndex(d => d.id === deckId);

    if (deckToRestoreIndex > -1) {
      const [deck] = allData.deletedDecks.splice(deckToRestoreIndex, 1);
      // Remove deletedAt property as it's restored
      delete deck.deletedAt;
      allData.decks.push(deck);
      util.saveData(allData);
      this.loadDeletedDecks(); // Refresh the list
      wx.showToast({ title: '恢复成功', icon: 'success' });
    }
  },

  handlePermanentDelete(e) {
    const deckId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '彻底删除',
      content: '您确定要彻底删除这个卡片集吗？此操作无法撤销！',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          this.permanentDeleteDeck(deckId);
        }
      }
    });
  },

  permanentDeleteDeck(deckId) {
    const allData = util.loadData();
    allData.deletedDecks = allData.deletedDecks.filter(d => d.id !== deckId);
    util.saveData(allData);
    this.loadDeletedDecks(); // Refresh the list
    wx.showToast({ title: '已彻底删除', icon: 'success' });
  }
})
