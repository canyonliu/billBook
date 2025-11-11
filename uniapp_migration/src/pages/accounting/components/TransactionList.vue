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
          <uni-icons :type="item.icon" size="24" class="card-icon" color="#6B59CC" />
          <view class="card-content">
            <text class="item-desc">{{ item.description || '无描述' }}</text>
            <view class="tags-and-time">
              <uni-tag v-for="(tag, tagIndex) in item.tagObjects" :key="tagIndex" :text="tag.name" type="primary" size="small" class="icon-tag">
                <template v-slot:icon>
                  <uni-icons :type="tag.icon" size="14" color="#6B59CC" />
                </template>
              </uni-tag>
              <uni-tag :text="item.displayText" type="default" size="small" class="time-tag" />
            </view>
          </view>
          <text class="card-amount" :class="item.type">{{ item.type === 'income' ? '+' : '-' }}{{ item.amount }}</text>
        </view>
      </view>
    </template>
    <view v-else class="empty-state">
      <uni-icons type="info" size="50" color="#bdc3c7" />
      <text class="empty-text">暂无交易记录</text>
    </view>
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
 
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  color: #999;
}
 
.empty-text {
  font-size: 28rpx;
  margin-top: 20rpx;
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

.icon-tag { margin-right: 8rpx; }

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
