import { useState, useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Tabs, Tab, Empty, Icon, Tag } from '@antmjs/vantui';
import * as util from '../../utils/util';
import './index.scss';

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

export default function TransactionDetail() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [expenseTransactions, setExpenseTransactions] = useState([]);

  useEffect(() => {
    const { year, month, day, filterType } = router.params;
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

    setIncomeTransactions(formatted.filter(t => t.type === 'income'));
    setExpenseTransactions(formatted.filter(t => t.type === 'expense'));

    let title = '账单详情';
    if (filterType === 'year') title = `${year}年账单`;
    else if (filterType === 'month') title = `${year}年${month}月账单`;
    else if (filterType === 'day') title = `${year}年${month}月${day}日账单`;
    Taro.setNavigationBarTitle({ title });
  }, [router.params]);

  const onEditTransaction = (id) => {
    Taro.navigateTo({ url: `/pages/addTransaction/addTransaction?id=${id}` });
  };

  const renderList = (list, type) => {
    if (list.length === 0) {
      return <Empty description={`暂无${type}记录`} />;
    }
    return (
      <View className="list-container">
        {list.map(item => (
          <View key={item.id} className="transaction-card" onClick={() => onEditTransaction(item.id)}>
            <Icon name={item.icon} size="24px" className="card-icon" />
            <View className="card-content">
              <Text className="description">{item.description || '无描述'}</Text>
              <View className="tags-and-time">
                {item.tags.map(tag => <Tag key={tag} plain type="primary">{tag}</Tag>)}
                <Tag plain type="default" className="time-tag">{item.displayText}</Tag>
              </View>
            </View>
            <Text className={`card-amount ${type}`}>{type === 'income' ? '+' : '-'}{item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="container">
      <Tabs active={activeTab} onChange={(e) => setActiveTab(e.detail.index)} sticky navClass="fixed-width-nav" className="full-width-tabs">
        <Tab title="支出">
          {renderList(expenseTransactions, '支出')}
        </Tab>
        <Tab title="收入">
          {renderList(incomeTransactions, '收入')}
        </Tab>
      </Tabs>
    </View>
  );
}
