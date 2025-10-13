// pages/index/index.js
const util = require('../../utils/util.js');

Page({
  data: {
    decks: []
  },

  onShow() {
    this.loadDecks();
  },

  loadDecks() {
    const data = util.loadData();
    this.setData({ decks: data.decks });
  },

  navigateToAdd() {
    wx.navigateTo({ url: '../editor/editor' });
  },

  navigateToStudy(e) {
    const deckId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `../study/study?id=${deckId}` });
  },

  navigateToEdit(e) {
    const deckId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `../editor/editor?id=${deckId}` });
  },

  showDeleteModal(e) {
    const deckId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '您确定要删除这个卡片集吗？此操作无法撤销。',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          this.deleteDeck(deckId);
        }
      }
    });
  },

  deleteDeck(deckId) {
    const allData = util.loadData();
    allData.decks = allData.decks.filter(d => d.id !== deckId);
    util.saveData(allData);
    this.loadDecks();
    wx.showToast({ title: '已删除', icon: 'success' });
  }
});
