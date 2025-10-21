<template>
  <view class="container">
    <van-tabs :active="activeTab" @change="onTabChange" sticky tab-class="detail-tab" nav-class="fixed-width-nav" custom-class="full-width-tabs">
      <van-tab title="支出">
        <view class="list-container" v-if="expenseTransactions.length > 0">
          <view v-for="item in expenseTransactions" :key="item.id" class="transaction-card" @click="onEditTransaction(item.id)">
            <van-icon :name="item.icon" size="24px" class="card-icon" />
            <view class="card-content">
              <text class="description">{{ item.description || '无描述' }}</text>
              <view class="tags-and-time">
                <van-tag plain type="primary" v-for="tag in item.tags" :key="tag">{{ tag }}</van-tag>
                <van-tag plain type="default" custom-class="time-tag">{{ item.displayText }}</van-tag>
              </view>
            </view>
            <text class="card-amount expense">-{{ item.amount }}</text>
          </view>
        </view>
        <van-empty v-else description="暂无支出记录" />
      </van-tab>
      <van-tab title="收入">
        <view class="list-container" v-if="incomeTransactions.length > 0">
          <view v-for="item in incomeTransactions" :key="item.id" class="transaction-card" @click="onEditTransaction(item.id)">
            <van-icon :name="item.icon" size="24px" class="card-icon" />
            <view class="card-content">
              <text class="description">{{ item.description || '无描述' }}</text>
              <view class="tags-and-time">
                <van-tag plain type="primary" v-for="tag in item.tags" :key="tag">{{ tag }}</van-tag>
                <van-tag plain type="default" custom-class="time-tag">{{ item.displayText }}</van-tag>
              </view>
            </view>
            <text class="card-amount income">+{{ item.amount }}</text>
          </view>
        </view>
        <van-empty v-else description="暂无收入记录" />
      </van-tab>
    </van-tabs>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as util from '../../utils/util';

const activeTab = ref(0);
const incomeTransactions = ref<any[]>([]);
const expenseTransactions = ref<any[]>([]);

const iconMap: { [key: string]: string } = {
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

const onTabChange = (event: any) => {
  activeTab.value = event.detail.name;
};

const onEditTransaction = (id: string) => {
  uni.navigateTo({ url: `../addTransaction/addTransaction?id=${id}` });
};
</script>

<style>
/* pages/transactionDetail/transactionDetail.wxss */
.container {
  height: 100vh;
  background-color: #f7f8fa;
}

.full-width-tabs {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
}

.fixed-width-nav .van-tab {
  flex: 1 !important;
  text-align: center;
}

.list-container {
  padding: 20rpx;
}

.transaction-card {
  display: flex;
  align-items: flex-start; /* Align to top */
  background-color: #fff;
  padding: 25rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.card-icon {
  margin-right: 25rpx;
  padding: 20rpx;
  background-color: #f2f3f7;
  border-radius: 50%;
  color: #6B59CC;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Important for flex wrapping */
}

.description {
  font-size: 30rpx;
  color: #323233;
  margin-bottom: 15rpx; /* Increased margin for separation */
  white-space: normal; /* Allow wrapping */
  word-break: break-all;
  display: block; /* Ensure it takes its own line */
}

.tags-and-time {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.time-tag {
  background-color: #f2f3f5 !important;
  color: #969799 !important;
}

.card-amount {
  font-size: 34rpx;
  font-weight: bold;
  margin-left: 20rpx; /* Add space */
}

.income {
  color: #2ecc71;
}

.expense {
  color: #e74c3c;
}

.van-empty {
  padding-top: 100rpx;
}
</style>
