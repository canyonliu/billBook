<template>
  <view class="container">
    <view class="form-group">
      <uni-data-checkbox v-model="type" :localdata="typeOptions" />
    </view>

    <view class="form-group amount-group">
      <text class="currency-symbol">¥</text>
      <uni-easyinput
        v-model="amount"
        type="digit"
        placeholder="0.00"
        :inputBorder="false"
        primaryColor="#6B59CC"
        :styles="{ color: '#333', fontSize: '36px', fontWeight: 'bold' }"
      />
    </view>

    <uni-list :border="false">
      <uni-list-item :border="false">
        <template v-slot:body>
          <uni-easyinput
            v-model="description"
            type="textarea"
            placeholder="点击输入描述 (可选)"
            :inputBorder="false"
          />
        </template>
      </uni-list-item>
      <uni-list-item title="日期" showArrow :right-text="formattedDate" @click="openDatePicker" />
      <uni-list-item title="标签" showArrow :right-text="selectedTagNames" @click="openTagPicker" />
    </uni-list>

    <view class="button-wrapper">
      <button class="save-btn" @click="onSave">保 存</button>
    </view>

    <!-- Date Picker -->
    <uni-datetime-picker ref="datePicker" type="datetime" :value="transactionDate" @confirm="onConfirmDatePicker" />

    <!-- Tag Picker -->
    <uni-data-picker ref="tagPicker" :localdata="tagTree" popup-title="选择标签" v-model="activeTagIds" multiple :map="{text: 'text', value: 'value'}" @change="onTagChange" />

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
const transactionDate = ref(Date.now());
const transactionId = ref<string | null>(null);
const isEditMode = ref(false);

const typeOptions = ref([{"value": "expense", "text": "支出"}, {"value": "income", "text": "收入"}]);

// --- Picker Refs ---
const datePicker = ref<any>(null);
const tagPicker = ref<any>(null);

// --- Tag Data ---
const activeTagIds = ref<string[]>([]);
const tagTree = ref([
  {
    text: '生活',
    value: 'cat-1',
    children: [
      { value: '餐饮', text: '餐饮' },
      { value: '购物', text: '购物' },
      { value: '交通', text: '交通' },
      { value: '娱乐', text: '娱乐' },
      { value: '住房', text: '住房' },
      { value: '学习', text: '学习' },
    ],
  },
  {
    text: '理财',
    value: 'cat-2',
    children: [
      { value: '工资', text: '工资' },
      { value: '理财', text: '理财' },
    ],
  },
]);

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
  return activeTagIds.value.join(', ');
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
const openDatePicker = () => {
  datePicker.value.open();
};

const openTagPicker = () => {
  tagPicker.value.show();
};

const onConfirmDatePicker = (e: any) => {
  transactionDate.value = new Date(e).getTime();
};

const onTagChange = (e: any) => {
  activeTagIds.value = e.detail.value.map((item: any) => item.value);
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
  padding: 10rpx 30rpx;
}

.currency-symbol {
  font-size: 50rpx;
  font-weight: bold;
  margin-right: 20rpx;
  color: #333;
}

.button-wrapper {
  position: fixed;
  bottom: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  z-index: 100;
}

.save-btn {
  width: 100%;
  height: 96rpx;
  background-color: #6B59CC;
  color: white;
  border-radius: 48rpx;
  font-size: 32rpx;
  box-shadow: 0 8rpx 25rpx rgba(107, 89, 204, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>