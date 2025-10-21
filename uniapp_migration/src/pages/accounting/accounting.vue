<template>
  <view class="container">
    <van-tabs :active="activeTab" @change="onTabChange" sticky>
      <van-tab title="按日">
        <van-sticky>
          <view class="sticky-header-container">
            <view class="date-selector" @click="onDisplayDatePicker">
              <text>{{ currentYear }}年{{ currentMonth }}月{{ currentDay }}日</text>
              <van-icon name="arrow-down" size="16px" color="#666" />
            </view>
            <view class="totals-card" @click="navigateToDetails">
              <view class="total-item">
                <text class="label">日收入</text>
                <text class="value income">+{{ totalIncome }}</text>
              </view>
              <view class="total-item">
                <text class="label">日支出</text>
                <text class="value expense">-{{ totalExpense }}</text>
              </view>
            </view>
          </view>
        </van-sticky>
        <TransactionList :groups="groupedTransactions" @edit="onEditTransaction" />
      </van-tab>
      <van-tab title="按月">
        <van-sticky>
          <view class="sticky-header-container">
            <view class="date-selector" @click="onDisplayDatePicker">
              <text>{{ currentYear }}年{{ currentMonth }}月</text>
              <van-icon name="arrow-down" size="16px" color="#666" />
            </view>
            <view class="totals-card" @click="navigateToDetails">
              <view class="total-item">
                <text class="label">月收入</text>
                <text class="value income">+{{ totalIncome }}</text>
              </view>
              <view class="total-item">
                <text class="label">月支出</text>
                <text class="value expense">-{{ totalExpense }}</text>
              </view>
            </view>
          </view>
        </van-sticky>
        <TransactionList :groups="groupedTransactions" @edit="onEditTransaction" />
      </van-tab>
      <van-tab title="按年">
        <van-sticky>
          <view class="sticky-header-container">
            <view class="date-selector" @click="onDisplayDatePicker">
              <text>{{ currentYear }}年</text>
              <van-icon name="arrow-down" size="16px" color="#666" />
            </view>
            <view class="totals-card" @click="navigateToDetails">
              <view class="total-item">
                <text class="label">年收入</text>
                <text class="value income">+{{ totalIncome }}</text>
              </view>
              <view class="total-item">
                <text class="label">年支出</text>
                <text class="value expense">-{{ totalExpense }}</text>
              </view>
            </view>
          </view>
        </van-sticky>
        <TransactionList :groups="groupedTransactions" @edit="onEditTransaction" />
      </van-tab>
    </van-tabs>

    <!-- Add Transaction Button -->
    <button class="add-transaction-btn" @click="navigateToAddTransaction">
      <van-icon name="plus" color="#fff" size="20px" />
      <text>新增记账</text>
    </button>

    <!-- Date Picker Popup -->
    <van-popup :show="showDatePicker" position="bottom" @close="onCloseDatePicker">
      <van-datetime-picker
        :type="filterType === 'day' ? 'date' : 'year-month'"
        :value="currentDate"
        :min-date="minDate"
        :max-date="maxDate"
        :formatter="formatter"
        @confirm="onPickerConfirm"
        @cancel="onCancelDatePicker"
      />
    </van-popup>

    <!-- Year Picker Action Sheet -->
    <van-action-sheet
      :show="showYearActionSheet"
      :actions="yearActions"
      title="选择年份"
      @close="onCloseYearActionSheet"
      @select="onSelectYear"
      @cancel="onCloseYearActionSheet"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import * as util from '../../utils/util';
import TransactionList from './components/TransactionList.vue';

// --- Data --- 
const activeTab = ref(0);
const filterType = ref('day'); // 'day', 'month', or 'year'
const totalIncome = ref(0);
const totalExpense = ref(0);
const transactions = ref<any[]>([]);
const groupedTransactions = ref<any[]>([]);

// --- Date Related Data ---
const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth() + 1);
const currentDay = ref(now.getDate());
const currentDate = ref(now.getTime());

// --- Picker Related Data ---
const showDatePicker = ref(false);
const minDate = new Date(2000, 0, 1).getTime();
const maxDate = now.getTime();
const showYearActionSheet = ref(false);
const yearActions = computed(() => Array.from({ length: 30 }, (_, i) => ({ name: String(new Date().getFullYear() - i) })));

const formatter = (type: string, value: string) => {
  if (type === 'year') return `${value}年`;
  if (type === 'month') return `${value}月`;
  if (type === 'day') return `${value}日`;
  return value;
};

// --- Icon Mapping ---
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

// --- Methods ---
onShow(() => {
  loadTransactions();
});

const loadTransactions = () => {
  const allData = util.loadData();
  transactions.value = allData.transactions || [];
  calculateTotals();
};

const formatDate = (date: any) => {
  const d = new Date(date);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

const formatDateTimeForList = (date: any, fType: string) => {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  if (fType === 'day') return `${hours}:${minutes}`;
  return `${month}-${day} ${hours}:${minutes}`;
};

const groupAndProcessTransactions = (trans: any[], fType: string) => {
  if (!trans.length) return [];

  const getIcon = (tags: any[]) => {
    if (!tags || !tags.length) return iconMap.default;
    const foundTag = tags.find(tag => iconMap[tag]);
    return foundTag ? iconMap[foundTag] : iconMap.default;
  };

  const processed = trans.map(t => {
    const tagObjects = (t.tags || []).map((tag: any) => {
      const tagName = (typeof tag === 'object' && tag !== null) ? tag.text || tag.id : tag;
      return {
        name: tagName,
        icon: iconMap[tagName] || iconMap.default
      };
    });

    return {
      ...t,
      displayText: formatDateTimeForList(t.date, fType),
      icon: getIcon(t.tags),
      tagObjects: tagObjects
    };
  });

  const groups = processed.reduce((acc: any, t: any) => {
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

  return Object.values(groups).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const calculateTotals = () => {
  const filterDate = new Date(currentDate.value);
  
  let periodIncome = 0;
  let periodExpense = 0;

  const filtered = transactions.value.filter(t => {
    const tDate = new Date(t.date);
    if (filterType.value === 'year') return tDate.getFullYear() === filterDate.getFullYear();
    if (filterType.value === 'month') return tDate.getFullYear() === filterDate.getFullYear() && tDate.getMonth() === filterDate.getMonth();
    if (filterType.value === 'day') return formatDate(tDate) === formatDate(filterDate);
    return false;
  });

  filtered.forEach(t => {
    if (t.type === 'income') {
      periodIncome += t.amount;
    } else {
      periodExpense += t.amount;
    }
  });

  totalIncome.value = periodIncome;
  totalExpense.value = periodExpense;
  groupedTransactions.value = groupAndProcessTransactions(filtered, filterType.value);
};

const onTabChange = (event: any) => {
  let fType = 'day';
  if (event.detail.name === 1) fType = 'month';
  else if (event.detail.name === 2) fType = 'year';
  
  filterType.value = fType;
  activeTab.value = event.detail.name;
  
  const newDate = new Date();
  currentDate.value = newDate.getTime();
  currentYear.value = newDate.getFullYear();
  currentMonth.value = newDate.getMonth() + 1;
  currentDay.value = newDate.getDate();
  
  calculateTotals();
};

const onDisplayDatePicker = () => {
  if (filterType.value === 'year') {
    showYearActionSheet.value = true;
  } else {
    showDatePicker.value = true;
  }
};

const onCloseDatePicker = () => {
  showDatePicker.value = false;
};

const onCloseYearActionSheet = () => {
  showYearActionSheet.value = false;
};

const onSelectYear = (event: any) => {
  const selectedYear = event.detail.name;
  const selectedDate = new Date(selectedYear, 0, 1);
  currentDate.value = selectedDate.getTime();
  currentYear.value = selectedYear;
  calculateTotals();
};

const onPickerConfirm = (event: any) => {
  const selectedDate = new Date(event.detail);
  showDatePicker.value = false;
  currentDate.value = selectedDate.getTime();
  currentYear.value = selectedDate.getFullYear();
  currentMonth.value = selectedDate.getMonth() + 1;
  currentDay.value = selectedDate.getDate();
  calculateTotals();
};

const onCancelDatePicker = () => {
  showDatePicker.value = false;
};

const navigateToAddTransaction = () => {
  uni.navigateTo({ url: '../addTransaction/addTransaction' });
};

const onEditTransaction = (id: string) => {
  uni.navigateTo({ url: `../addTransaction/addTransaction?id=${id}` });
};

const navigateToDetails = () => {
  const url = `../transactionDetail/transactionDetail?year=${currentYear.value}&month=${currentMonth.value}&day=${currentDay.value}&filterType=${filterType.value}`;
  uni.navigateTo({ url });
};

</script>

<style>
/* pages/accounting/accounting.wxss */
.container {
  padding: 0;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.sticky-header-container {
  padding: 20rpx 20rpx 0 20rpx;
  background-color: #f7f8fa;
}

.date-selector {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  margin-bottom: 30rpx;
}

.totals-card {
  background-color: #6B59CC;
  padding: 40rpx;
  border-radius: 16rpx;
  color: white;
  text-align: center;
  box-shadow: 0 8rpx 25rpx rgba(107, 89, 204, 0.45);
  margin-bottom: 30rpx;
}

.total-item {
  margin-bottom: 20rpx;
}

.total-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 28rpx;
  opacity: 0.8;
  display: block;
}

.value {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-top: 10rpx;
}

.value.expense {
  color: #ffda47;
}

.value.income {
  color: #a7e9af;
}

.add-transaction-btn {
  position: fixed;
  bottom: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600rpx;
  height: 96rpx;
  background-color: #2ecc71;
  color: white;
  border-radius: 48rpx;
  font-size: 32rpx;
  box-shadow: 0 8rpx 25rpx rgba(46, 204, 113, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-transaction-btn .van-icon {
  margin-right: 15rpx;
}
</style>
