<template>
  <view class="container">
    <view class="segmented-control-container">
      <uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" styleType="button" activeColor="#6B59CC"></uni-segmented-control>
    </view>

    <view class="content">
      <view v-if="current === 0">
        <view class="list-container" v-if="expenseTransactions.length > 0">
          <view v-for="item in expenseTransactions" :key="item.id" class="transaction-card" @click="onEditTransaction(item.id)">
            <view class="card-icon-wrapper">
              <uni-icons :type="item.icon" size="24" color="#6B59CC"></uni-icons>
            </view>
            <view class="card-content">
              <text class="description">{{ item.description || '无描述' }}</text>
              <view class="tags-and-time">
                <uni-tag :text="tag" type="primary" size="small" v-for="tag in item.tags" :key="tag"></uni-tag>
                <uni-tag :text="item.displayText" type="default" size="small"></uni-tag>
              </view>
            </view>
            <text class="card-amount expense">-{{ item.amount }}</text>
          </view>
        </view>
        <view v-else class="empty-state">
          <uni-icons type="folder-add" size="50" color="#bdc3c7"></uni-icons>
          <text class="empty-text">暂无支出记录</text>
        </view>
      </view>
      <view v-if="current === 1">
        <view class="list-container" v-if="incomeTransactions.length > 0">
          <view v-for="item in incomeTransactions" :key="item.id" class="transaction-card" @click="onEditTransaction(item.id)">
            <view class="card-icon-wrapper">
              <uni-icons :type="item.icon" size="24" color="#6B59CC"></uni-icons>
            </view>
            <view class="card-content">
              <text class="description">{{ item.description || '无描述' }}</text>
              <view class="tags-and-time">
                <uni-tag :text="tag" type="primary" size="small" v-for="tag in item.tags" :key="tag"></uni-tag>
                <uni-tag :text="item.displayText" type="default" size="small"></uni-tag>
              </view>
            </view>
            <text class="card-amount income">+{{ item.amount }}</text>
          </view>
        </view>
        <view v-else class="empty-state">
          <uni-icons type="folder-add" size="50" color="#bdc3c7"></uni-icons>
          <text class="empty-text">暂无收入记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as util from '../../utils/util';

const current = ref(0);
const items = ref(['支出', '收入']);
const incomeTransactions = ref<any[]>([]);
const expenseTransactions = ref<any[]>([]);

const iconMap: { [key: string]: string } = {
  '餐饮': 'food',
  '交通': 'paperplane',
  '购物': 'cart',
  '娱乐': 'game-controller',
  '住房': 'home',
  '学习': 'book',
  '工资': 'wallet',
  '理财': 'medal',
  'default': 'pricetag',
};

const getIcon = (tags: any[]) => {
  if (!tags || !tags.length) return iconMap.default;
  const foundTag = tags.find(tag => iconMap[tag]);
  return foundTag ? iconMap[foundTag] : iconMap.default;
};

const formatDateTimeForList = (date: any, filterType: string) => {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  if (filterType === 'day') return `${hours}:${minutes}`;
  return `${month}-${day} ${hours}:${minutes}`;
};

onLoad((options: any) => {
  const { year, month, day, filterType } = options;
  const allData = util.loadData();
  const transactions = allData.transactions || [];

  const filtered = transactions.filter((t: any) => {
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

  const formatted = filtered.map((t: any) => ({
    ...t,
    displayText: formatDateTimeForList(t.date, filterType),
    icon: getIcon(t.tags),
  }));

  incomeTransactions.value = formatted.filter((t: any) => t.type === 'income');
  expenseTransactions.value = formatted.filter((t: any) => t.type === 'expense');

  let title = '账单详情';
  if (filterType === 'year') title = `${year}年账单`;
  else if (filterType === 'month') title = `${year}年${month}月账单`;
  else if (filterType === 'day') title = `${year}年${month}月${day}日账单`;
  uni.setNavigationBarTitle({ title });
});

const onClickItem = (e: any) => {
  if (current.value !== e.currentIndex) {
    current.value = e.currentIndex;
  }
};

const onEditTransaction = (id: string) => {
  uni.navigateTo({ url: `../addTransaction/addTransaction?id=${id}` });
};
</script>

<style>
/* pages/transactionDetail/transactionDetail.wxss */
.container {
  padding: 0;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.segmented-control-container {
  padding: 20rpx;
  background-color: #fff;
}

.content {
  margin-top: 20rpx;
}

.list-container {
  padding: 0 20rpx;
}

.transaction-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 25rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.card-icon-wrapper {
  margin-right: 25rpx;
  padding: 20rpx;
  background-color: #f2f3f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.description {
  font-size: 30rpx;
  color: #323233;
  margin-bottom: 15rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-and-time {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.card-amount {
  font-size: 34rpx;
  font-weight: bold;
  margin-left: 20rpx;
}

.income {
  color: #2ecc71;
}

.expense {
  color: #e74c3c;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
  color: #999;
}

.empty-text {
  font-size: 28rpx;
  margin-top: 20rpx;
}
</style>
