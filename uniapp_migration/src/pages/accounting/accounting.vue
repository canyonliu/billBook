<template>
  <CustomNavBar />
  <view class="container">
    <view class="tips-floating">
      <view class="tips-icon" @click="onToggleTips">
        <uni-icons :type="tipsVisible ? 'closeempty' : 'info'" size="20" color="#fff" />
      </view>
      <view v-if="tipsVisible" class="tips-panel" @click.stop="onHideTips">
        <view class="tips-panel-header">
          <text class="tips-title">小贴士</text>
          <uni-icons type="closeempty" size="18" color="#fff" />
        </view>
        <text class="tips-text">{{ tipsDisplay }}</text>
      </view>
    </view>

    <uni-segmented-control :current="activeTab" :values="['按日', '按月', '按年']" @clickItem="onTabChange" style-type="button" active-color="#6B59CC" class="segmented-control-wrapper" />

    <view class="content-area">
      <view v-show="activeTab === 0">
        <view class="sticky-top">
          <view class="sticky-header-container">
            <view class="date-selector" @click="onDisplayDatePicker">
              <text>{{ currentYear }}年{{ currentMonth }}月{{ currentDay }}日</text>
              <uni-icons type="arrow-down" size="16" color="#666" />
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
        </view>
        <TransactionList :groups="groupedTransactions" @edit="onEditTransaction" />
      </view>

      <view v-show="activeTab === 1">
        <view class="sticky-top">
          <view class="sticky-header-container">
            <view class="date-selector" @click="onDisplayDatePicker">
              <text>{{ currentYear }}年{{ currentMonth }}月</text>
              <uni-icons type="arrow-down" size="16" color="#666" />
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
        </view>
        <TransactionList :groups="groupedTransactions" @edit="onEditTransaction" />
      </view>

      <view v-show="activeTab === 2">
        <view class="sticky-top">
          <view class="sticky-header-container">
            <view class="date-selector" @click="onDisplayDatePicker">
              <text>{{ currentYear }}年</text>
              <uni-icons type="arrow-down" size="16" color="#666" />
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
        </view>
        <TransactionList :groups="groupedTransactions" @edit="onEditTransaction" />
      </view>
    </view>

    <!-- Add Transaction Button -->
    <button class="add-transaction-btn" @click="navigateToAddTransaction">
      <uni-icons type="plus" color="#fff" size="20" />
      <text>新增记账</text>
    </button>

    <!-- Date Picker Popup -->
    <uni-popup ref="datePickerPopup" type="bottom">
      <uni-datetime-picker
        :type="filterType === 'day' ? 'date' : 'month'"
        :value="currentDate"
        :start="minDate"
        :end="maxDate"
        @confirm="onPickerConfirm"
        @cancel="onCancelDatePicker"
        @maskClick="onCancelDatePicker"
        ref="datePickerRef"
      />
    </uni-popup>

    <!-- Year Picker Popup -->
    <uni-popup ref="yearPickerPopup" type="bottom">
      <view class="year-picker-container">
        <view class="year-picker-header">选择年份</view>
        <scroll-view scroll-y class="year-list">
          <view v-for="action in yearActions" :key="action.name" class="year-item" @click="onSelectYear(action)">
            {{ action.name }}
          </view>
        </scroll-view>
        <view class="year-picker-cancel" @click="onCloseYearActionSheet">取消</view>
      </view>
    </uni-popup>
    <GlobalSidebar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { onShow, onShareAppMessage } from '@dcloudio/uni-app';
import * as util from '../../utils/util';
import TransactionList from './components/TransactionList.vue';
import GlobalSidebar from '../../components/GlobalSidebar.vue';
import CustomNavBar from '../../components/CustomNavBar.vue';

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
const datePickerPopup = ref<any>(null);
const datePickerRef = ref<any>(null);
const minDate = new Date(2000, 0, 1).getTime();
const maxDate = now.getTime();
const yearPickerPopup = ref<any>(null);
const yearActions = computed(() => Array.from({ length: 30 }, (_, i) => ({ name: String(new Date().getFullYear() - i) })));


// --- Tips ---
const tipsVisible = ref(false);
const tipsContent = ref('');
const tipLoading = ref(false);
const tipsDisplay = computed(() => tipLoading.value ? '加载中...' : (tipsContent.value || '暂无提示'));
let tipTimer: ReturnType<typeof setTimeout> | null = null;
const TIPS_API = `${import.meta.env.VITE_APP_API_HOST}/api/xcx/tips`;

// const formatter = (type: string, value: string) => {
//   if (type === 'year') return `${value}年`;
//   if (type === 'month') return `${value}月`;
//   if (type === 'day') return `${value}日`;
//   return value;
// };

// --- Icon Mapping ---
const iconMap: { [key: string]: string } = {
  '餐饮': 'shop',
  '交通': 'paperplane',
  '购物': 'cart',
  '娱乐': 'gift',
  '住房': 'home',
  '学习': 'book',
  '工资': 'wallet',
  '理财': 'medal',
  'default': 'info',
};

// --- Lifecycle ---
onShow(() => {
  loadTransactions();
});

onUnmounted(() => {
  clearTipTimer();
});

// Share hook for WeChat Mini Program
onShareAppMessage((res: any) => {
  return {
    title: 'canyonliu功能集 - 轻松管理你的财务', // Customize share title
    path: '/pages/accounting/accounting', // Path to the current page
    imageUrl: '/static/logo.png' // Path to a share image (e.g., your app's logo)
  };
});

// --- Methods ---
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
  const index = event.currentIndex;
  let fType = 'day';
  if (index === 1) fType = 'month';
  else if (index === 2) fType = 'year';
  
  filterType.value = fType;
  activeTab.value = index;
  
  const newDate = new Date();
  currentDate.value = newDate.getTime();
  currentYear.value = newDate.getFullYear();
  currentMonth.value = newDate.getMonth() + 1;
  currentDay.value = newDate.getDate();
  
  calculateTotals();
};

const onDisplayDatePicker = () => {
  if (filterType.value === 'year') {
    yearPickerPopup.value.open();
  } else {
    datePickerPopup.value.open();
  }
};

const onCloseYearActionSheet = () => {
  yearPickerPopup.value.close();
};

const onSelectYear = (action: any) => {
  const selectedYear = action.name;
  const yearNumber = Number(selectedYear);
  const selectedDate = new Date(yearNumber, 0, 1);
  currentDate.value = selectedDate.getTime();
  currentYear.value = yearNumber;
  yearPickerPopup.value.close();
  calculateTotals();
};

const onPickerConfirm = (e: any) => {
  const selectedDate = new Date(e);
  datePickerPopup.value.close();
  currentDate.value = selectedDate.getTime();
  currentYear.value = selectedDate.getFullYear();
  currentMonth.value = selectedDate.getMonth() + 1;
  currentDay.value = selectedDate.getDate();
  calculateTotals();
};

const onCancelDatePicker = () => {
  datePickerPopup.value.close();
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

const onOpenSidebar = () => {
  uni.$emit('open-sidebar');
};

const clearTipTimer = () => {
  if (tipTimer) {
    clearTimeout(tipTimer);
    tipTimer = null;
  }
};

const startTipAutoHide = () => {
  clearTipTimer();
  tipTimer = setTimeout(() => {
    onHideTips();
  }, 3000);
};

const fetchTips = () => new Promise<void>((resolve) => {
  tipLoading.value = true;
  uni.request({
    url: TIPS_API,
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      const anyRes: any = res;
      const tip = anyRes?.data?.data?.tip;
      tipsContent.value = typeof tip === 'string' && tip ? tip : '暂无提示';
    },
    fail: () => {
      tipsContent.value = '网络异常，请稍后重试';
    },
    complete: () => {
      tipLoading.value = false;
      resolve();
    }
  });
});

const onHideTips = () => {
  clearTipTimer();
  tipsVisible.value = false;
};

const onToggleTips = async () => {
  if (tipsVisible.value) {
    onHideTips();
    return;
  }
  tipsVisible.value = true;
  await fetchTips();
  if (tipsVisible.value) {
    startTipAutoHide();
  }
};
</script>

<style>
/* pages/accounting/accounting.wxss */
.container {
  padding: 160rpx 0 0 0;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.segmented-control-wrapper {
  width: 100%;
  margin: 0 auto 20rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.tips-floating {
  position: fixed;
  bottom: 220rpx;
  right: 20rpx;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  opacity: .5;
}

.tips-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(107, 89, 204, 0.85);
  box-shadow: 0 8rpx 20rpx rgba(107, 89, 204, 0.25);
}

.tips-panel {
  margin-top: 12rpx;
  max-width: 420rpx;
  background-color: rgba(36, 34, 60, 0.9);
  color: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.15);
}

.tips-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
}

.tips-text {
  font-size: 26rpx;
  line-height: 1.5;
  opacity: 0.9;
}

:deep(.segmented-control) {
  width: 100%;
}

:deep(.segmented-control__item) {
  flex: 1 1 auto;
  min-width: 0;
}

:deep(.segmented-control__text) {
  font-size: 30rpx;
  white-space: nowrap;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.sticky-header-container {
  padding: 0 20rpx 0 20rpx;
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

.year-picker-container {
  background-color: #fff;
  border-radius: 16rpx 16rpx 0 0;
}

.year-picker-header {
  padding: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.year-list {
  height: 50vh;
  max-height: 600rpx;
}

.year-item {
  padding: 30rpx;
  font-size: 32rpx;
  text-align: center;
}

.year-item:active {
  background-color: #f5f5f5;
}

.year-picker-cancel {
  padding: 30rpx;
  font-size: 32rpx;
  text-align: center;
  border-top: 10rpx solid #f7f8fa;
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
