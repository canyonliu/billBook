// pages/addTransaction/addTransaction.js
const util = require('../../utils/util.js');

Page({
  data: {
    type: 'expense', // 'income' or 'expense'
    amount: '',
    description: '',
    tags: '', // Comma-separated string
    tagList: [], // Array of tags
    transactionDate: new Date().getTime(),
    formattedDate: '',

    // Default tags
    defaultTags: ['餐饮', '交通', '购物', '娱乐', '住房', '学习', '工资', '理财'],

    // Date picker
    showDatePicker: false,
    minDate: new Date(2000, 0, 1).getTime(),
    maxDate: new Date().getTime(),
  },

  onLoad(options) {
    this.formatDisplayDate(this.data.transactionDate);
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

  onTagsChange(event) {
    this.setData({ tags: event.detail });
  },

  formatTags() {
    const { tags } = this.data;
    const tagList = tags
      .split(/[,，\s]+/)
      .filter(tag => tag.trim() !== '');
    this.setData({ tagList });
  },

  onSelectTag(event) {
    const selectedTag = event.currentTarget.dataset.tag;
    let { tagList } = this.data;

    if (tagList.includes(selectedTag)) {
      // Remove tag if it's already selected
      tagList = tagList.filter(t => t !== selectedTag);
    } else {
      // Add tag
      tagList.push(selectedTag);
    }

    this.setData({
      tagList,
      tags: tagList.join(', ')
    });
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
    const { type, amount, description, transactionDate, tagList } = this.data;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      wx.showToast({ title: '请输入有效的金额', icon: 'none' });
      return;
    }

    const allData = util.loadData();
    if (!allData.transactions) {
      allData.transactions = [];
    }

    const newTransaction = {
      id: util.generateId(),
      type,
      amount: parseFloat(amount),
      description,
      tags: tagList,
      date: transactionDate,
    };

    allData.transactions.unshift(newTransaction); // Add to the beginning
    util.saveData(allData);

    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
