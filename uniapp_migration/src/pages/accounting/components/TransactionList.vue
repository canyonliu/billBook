<template>
  <view class="transaction-group-list">
    <template v-if="groups && groups.length > 0">
      <view v-for="group in groups" :key="group.date" class="transaction-group">
        <view class="group-header">
          <text class="group-date">{{ group.date }}</text>
          <view class="group-summary">
            <text v-if="group.totalIncome > 0">收: {{ group.totalIncome }}</text>
            <text v-if="group.totalExpense > 0">支: {{ group.totalExpense }}</text>
          </view>
        </view>
        <view v-for="item in group.transactions" :key="item.id" class="transaction-card" @click="onEdit(item.id)">
          <van-icon :name="item.icon" size="24px" class="card-icon" />
          <view class="card-content">
            <text class="item-desc">{{ item.description || '无描述' }}</text>
            <view class="tags-and-time">
              <van-tag plain type="primary" v-for="(tag, tagIndex) in item.tagObjects" :key="tagIndex" custom-class="icon-tag">
                <van-icon :name="tag.icon" />
                <text class="tag-text">{{ tag.name }}</text>
              </van-tag>
              <van-tag plain type="default" custom-class="time-tag">{{ item.displayText }}</van-tag>
            </view>
          </view>
          <text class="card-amount" :class="item.type">{{ item.type === 'income' ? '+' : '-' }}{{ item.amount }}</text>
        </view>
      </view>
    </template>
    <van-empty v-else description="暂无交易记录" />
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps({
  groups: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['edit']);

const onEdit = (id: string) => {
  emit('edit', id);
};
</script>

<style>
.transaction-group-list {
  padding: 20rpx;
  padding-top: 0;
  padding-bottom: 120rpx; /* Space for fixed button */
}

.transaction-group {
  margin-bottom: 30rpx;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10rpx 15rpx;
  font-size: 28rpx;
  color: #969799;
}

.group-summary {
  font-size: 26rpx;
}

.group-summary text {
  margin-left: 20rpx;
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
  background-color: #f7f8fa;
  border-radius: 50%;
  color: #6B59CC;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Important for flex wrapping */
}

.item-desc {
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
  align-items: center;
  gap: 10rpx;
}

.icon-tag {
  display: flex;
  align-items: center;
  padding: 4rpx 12rpx !important; /* Adjust padding for icon */
}

.icon-tag .van-icon {
  margin-right: 6rpx;
  font-size: 24rpx !important;
}

.tag-text {
  line-height: 1;
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

.card-amount.income {
  color: #2ecc71;
}

.card-amount.expense {
  color: #e74c3c;
}
</style>
