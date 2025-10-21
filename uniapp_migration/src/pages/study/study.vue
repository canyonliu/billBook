<template>
  <view class="container">
    <template v-if="deck">
      <!-- Main Study Area -->
      <view class="study-area" v-if="deck.cards.length > 0">
        <!-- Progress Indicator -->
        <view class="progress">{{ currentIndex + 1 }} / {{ deck.cards.length }}</view>

        <!-- Card Container -->
        <view class="card-container" @click="flipCard">
          <view class="card-content" :class="{ 'is-flipped': isFlipped }">
            <!-- Front Face -->
            <view class="card-face card-front">
              <text>{{ deck.cards[currentIndex].front }}</text>
            </view>
            <!-- Back Face -->
            <view class="card-face card-back">
              <text>{{ deck.cards[currentIndex].back }}</text>
            </view>
          </view>
        </view>

        <!-- Action Buttons -->
        <view class="actions">
          <view class="action-btn prev-btn" :class="{ 'disabled': currentIndex === 0 }" @click.stop="prevCard">
            <van-icon name="arrow-left" custom-class="nav-icon" />
          </view>
          <view class="action-btn flip-btn" @click.stop="flipCard">
            <van-icon name="replay" custom-class="flip-icon" />
          </view>
          <view class="action-btn next-btn" :class="{ 'disabled': currentIndex === deck.cards.length - 1 }" @click.stop="nextCard">
            <van-icon name="arrow" custom-class="nav-icon" />
          </view>
        </view>
      </view>

      <!-- Empty State for Deck -->
      <view class="empty-state" v-else>
        <van-icon name="add-o" size="40px" color="#bdc3c7" />
        <text class="empty-text">这个卡片集是空的</text>
        <text class="empty-tip">快去添加一些卡片吧！</text>
        <button class="add-card-btn" @click="navigateToAddCard">
          <van-icon name="plus" color="#fff" custom-class="add-card-btn-icon" />
          <text>添加第一张卡片</text>
        </button>
      </view>
    </template>

    <!-- Loading State -->
    <view v-else>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
import * as util from '../../utils/util';

const deck = ref<any>(null);
const currentIndex = ref(0);
const isFlipped = ref(false);
let deckId: string | null = null;

onLoad((options: any) => {
  // onLoad is called only once, save the deckId
  if (options.id) {
    deckId = options.id;
  }
});

onShow(() => {
  if (!deckId) {
    // This can happen if onLoad fails or if the page is accessed without an id.
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage.options.id) {
      deckId = currentPage.options.id;
    } else {
      showErrorAndGoBack('无法获取卡片集ID');
      return;
    }
  }

  const allData = util.loadData();
  const foundDeck = allData.decks.find((d: any) => d.id === deckId);

  if (foundDeck) {
    deck.value = foundDeck;
    // Reset study progress when page is shown
    currentIndex.value = 0;
    isFlipped.value = false;
    uni.setNavigationBarTitle({ title: foundDeck.name });
  } else {
    showErrorAndGoBack('找不到卡片集');
  }
});

const showErrorAndGoBack = (title: string) => {
  uni.showToast({
    title: title,
    icon: 'none'
  });
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};

const flipCard = () => {
  if (!deck.value || deck.value.cards.length === 0) return;
  isFlipped.value = !isFlipped.value;
};

const nextCard = () => {
  if (currentIndex.value < deck.value.cards.length - 1) {
    currentIndex.value++;
    isFlipped.value = false; // Reset flip state for the new card
  }
};

const prevCard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    isFlipped.value = false; // Reset flip state for the new card
  }
};

const navigateToAddCard = () => {
  if (deck.value) {
    uni.navigateTo({
      url: `../editor/editor?id=${deck.value.id}`
    });
  }
};
</script>

<style>
/* pages/study/study.wxss */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
  background-color: #f4f5f7;
}

.study-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress {
  font-size: 34rpx;
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 40rpx;
}

.card-container {
  width: 100%;
  max-width: 700rpx;
  height: 500rpx;
  perspective: 1200px;
}

.card-content {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
}

.card-content.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
  background-color: white;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.08);
  border-radius: 24rpx;
  text-align: center;
  font-size: 44rpx;
  color: #2c3e50;
  word-wrap: break-word;
  word-break: break-word;
}

.card-back {
  transform: rotateY(180deg);
}

.actions {
  margin-top: 80rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 700rpx;
}

.action-btn {
  background-color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer; /* Indicate clickable */
}

.action-btn:active {
  transform: scale(0.9);
}

.action-btn.disabled {
  opacity: 0.4;
  pointer-events: none; /* Disable clicks when disabled */
}

.prev-btn,
.next-btn {
  width: 110rpx;
  height: 110rpx;
}

.flip-btn {
  width: 150rpx;
  height: 150rpx;
  background-color: #6B59CC;
}

.nav-icon {
  font-size: 50rpx !important;
  color: #2c3e50 !important;
}

.flip-icon {
  font-size: 70rpx !important;
  color: #fff !important;
}

/* Empty State Styles */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  margin-bottom: 50rpx;
}

.add-card-btn {
  background-color: #6B59CC;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  padding: 0 40rpx;
  font-size: 30rpx;
}

.add-card-btn-icon {
  margin-right: 15rpx;
}
</style>
