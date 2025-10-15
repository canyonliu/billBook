const util = require('../../utils/util.js');

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

const formatDateTimeForList = (date, filterType) => {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  if (filterType === 'day') return `${hours}:${minutes}`;
  return `${month}-${day} ${hours}:${minutes}`;
};

const iconMap = {
  '餐饮': 'food-o',
  '交通': 'logistics',
  '购物': 'shopping-cart-o',
  '娱乐': 'smile-o',
  '住房': 'wap-home-o',
  '学习': 'notes-o',
  '工资': 'gold-coin-o',
  '理财': 'balance-o',
  'default': 'bill-o',
};

const groupAndProcessTransactions = (transactions, filterType) => {
  if (!transactions.length) return [];

  const getIcon = (tags) => {
    if (!tags || !tags.length) return iconMap.default;
    const foundTag = tags.find(tag => iconMap[tag]);
    return foundTag ? iconMap[foundTag] : iconMap.default;
  };

  const processed = transactions.map(t => ({
    ...t,
    displayText: formatDateTimeForList(t.date, filterType),
    icon: getIcon(t.tags),
  }));

  const groups = processed.reduce((acc, t) => {
    const dateKey = formatDate(t.date);
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
      };
    }
    acc[dateKey].transactions.push(t);
    if (t.type === 'income') {
      acc[dateKey].totalIncome += t.amount;
    } else {
      acc[dateKey].totalExpense += t.amount;
    }
    return acc;
  }, {});

  return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    groupedTransactions: [], // New data structure for UI

    // Picker related data
    showDatePicker: false,
    minDate: new Date(2000, 0, 1).getTime(),
    maxDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') return `${value}年`;
      if (type === 'month') return `${value}月`;
      if (type === 'day') return `${value}日`;
      return value;
    },
    currentDate: new Date().getTime(),
    yearActions: Array.from({ length: 30 }, (_, i) => ({ name: String(new Date().getFullYear() - i) })),
    showYearActionSheet: false,
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
    
    let periodIncome = 0;
    let periodExpense = 0;

    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      if (filterType === 'year') return tDate.getFullYear() === filterDate.getFullYear();
      if (filterType === 'month') return tDate.getFullYear() === filterDate.getFullYear() && tDate.getMonth() === filterDate.getMonth();
      if (filterType === 'day') return formatDate(tDate) === formatDate(filterDate);
      return false;
    });

    filtered.forEach(t => {
      if (t.type === 'income') {
        periodIncome += t.amount;
      } else {
        periodExpense += t.amount;
      }
    });

    const groupedTransactions = groupAndProcessTransactions(filtered, filterType);

    this.setData({ 
      totalIncome: periodIncome,
      totalExpense: periodExpense,
      groupedTransactions
    });
  },

  onTabChange(event) {
    let filterType = 'day';
    if (event.detail.name === 1) filterType = 'month';
    else if (event.detail.name === 2) filterType = 'year';
    
    this.setData({ filterType, activeTab: event.detail.name });
    
    const now = new Date();
    this.setData({
      currentDate: now.getTime(),
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      currentDay: now.getDate(),
    });
    this.calculateTotals();
  },

  onDisplayDatePicker() {
    if (this.data.filterType === 'year') {
      this.setData({ showYearActionSheet: true });
    } else {
      this.setData({ showDatePicker: true });
    }
  },

  onCloseDatePicker() {
    this.setData({ showDatePicker: false });
  },

  onCloseYearActionSheet() {
    this.setData({ showYearActionSheet: false });
  },

  onSelectYear(event) {
    const selectedYear = event.detail.name;
    const selectedDate = new Date(selectedYear, 0, 1);
    this.setData({
      currentDate: selectedDate.getTime(),
      currentYear: selectedYear,
    });
    this.calculateTotals();
  },

  onPickerConfirm(event) {
    const selectedDate = new Date(event.detail);
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
});
