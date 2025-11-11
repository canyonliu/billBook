<template>
  <view class="container">
    <!-- 类型切换 -->
    <view class="form-group type-switch">
      <uni-data-checkbox v-model="type" :localdata="typeOptions" />
    </view>

    <!-- 金额输入 -->
    <view class="form-group amount-group">
      <text class="currency-symbol">¥</text>
      <uni-easyinput
        v-model="amount"
        type="digit"
        placeholder="0.00"
        :inputBorder="false"
        primaryColor="#6B59CC"
        :styles="{ color: '#333', fontSize: '40px', fontWeight: 'bold' }"
      />
    </view>

    <!-- 描述输入 -->
    <view class="form-group">
      <view class="row-left" style="margin-bottom: 16rpx;">
        <uni-icons type="compose" size="22" color="#6B59CC" />
        <text class="row-title">备注</text>
      </view>
      <uni-easyinput
        v-model="description"
        type="textarea"
        placeholder="例如：早餐、出行等（可选）"
        :inputBorder="false"
        :styles="{minHeight: '100px'}"
      />
    </view>

    <!-- 日期选择：将展示与触发整合到同一行，点击直接唤起 -->
    <view class="form-group row-item" @click="openDatePicker">
      <view class="row-left">
        <uni-icons type="calendar" size="22" color="#6B59CC" />
        <text class="row-title">日期时间</text>
      </view>
      <view class="row-right">
        <text class="row-value">{{ formattedDate }}</text>
        <uni-icons type="arrow-right" size="18" color="#bbb" />
      </view>
    </view>
    <uni-popup ref="datePickerPopup" type="bottom">
      <uni-datetime-picker
        ref="datePicker"
        type="datetime"
        :value="transactionDate"
        :clearIcon="false"
        :border="false"
        @confirm="onConfirmDatePicker"
        @maskClick="closeDatePicker"
        @cancel="closeDatePicker"
      />
    </uni-popup>

    <!-- 标签选择：自定义面板，图标化 -->
    <view class="form-group row-item tag-row" @click="openTagPicker">
      <view class="row-left">
        <uni-icons type="label" size="22" color="#6B59CC" />
        <text class="row-title">标签</text>
      </view>
      <view class="row-right">
        <scroll-view scroll-x class="tag-preview">
          <view v-if="activeTagIds.length === 0" class="tag-placeholder">未选择</view>
          <view v-else class="tag-preview-inner">
            <view v-for="t in activeTagIds" :key="t" class="tag-chip">
              <uni-icons :type="iconMap[t] || iconMap.default" size="16" color="#6B59CC" />
              <text class="chip-text">{{ t }}</text>
            </view>
          </view>
        </scroll-view>
        <uni-icons type="arrow-right" size="18" color="#bbb" />
      </view>
    </view>

    <!-- 标签弹层 -->
    <uni-popup ref="tagPopup" type="bottom">
      <view class="tag-popup">
        <view class="tag-popup-header">
          <text class="popup-title">选择标签</text>
          <text class="popup-sub">可多选</text>
        </view>
        <scroll-view scroll-y class="tag-popup-body">
          <view v-for="group in displayTagGroups" :key="group.value" class="tag-group">
            <text class="group-title">{{ group.text }}</text>
            <view class="tag-grid">
              <view
                v-for="item in group.children"
                :key="item.value"
                class="tag-grid-item"
                :class="{ active: activeTagIds.includes(item.value) }"
                @click="toggleTag(item.value)"
              >
                <view class="tag-icon-wrap">
                  <uni-icons :type="iconMap[item.value] || iconMap.default" size="24" color="#6B59CC" />
                </view>
                <text class="tag-text">{{ item.text }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="tag-popup-footer">
          <button class="btn-cancel" @click="closeTagPopup">取 消</button>
          <button class="btn-ok" @click="confirmTagSelection">完 成</button>
        </view>
      </view>
    </uni-popup>

    <view class="button-wrapper">
      <button class="save-btn" @click="onSave">保 存</button>
    </view>
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
const datePickerPopup = ref<any>(null);
const datePicker = ref<any>(null);
const tagPopup = ref<any>(null);

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

// 展示组（便于样式渲染）
const displayTagGroups = computed(() => tagTree.value);

// 图标映射（与记账本首页保持一致风格）
const iconMap: { [key: string]: string } = {
  '餐饮': 'food',
  '交通': 'paperplane',
  '购物': 'cart',
  '娱乐': 'game-controller',
  '住房': 'home',
  '学习': 'book',
  '工资': 'wallet',
  '理财': 'medal',
  'default': 'label'
};

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

const selectedTagNames = computed(() => activeTagIds.value.join(', '));

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
  datePickerPopup.value?.open('bottom');
  // 延迟到弹层展开后再 show，避免小程序端初始化竞态
  setTimeout(() => {
    if (typeof datePicker.value?.show === 'function') {
      datePicker.value.show();
    }
  }, 0);
};

const closeDatePicker = () => {
  datePickerPopup.value?.close();
};

const openTagPicker = () => {
  tagPopup.value.open();
};

const onConfirmDatePicker = (e: any) => {
  transactionDate.value = new Date(e).getTime();
};

const toggleTag = (val: string) => {
  const idx = activeTagIds.value.indexOf(val);
  if (idx > -1) {
    activeTagIds.value.splice(idx, 1);
  } else {
    activeTagIds.value.push(val);
  }
};

const closeTagPopup = () => {
  tagPopup.value.close();
};

const confirmTagSelection = () => {
  tagPopup.value.close();
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
  padding: 0 0 160rpx 0;
  background-color: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.form-group {
  margin: 20rpx 30rpx 0 30rpx;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.04);
}

.type-switch {
  display: flex;
  align-items: center;
  justify-content: center;
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

.row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 30rpx;
}

.row-item + .row-item { margin-top: 20rpx; }
.tag-row { margin-top: 20rpx; }

.row-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.row-title {
  font-size: 30rpx;
  color: #323233;
  font-weight: 600;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  max-width: 60%;
}

.row-value {
  font-size: 28rpx;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-preview {
  max-width: 420rpx;
  white-space: nowrap;
}

.tag-preview-inner {
  display: inline-flex;
  gap: 12rpx;
}

.tag-placeholder {
  color: #bbb;
  font-size: 26rpx;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  background-color: #f3f3f6;
}

.chip-text {
  font-size: 24rpx;
  color: #333;
}

/* 标签弹层 */
.tag-popup {
  background-color: #fff;
  border-radius: 16rpx 16rpx 0 0;
  padding-bottom: 30rpx;
}

.tag-popup-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.popup-sub {
  font-size: 26rpx;
  color: #999;
}

.tag-popup-body {
  max-height: 60vh;
  padding: 20rpx 30rpx 10rpx 30rpx;
  box-sizing: border-box;
}

.tag-group {
  margin-bottom: 20rpx;
}

.group-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 14rpx;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.tag-grid-item {
  background-color: #f7f8fa;
  border-radius: 14rpx;
  padding: 20rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: 2rpx solid transparent;
}

.tag-grid-item.active {
  background-color: #f2efff;
  border-color: #6B59CC;
}

.tag-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.tag-text {
  font-size: 26rpx;
  color: #333;
}

.tag-popup-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx 0 30rpx;
}

.btn-cancel, .btn-ok {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
}

.btn-cancel {
  background-color: #f3f3f6;
  color: #666;
}

.btn-ok {
  background-color: #6B59CC;
  color: #fff;
}

.button-wrapper {
  position: fixed;
  bottom: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  z-index: 10;
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