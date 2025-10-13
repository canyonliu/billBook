// pages/editor/editor.js
const util = require('../../utils/util.js');

Page({
  data: {
    deckId: null,
    deckName: '',
    cards: [],
    isEditMode: false
  },

  onLoad(options) {
    const deckId = options.id;
    if (deckId) {
      // Edit Mode
      const allData = util.loadData();
      const deck = allData.decks.find(d => d.id === deckId);
      if (deck) {
        this.setData({
          isEditMode: true,
          deckId: deck.id,
          deckName: deck.name,
          cards: deck.cards
        });
        wx.setNavigationBarTitle({ title: '编辑卡片集' });
      } else {
        // Handle error: deck not found
        wx.showToast({ title: '找不到卡片集', icon: 'none' });
        wx.navigateBack();
      }
    } else {
      // Create Mode
      this.setData({
        isEditMode: false
      });
      wx.setNavigationBarTitle({ title: '新建卡片集' });
    }
  },

  // --- Deck Name Handling ---
  onDeckNameInput(e) {
    this.setData({ deckName: e.detail.value });
  },

  // --- Card List Management ---
  addCard() {
    const newCard = {
      id: util.generateId(),
      front: '',
      back: ''
    };
    this.setData({
      cards: [...this.data.cards, newCard]
    });
  },

  removeCard(e) {
    const cardId = e.currentTarget.dataset.id;
    this.setData({
      cards: this.data.cards.filter(c => c.id !== cardId)
    });
  },

  onCardInput(e) {
    const cardId = e.currentTarget.dataset.id;
    const field = e.currentTarget.dataset.field; // 'front' or 'back'
    const value = e.detail.value;

    const newCards = this.data.cards.map(card => {
      if (card.id === cardId) {
        return { ...card, [field]: value };
      }
      return card;
    });
    this.setData({ cards: newCards });
  },

  // --- Save Logic ---
  save() {
    if (!this.data.deckName.trim()) {
      wx.showToast({ title: '卡片集名称不能为空', icon: 'none' });
      return;
    }

    const allData = util.loadData();

    if (this.data.isEditMode) {
      // Update existing deck
      const deckIndex = allData.decks.findIndex(d => d.id === this.data.deckId);
      if (deckIndex > -1) {
        allData.decks[deckIndex].name = this.data.deckName;
        allData.decks[deckIndex].cards = this.data.cards;
      }
    } else {
      // Create new deck
      const newDeck = {
        id: util.generateId(),
        name: this.data.deckName,
        cards: this.data.cards
      };
      allData.decks.push(newDeck);
    }

    util.saveData(allData);

    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1500);
  }
});
