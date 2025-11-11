<template>
  <CustomNavBar />
  <view class="container">
    <!-- Banner -->
    <view class="banner-container" v-if="tips">
      <text class="banner-text">{{ tips }}</text>
    </view>

    <view class="deck-list" v-if="decks.length > 0">
      <uni-swipe-action>
        <uni-swipe-action-item :right-options="swipeActionOptions" @click="onSwipeClick($event, item)" v-for="item in decks" :key="item.id">
          <view class="deck-item" @click="navigateToStudy(item.id)">
            <view class="deck-content">
              <view class="deck-name">{{ item.name }}</view>
              <view class="deck-info">{{ item.cards.length }} 张卡片</view>
            </view>
            <view class="deck-actions">
              <uni-icons type="compose" class="action-icon" @click.stop="navigateToEdit(item.id)" />
            </view>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>
    </view>

    <view class="empty-state" v-else>
      <uni-icons type="folder-add" size="50" color="#bdc3c7" />
      <text class="empty-text">还没有卡片集</text>
      <text class="empty-tip">点击下方按钮创建一个吧！</text>
    </view>

    <button class="add-btn" @click="navigateToAdd">
      <uni-icons type="plus" color="#fff" class="add-btn-icon"/>
      <text>创建新卡片集</text>
    </button>

    <GlobalSidebar />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import * as util from '../../utils/util';
import GlobalSidebar from '../../components/GlobalSidebar.vue';
import CustomNavBar from '../../components/CustomNavBar.vue';

const decks = ref<any[]>([]);
const tips = ref<string>('');

const swipeActionOptions = ref([
  {
    text: '删除',
    style: {
      backgroundColor: '#ee0a24'
    }
  }
]);

onShow(() => {
  console.log('index.vue: onShow triggered');
  loadDecks();
  const storedTips = uni.getStorageSync('tipsData');
  if (storedTips) {
    tips.value = storedTips;
  }
});

const loadDecks = () => {
  console.log('index.vue: loadDecks called');
  const data = util.loadData();
  console.log('index.vue: Data loaded from util', data);
  decks.value = data.decks;
  console.log('index.vue: decks set to data', decks.value);
};

const navigateToAdd = () => {
  uni.navigateTo({ url: '../editor/editor' });
};

const onSwipeClick = (e: any, item: any) => {
  if (e.content.text === '删除') {
    showDeleteModal(item.id);
  }
};

const navigateToStudy = (deckId: string) => {
  console.log('index.vue: navigateToStudy for deckId', deckId);
  uni.navigateTo({ url: `../study/study?id=${deckId}` });
};

const navigateToEdit = (deckId: string) => {
  console.log('index.vue: navigateToEdit for deckId', deckId);
  uni.navigateTo({ url: `../editor/editor?id=${deckId}` });
};

const showDeleteModal = (deckId: string) => {
  console.log('index.vue: showDeleteModal for deckId', deckId);
  uni.showModal({
    title: '确认删除',
    content: '您确定要将这个卡片集移入回收站吗？',
    confirmColor: '#e74c3c',
    success: (res) => {
      if (res.confirm) {
        console.log('index.vue: Delete confirmed for deckId', deckId);
        moveToRecycleBin(deckId);
      } else {
        console.log('index.vue: Delete cancelled for deckId', deckId);
      }
    }
  });
};

const moveToRecycleBin = (deckId: string) => {
  console.log('index.vue: moveToRecycleBin called for deckId', deckId);
  const allData = util.loadData();
  console.log('index.vue: allData before modification', allData);
  const deckIndex = allData.decks.findIndex((d: any) => d.id === deckId);

  if (deckIndex > -1) {
    const [deck] = allData.decks.splice(deckIndex, 1);
    console.log('index.vue: Deck removed from active decks', deck);
    deck.deletedAt = Date.now(); // Mark deletion time
    if (!allData.deletedDecks) {
      allData.deletedDecks = [];
    }
    allData.deletedDecks.push(deck);
    console.log('index.vue: allData after modification', allData);
    util.saveData(allData);
    loadDecks(); // Refreshes the UI
    uni.showToast({ title: '已移入回收站', icon: 'success' });
  } else {
    console.log('index.vue: Deck not found in active decks for deletion', deckId);
  }
};

const onOpenSidebar = () => {
  uni.$emit('open-sidebar');
};

const onSwipeCellClose = (e: any) => {
  console.log('index.vue: Swipe cell closed', e.detail);
};
</script>

<style>
/* pages/index/index.wxss */
.container {
  padding: 160rpx 0 0 0;
}

/* Banner Styles */
.banner-container {
  background: linear-gradient(135deg, #6B59CC, #836FFF);
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 8rpx 25rpx rgba(107, 89, 204, 0.3);
}

.banner-text {
  color: #fff;
  font-size: 28rpx;
  text-align: center;
}

/* Make swipe cell full width */
van-swipe-cell {
  width: 100%;
  margin-bottom: 25rpx; /* Apply margin to the swipe-cell itself */
  border-radius: 20rpx;
  box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.06);
  overflow: hidden; /* Ensure content respects border-radius */
  margin: 0 20rpx; /* Apply horizontal margin to the swipe-cell */
  min-height: 140rpx; /* Increased minimum height for the card */
}

/* Deck List Item */
.deck-item {
  background-color: #fff; /* Ensure opaque background */
  padding: 40rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; /* Ensure z-index works */
  z-index: 1; /* Keep deck item above swipe actions */
  height: 100%; /* Ensure deck-item fills swipe-cell height */
  border-radius: 20rpx; /* Ensure border-radius is consistent */
}

.deck-item:active {
  background-color: #f8f8f8;
}

.deck-content {
  flex-grow: 1;
}

.deck-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5rpx;
}

.deck-info {
  font-size: 26rpx;
  color: #7f8c8d;
}

.deck-actions {
  display: flex;
  align-items: center;
}

.action-icon {
  font-size: 44rpx !important; /* Use !important to override Vant default size */
  padding: 10rpx;
  margin-left: 25rpx;
  color: #7f8c8d;
}

/* Styles for the swipe-out delete button */
.delete-button {
  height: 100% !important;
  border-radius: 0 20rpx 20rpx 0 !important;
  width: 100px; /* Explicitly set width to match right-width */
  background-color: #ee0a24 !important;
  color: white !important;
  display: flex !important;
  flex-direction: column; /* Stack icon and text */
  align-items: center !important;
  justify-content: center !important;
  font-size: 24rpx !important; /* Smaller font for text */
}

.delete-button.delete-button-danger {
  background-color: #ee0a24 !important;
}

.delete-button .van-icon {
  margin-bottom: 5rpx; /* Space between icon and text */
  font-size: 28px !important; /* Adjust icon size */
}

/* Empty State */
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

/* Add Button */
.add-btn {
  position: fixed;
  bottom: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600rpx;
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

.add-btn-icon {
  margin-right: 15rpx;
}
</style>
