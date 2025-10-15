// pages/accounting/accounting.js
const util = require('../../utils/util.js');

// Helper to format date as YYYY/M/D for robust comparison
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

// Helper to format date/time for list display
const formatDateTimeForList = (date, filterType) => {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  if (filterType === 'day') {
    return `${hours}:${minutes}`;
  }
  return `${month}-${day} ${hours}:${minutes}`;
};

Page({
  data: {
    activeTab: 0,
    filterType: 'day', // 'day', 'month', or 'year'
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    currentDay: new Date().getDate(),
    totalIncome: 0,
    totalExpense: 0,
    transactions: [],
    filteredTransactions: [],

    // Picker related data
    showDatePicker: false,
    minDate: new Date(2000, 0, 1).getTime(),
    maxDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      }
      if (type === 'month') {
        return `${value}月`;
      }
      if (type === 'day') {
        return `${value}日`;
      }
      return value;
    },
    currentDate: new Date().getTime(),
    yearColumns: Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i)),
  },

  onShow() {
    this.loadTransactions();
  },

  loadTransactions() {
    const allData = util.loadData();
    const transactions = allData.transactions || [];
    this.setData({ transactions });
    this.calculateTotals();
  },

  calculateTotals() {
    const { transactions, filterType, currentDate } = this.data;
    const filterDate = new Date(currentDate);
    
    let totalIncome = 0;
    let totalExpense = 0;

    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);

      if (filterType === 'year') {
        return tDate.getFullYear() === filterDate.getFullYear();
      }

      if (filterType === 'month') {
        return tDate.getFullYear() === filterDate.getFullYear() &&
               tDate.getMonth() === filterDate.getMonth();
      }

      if (filterType === 'day') {
        return formatDate(tDate) === formatDate(filterDate);
      }
      
      return false;
    });

    const filteredTransactions = filtered.map(t => ({
      ...t,
      displayText: formatDateTimeForList(t.date, filterType)
    }));

    filteredTransactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
      }
    });

    this.setData({ totalIncome, totalExpense, filteredTransactions });
  },

  onTabChange(event) {
    let filterType = 'day';
    if (event.detail.name === 1) {
      filterType = 'month';
    } else if (event.detail.name === 2) {
      filterType = 'year';
    }
    this.setData({
      filterType,
      activeTab: event.detail.name
    });
    
    // When switching tabs, reset date to current day/month/year to avoid confusion
    const now = new Date();
    this.setData({
      currentDate: now.getTime(),
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      currentDay: now.getDate(),
    });
    this.calculateTotals();
  },

  // Date Picker related methods
  onDisplayDatePicker() {
    this.setData({ showDatePicker: true });
  },

  onCloseDatePicker() {
    this.setData({ showDatePicker: false });
  },

  onPickerConfirm(event) {
    const { filterType } = this.data;
    let selectedDate;

    if (filterType === 'year') {
      const selectedYear = event.detail.value;
      selectedDate = new Date(selectedYear, 0, 1); // Use Jan 1st of the selected year
    } else {
      selectedDate = new Date(event.detail);
    }
    
    this.setData({
      showDatePicker: false,
      currentDate: selectedDate.getTime(),
      currentYear: selectedDate.getFullYear(),
      currentMonth: selectedDate.getMonth() + 1,
      currentDay: selectedDate.getDate(),
    });
    this.calculateTotals();
  },

  onCancelDatePicker() {
    this.setData({ showDatePicker: false });
  },

  navigateToAddTransaction() {
    wx.navigateTo({ url: '../addTransaction/addTransaction' });
  },

  navigateToDetails() {
    const { currentYear, currentMonth, currentDay, filterType } = this.data;
    const url = `../transactionDetail/transactionDetail?year=${currentYear}&month=${currentMonth}&day=${currentDay}&filterType=${filterType}`;
    wx.navigateTo({ url });
  }
})
