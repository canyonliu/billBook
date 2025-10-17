import { useState, useEffect, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Tabs, Tab, Sticky, Icon, Popup, DatetimePicker, ActionSheet, Empty, Tag } from '@antmjs/vantui';
import * as util from '../../utils/util';
import './index.scss';

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

const getIcon = (tags) => {
  if (!tags || !tags.length) return iconMap.default;
  const foundTag = tags.find(tag => iconMap[tag]);
  return foundTag ? iconMap[foundTag] : iconMap.default;
};

const groupAndProcessTransactions = (transactions, filterType) => {
  if (!transactions.length) return [];

  const processed = transactions.map(t => {
    const tagObjects = (t.tags || []).map(tag => {
      const tagName = (typeof tag === 'object' && tag !== null) ? tag.text || tag.id : tag;
      return {
        name: tagName,
        icon: iconMap[tagName] || iconMap.default
      };
    });

    return {
      ...t,
      displayText: formatDateTimeForList(t.date, filterType),
      icon: getIcon(t.tags),
      tagObjects: tagObjects
    };
  });

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

export default function Accounting() {
  const [activeTab, setActiveTab] = useState(0);
  const [filterType, setFilterType] = useState('day'); // 'day', 'month', or 'year'
  const [currentDate, setCurrentDate] = useState(new Date().getTime());
  const [transactions, setTransactions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearActionSheet, setShowYearActionSheet] = useState(false);

  const current = new Date(currentDate);
  const currentYear = current.getFullYear();
  const currentMonth = current.getMonth() + 1;
  const currentDay = current.getDate();

  useDidShow(() => {
    loadTransactions();
  });

  const loadTransactions = () => {
    const allData = util.loadData();
    setTransactions(allData.transactions || []);
  };

  const { totalIncome, totalExpense, groupedTransactions } = useMemo(() => {
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

    const grouped = groupAndProcessTransactions(filtered, filterType);

    return { totalIncome: periodIncome, totalExpense: periodExpense, groupedTransactions: grouped };
  }, [transactions, filterType, currentDate]);

  const onTabChange = (e) => {
    const index = e.detail.index;
    let newFilterType = 'day';
    if (index === 1) newFilterType = 'month';
    else if (index === 2) newFilterType = 'year';
    
    setActiveTab(index);
    setFilterType(newFilterType);
    setCurrentDate(new Date().getTime());
  };

  const onDisplayDatePicker = () => {
    if (filterType === 'year') {
      setShowYearActionSheet(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const onPickerConfirm = (event) => {
    const selectedDate = new Date(event.detail);
    setShowDatePicker(false);
    setCurrentDate(selectedDate.getTime());
  };

  const onSelectYear = (event) => {
    const selectedYear = event.detail.name;
    const selectedDate = new Date(selectedYear, 0, 1);
    setCurrentDate(selectedDate.getTime());
    setShowYearActionSheet(false);
  };

  const navigateToAddTransaction = () => {
    Taro.navigateTo({ url: '/pages/addTransaction/addTransaction' });
  };

  const onEditTransaction = (id) => {
    Taro.navigateTo({ url: `/pages/addTransaction/addTransaction?id=${id}` });
  };

  const navigateToDetails = () => {
    const url = `/pages/transactionDetail/transactionDetail?year=${currentYear}&month=${currentMonth}&day=${currentDay}&filterType=${filterType}`;
    Taro.navigateTo({ url });
  };

  const yearActions = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ name: String(new Date().getFullYear() - i) })), []);

  const renderContent = () => (
    <>
      <Sticky>
        <View className="sticky-header-container">
          <View className="date-selector" onClick={onDisplayDatePicker}>
            <Text>
              {filterType === 'day' && `${currentYear}年${currentMonth}月${currentDay}日`}
              {filterType === 'month' && `${currentYear}年${currentMonth}月`}
              {filterType === 'year' && `${currentYear}年`}
            </Text>
            <Icon name="arrow-down" size="16px" color="#666" />
          </View>
          <View className="totals-card" onClick={navigateToDetails}>
            <View className="total-item">
              <Text className="label">{filterType === 'day' ? '日' : filterType === 'month' ? '月' : '年'}收入</Text>
              <Text className="value income">+{totalIncome.toFixed(2)}</Text>
            </View>
            <View className="total-item">
              <Text className="label">{filterType === 'day' ? '日' : filterType === 'month' ? '月' : '年'}支出</Text>
              <Text className="value expense">-{totalExpense.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </Sticky>

      <View className="transaction-group-list">
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map(group => (
            <View key={group.date} className="transaction-group">
              <View className="group-header">
                <Text className="group-date">{group.date}</Text>
                <View className="group-summary">
                  {group.totalIncome > 0 && <Text>收: {group.totalIncome.toFixed(2)}</Text>}
                  {group.totalExpense > 0 && <Text>支: {group.totalExpense.toFixed(2)}</Text>}
                </View>
              </View>
              {group.transactions.map(item => (
                <View key={item.id} className="transaction-card" onClick={() => onEditTransaction(item.id)}>
                  <Icon name={item.icon} size="24px" className="card-icon" />
                  <View className="card-content">
                    <Text className="item-desc">{item.description || '无描述'}</Text>
                    <View className="tags-and-time">
                      {item.tagObjects.map((tag, tagIndex) => (
                        <Tag key={tagIndex} plain type="primary" className="icon-tag">
                          <Icon name={tag.icon} />
                          <Text className="tag-text">{tag.name}</Text>
                        </Tag>
                      ))}
                      <Tag plain type="default" className="time-tag">{item.displayText}</Tag>
                    </View>
                  </View>
                  <Text className={`card-amount ${item.type}`}>{item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Empty description="暂无交易记录" />
        )}
      </View>
    </>
  );

  return (
    <View className="container">
      <Tabs active={activeTab} onChange={onTabChange} sticky>
        <Tab title="按日">{renderContent()}</Tab>
        <Tab title="按月">{renderContent()}</Tab>
        <Tab title="按年">{renderContent()}</Tab>
      </Tabs>

      <Button className="add-transaction-btn" onClick={navigateToAddTransaction}>
        <Icon name="plus" color="#fff" size="20px" />
        <Text>新增记账</Text>
      </Button>

      <Popup show={showDatePicker} position="bottom" onClose={() => setShowDatePicker(false)}>
        <DatetimePicker
          type={filterType === 'day' ? 'date' : 'year-month'}
          value={currentDate}
          minDate={new Date(2000, 0, 1).getTime()}
          maxDate={new Date().getTime()}
          onConfirm={onPickerConfirm}
          onCancel={() => setShowDatePicker(false)}
          formatter={(type, value) => {
            if (type === 'year') return `${value}年`;
            if (type === 'month') return `${value}月`;
            if (type === 'day') return `${value}日`;
            return value;
          }}
        />
      </Popup>

      <ActionSheet
        show={showYearActionSheet}
        actions={yearActions}
        title="选择年份"
        onClose={() => setShowYearActionSheet(false)}
        onSelect={onSelectYear}
        onCancel={() => setShowYearActionSheet(false)}
      />
    </View>
  );
}
