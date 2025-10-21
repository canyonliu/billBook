<template>
  <view class="container">
    <view class="form-group">
      <van-radio-group :value="type" @change="onTypeChange" direction="horizontal">
        <van-radio name="expense">支出</van-radio>
        <van-radio name="income">收入</van-radio>
      </van-radio-group>
    </view>

    <view class="form-group amount-group">
      <text class="currency-symbol">¥</text>
      <van-field
        :value="amount"
        type="digit"
        placeholder="0.00"
        @input="onAmountChange"
        input-class="amount-input"
        :border="false"
      />
    </view>

    <van-cell-group inset>
      <van-field
        :value="description"
        label="描述"
        placeholder="点击输入描述 (可选)"
        @input="onDescriptionChange"
      />
      <van-cell title="日期" is-link :value="formattedDate" @click="onDisplayDatePicker" />
      <van-cell title="标签" is-link :value="selectedTagNames" @click="onShowTagSelector" />
    </van-cell-group>

    <view class="button-wrapper">
      <van-button type="primary" block round @click="onSave">保 存</van-button>
    </view>

    <!-- Date Picker Popup -->
    <van-popup :show="showDatePicker" position="bottom" @close="onCloseDatePicker">
      <van-datetime-picker
        type="datetime"
        :value="transactionDate"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onConfirmDatePicker"
        @cancel="onCancelDatePicker"
      />
    </van-popup>

    <!-- Tag Selector Popup -->
    <van-popup :show="showTagSelector" position="bottom" @close="onCloseTagSelector" custom-style="height: 70%;">
      <van-tree-select
        :items="categorizedTags"
        :main-active-index="mainActiveIndex"
        :active-id="activeTagIds"
        max="5"
        @click-nav="onClickNav"
        @click-item="onSelectTagItem"
      />
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as util from '../../utils/util';

// --- Reactive Data ---
const type = ref('expense');
const amount = ref('');
const description = ref('');
const transactionDate = ref(new Date().getTime());
const transactionId = ref<string | null>(null);
const isEditMode = ref(false);

const categorizedTags = ref([
  {
    text: '生活',
    children: [
      { id: '餐饮', text: '餐饮', icon: 'food-o' },
      { id: '购物', text: '购物', icon: 'shopping-cart-o' },
      { id: '交通', text: '交通', icon: 'logistics' },
      { id: '娱乐', text: '娱乐', icon: 'smile-o' },
      { id: '住房', text: '住房', icon: 'wap-home-o' },
      { id: '学习', text: '学习', icon: 'notes-o' },
    ],
  },
  {
    text: '理财',
    children: [
      { id: '工资', text: '工资', icon: 'gold-coin-o' },
      { id: '理财', text: '理财', icon: 'balance-o' },
    ],
  },
]);
const mainActiveIndex = ref(0);
const activeTagIds = ref<string[]>([]);
const showTagSelector = ref(false);
const showDatePicker = ref(false);
const minDate = new Date(2000, 0, 1).getTime();
const maxDate = new Date().getTime();

// --- Computed Properties ---
const formattedDate = computed(() => {
  const d = new Date(transactionDate.value);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
});

const selectedTagNames = computed(() => {
  const selectedNames: string[] = [];
  categorizedTags.value.forEach(category => {
    category.children.forEach(tag => {
      if (activeTagIds.value.includes(tag.id)) {
        selectedNames.push(tag.text);
      }
    });
  });
  return selectedNames.join(', ');
});

// --- Lifecycle Hooks ---
onLoad((options: any) => {
  if (options.id) {
    const allData = util.loadData();
    const transaction = allData.transactions.find((t: any) => t.id === options.id);
    if (transaction) {
      transactionId.value = transaction.id;
      isEditMode.value = true;
      type.value = transaction.type;
      amount.value = transaction.amount.toString();
      description.value = transaction.description;
      activeTagIds.value = transaction.tags;
      transactionDate.value = transaction.date;
      uni.setNavigationBarTitle({ title: '编辑记账' });
    } else {
      uni.showToast({ title: '交易不存在', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  } else {
    uni.setNavigationBarTitle({ title: '新增记账' });
  }
});

// --- Methods ---
const onTypeChange = (event: any) => {
  type.value = event.detail;
};

const onAmountChange = (event: any) => {
  amount.value = event.detail;
};

const onDescriptionChange = (event: any) => {
  description.value = event.detail;
};

const onShowTagSelector = () => {
  showTagSelector.value = true;
};

const onCloseTagSelector = () => {
  showTagSelector.value = false;
};

const onClickNav = (event: any) => {
  mainActiveIndex.value = event.detail.index || 0;
};

const onSelectTagItem = (event: any) => {
  const { id } = event.detail;
  const index = activeTagIds.value.indexOf(id);
  if (index > -1) {
    activeTagIds.value.splice(index, 1);
  } else {
    activeTagIds.value.push(id);
  }
};

const onDisplayDatePicker = () => {
  showDatePicker.value = true;
};

const onCloseDatePicker = () => {
  showDatePicker.value = false;
};

const onConfirmDatePicker = (event: any) => {
  transactionDate.value = event.detail;
  showDatePicker.value = false;
};

const onCancelDatePicker = () => {
  showDatePicker.value = false;
};

const onSave = () => {
  if (!amount.value || isNaN(parseFloat(amount.value)) || parseFloat(amount.value) <= 0) {
    uni.showToast({ title: '请输入有效的金额', icon: 'none' });
    return;
  }

  const allData = util.loadData();
  if (!allData.transactions) {
    allData.transactions = [];
  }

  const newTransaction = {
    id: isEditMode.value ? transactionId.value : util.generateId(),
    type: type.value,
    amount: parseFloat(amount.value),
    description: description.value,
    tags: activeTagIds.value,
    date: transactionDate.value,
  };

  if (isEditMode.value) {
    const index = allData.transactions.findIndex((t: any) => t.id === transactionId.value);
    if (index !== -1) {
      allData.transactions[index] = newTransaction;
    }
  } else {
    allData.transactions.unshift(newTransaction);
  }
  
  util.saveData(allData);

  uni.showToast({ title: '保存成功', icon: 'success' });
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};
</script>

<style>
/* pages/addTransaction/addTransaction.wxss */
.container {
  padding: 30rpx;
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 160rpx; /* Space for button */
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 30rpx;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.04);
}

.amount-group {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
}

.currency-symbol {
  font-size: 50rpx;
  font-weight: bold;
  margin-right: 20rpx;
  color: #333;
}

.amount-input {
  font-size: 72rpx !important;
  font-weight: bold !important;
  height: 100rpx !important;
  flex-grow: 1;
  color: #333;
}

.van-cell-group--inset {
  margin: 0 !important;
}

.van-radio--horizontal {
  margin-right: 40rpx;
}

.button-wrapper {
  position: fixed;
  bottom: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  z-index: 100;
}
</style>
