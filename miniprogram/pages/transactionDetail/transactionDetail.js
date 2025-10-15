const util = require('../../utils/util.js');

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

const getIcon = (tags) => {
  if (!tags || !tags.length) return iconMap.default;
  const foundTag = tags.find(tag => iconMap[tag]);
  return foundTag ? iconMap[foundTag] : iconMap.default;
};

Page({
  data: {
    activeTab: 0,
    incomeTransactions: [],
    expenseTransactions: [],
  },

  onLoad(options) {
    const { year, month, day, filterType } = options;
    const allData = util.loadData();
    const transactions = allData.transactions || [];

    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      const matchYear = String(tDate.getFullYear()) === year;
      if (filterType === 'year') return matchYear;
      const matchMonth = String(tDate.getMonth() + 1) === month;
      if (filterType === 'month') return matchYear && matchMonth;
      if (filterType === 'day') {
        const matchDay = String(tDate.getDate()) === day;
        return matchYear && matchMonth && matchDay;
      }
      return false;
    });

    const formatted = filtered.map(t => ({
      ...t,
      displayText: formatDateTimeForList(t.date, filterType),
      icon: getIcon(t.tags),
    }));

    this.setData({
      incomeTransactions: formatted.filter(t => t.type === 'income'),
      expenseTransactions: formatted.filter(t => t.type === 'expense'),
    });

    let title = '账单详情';
    if (filterType === 'year') title = `${year}年账单`;
    else if (filterType === 'month') title = `${year}年${month}月账单`;
    else if (filterType === 'day') title = `${year}年${month}月${day}日账单`;
    wx.setNavigationBarTitle({ title });
  },

  onTabChange(event) {
    this.setData({ activeTab: event.detail.name });
  },
});
