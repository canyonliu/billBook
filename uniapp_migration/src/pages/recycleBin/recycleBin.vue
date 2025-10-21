<template>
  <view class="container">
    <view class="item-list" v-if="deletedDecks.length > 0">
      <van-swipe-cell 
        :right-width="65" 
        :left-width="65" 
        v-for="item in deletedDecks" 
        :key="item.id" 
        custom-class="swipe-cell-wrapper"
      >
        <view class="list-item-content">
          <text>{{ item.name }}</text>
          <text class="deleted-info">已删除 {{ item.deletedAtText }}</text>
        </view>
        <template #left>
          <van-button type="primary" custom-class="restore-button" @click="handleRestore(item.id)">恢复</van-button>
        </template>
        <template #right>
          <van-button type="danger" custom-class="delete-button" @click="handlePermanentDelete(item.id)">彻底删除</van-button>
        </template>
      </van-swipe-cell>
    </view>
    <view class="empty-state" v-else>
      <van-icon name="success" size="50px" color="#bdc3c7" />
      <text class="empty-text">回收站是空的</text>
      <text class="empty-tip">没有可恢复的卡片集</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import * as util from '../../utils/util';

const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

const deletedDecks = ref<any[]>([]);

onShow(() => {
  loadDeletedDecks();
});

const loadDeletedDecks = () => {
  const allData = util.loadData();
  const now = Date.now();

  const validDeletedDecks = allData.deletedDecks.filter((deck: any) => {
    return (now - deck.deletedAt) < THREE_DAYS_IN_MS;
  });

  if (validDeletedDecks.length !== allData.deletedDecks.length) {
    allData.deletedDecks = validDeletedDecks;
    util.saveData(allData);
  }

  const formattedDecks = validDeletedDecks.map((deck: any) => ({
    ...deck,
    deletedAtText: new Date(deck.deletedAt).toLocaleString()
  }));

  deletedDecks.value = formattedDecks;
};

const handleRestore = (deckId: string) => {
  uni.showModal({
    title: '确认恢复',
    content: '您确定要恢复这个卡片集吗？',
    confirmColor: '#1989fa',
    success: (res) => {
      if (res.confirm) {
        restoreDeck(deckId);
      }
    }
  });
};

const restoreDeck = (deckId: string) => {
  const allData = util.loadData();
  const deckToRestoreIndex = allData.deletedDecks.findIndex((d: any) => d.id === deckId);

  if (deckToRestoreIndex > -1) {
    const [deck] = allData.deletedDecks.splice(deckToRestoreIndex, 1);
    delete deck.deletedAt;
    allData.decks.push(deck);
    util.saveData(allData);
    loadDeletedDecks();
    uni.showToast({ title: '恢复成功', icon: 'success' });
  }
};

const handlePermanentDelete = (deckId: string) => {
  uni.showModal({
    title: '彻底删除',
    content: '您确定要彻底删除这个卡片集吗？此操作无法撤销！',
    confirmColor: '#e74c3c',
    success: (res) => {
      if (res.confirm) {
        permanentDeleteDeck(deckId);
      }
    }
  });
};

const permanentDeleteDeck = (deckId: string) => {
  const allData = util.loadData();
  allData.deletedDecks = allData.deletedDecks.filter((d: any) => d.id !== deckId);
  util.saveData(allData);
  loadDeletedDecks();
  uni.showToast({ title: '已彻底删除', icon: 'success' });
};
</script>

<style>
/* pages/recycleBin/recycleBin.wxss */
.container {
  padding: 20rpx;
}

.item-list {
  margin-top: 20rpx;
}

/* Style the van-swipe-cell wrapper */
.swipe-cell-wrapper {
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  overflow: hidden;
}

.list-item-content {
  background-color: #fff;
  padding: 30rpx;
  font-size: 32rpx;
  display: flex;
  flex-direction: column;
  position: relative; /* Ensure z-index works */
  z-index: 1; /* Keep content above swipe actions */
}

.deleted-info {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 150rpx;
  color: #999;
}

.empty-state .van-icon {
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  margin-bottom: 10rpx;
}

.empty-tip {
  font-size: 26rpx;
}

/* Styles for Vant swipe-out buttons */
.van-swipe-cell__left,
.van-swipe-cell__right {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.restore-button,
.delete-button {
  height: 100% !important;
  width: 65px; /* Match the left/right-width */
  font-size: 28rpx !important;
  color: white !important;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0 !important; /* Remove default button radius */
}

.restore-button {
  background-color: #2ecc71 !important; /* Green for restore */
}

.delete-button {
  background-color: #e74c3c !important; /* Red for permanent delete */
}

.restore-button .van-icon,
.delete-button .van-icon {
  margin-bottom: 5rpx;
}
</style>
