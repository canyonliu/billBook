// pages/addTransaction/addTransaction.js
const util = require('../../utils/util.js');

Page({
  data: {
    type: 'expense', // 'income' or 'expense'
    amount: '',
    description: '',
    transactionDate: new Date().getTime(),
    formattedDate: '',
    transactionId: null, // To store the ID of the transaction being edited
    isEditMode: false, // Flag to indicate if in edit mode

    // Categorized tags for van-tree-select
    categorizedTags: [
      {
        text: '生活',
        children: [
          { id: '餐饮', text: '餐饮', icon: 'food-o' },
          { id: '购物', text: '购物', icon: 'shopping-cart-o' },
          { id: '交通', text: '交通', icon: 'logistics' },
          { id: '娱乐', text: '娱乐', icon: 'smile-o' },
          { id: '住房', text: '住房', icon: 'wap-home-o' },
          { id: '学习', text: '学习', icon: 'notes-o' },
        ],
      },
      {
        text: '理财',
        children: [
          { id: '工资', text: '工资', icon: 'gold-coin-o' },
          { id: '理财', text: '理财', icon: 'balance-o' },
        ],
      },
      // Add more categories and tags as needed
    ],
    mainActiveIndex: 0, // Current active category index for van-tree-select
    activeTagIds: [], // Array of selected tag IDs
    selectedTagNames: '', // Display string for selected tags
    showTagSelector: false, // Control visibility of tag selection popup

    // Date picker
    showDatePicker: false,
    minDate: new Date(2000, 0, 1).getTime(),
    maxDate: new Date().getTime(),
  },

  onLoad(options) {
    if (options.id) {
      const allData = util.loadData();
      const transaction = allData.transactions.find(t => t.id === options.id);
      if (transaction) {
        this.setData({
          transactionId: transaction.id,
          isEditMode: true,
          type: transaction.type,
          amount: transaction.amount.toString(),
          description: transaction.description,
          activeTagIds: transaction.tags, // Populate activeTagIds
          transactionDate: transaction.date,
        });
        this.formatDisplayDate(transaction.date);
        this.updateSelectedTagNames(); // Update display for selected tags
        wx.setNavigationBarTitle({ title: '编辑记账' });
      } else {
        wx.showToast({ title: '交易不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } else {
      this.formatDisplayDate(this.data.transactionDate);
      wx.setNavigationBarTitle({ title: '新增记账' });
    }
  },

  formatDisplayDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    this.setData({
      formattedDate: `${year}-${month}-${day} ${hours}:${minutes}`
    });
  },

  // Update selected tag names for display
  updateSelectedTagNames() {
    const { categorizedTags, activeTagIds } = this.data;
    const selectedNames = [];
    categorizedTags.forEach(category => {
      category.children.forEach(tag => {
        if (activeTagIds.includes(tag.id)) {
          selectedNames.push(tag.text);
        }
      });
    });
    this.setData({ selectedTagNames: selectedNames.join(', ') });
  },

  // Form handlers
  onTypeChange(event) {
    this.setData({ type: event.detail });
  },

  onAmountChange(event) {
    this.setData({ amount: event.detail });
  },

  onDescriptionChange(event) {
    this.setData({ description: event.detail });
  },

  // Tag selection handlers
  onShowTagSelector() {
    this.setData({ showTagSelector: true });
  },

  onCloseTagSelector() {
    this.setData({ showTagSelector: false });
  },

  onClickNav(event) {
    this.setData({ mainActiveIndex: event.detail.index || 0 });
  },

  onSelectTagItem(event) {
    const { id } = event.detail;
    let { activeTagIds } = this.data;

    const index = activeTagIds.indexOf(id);
    if (index > -1) {
      activeTagIds.splice(index, 1); // Remove tag
    } else {
      activeTagIds.push(id); // Add tag
    }

    this.setData({ activeTagIds });
    this.updateSelectedTagNames();
  },

  // Date Picker handlers
  onDisplayDatePicker() {
    this.setData({ showDatePicker: true });
  },

  onCloseDatePicker() {
    this.setData({ showDatePicker: false });
  },

  onConfirmDatePicker(event) {
    const selectedDate = event.detail;
    this.setData({
      transactionDate: selectedDate,
      showDatePicker: false
    });
    this.formatDisplayDate(selectedDate);
  },

  onCancelDatePicker() {
    this.setData({ showDatePicker: false });
  },

  // Save logic
  onSave() {
    const { type, amount, description, transactionDate, activeTagIds, transactionId, isEditMode } = this.data;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      wx.showToast({ title: '请输入有效的金额', icon: 'none' });
      return;
    }

    const allData = util.loadData();
    if (!allData.transactions) {
      allData.transactions = [];
    }

    const newTransaction = {
      id: isEditMode ? transactionId : util.generateId(),
      type,
      amount: parseFloat(amount),
      description,
      tags: activeTagIds, // Save activeTagIds as tags
      date: transactionDate,
    };

    if (isEditMode) {
      const index = allData.transactions.findIndex(t => t.id === transactionId);
      if (index !== -1) {
        allData.transactions[index] = newTransaction;
      }
    } else {
      allData.transactions.unshift(newTransaction); // Add to the beginning
    }
    
    util.saveData(allData);

    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
