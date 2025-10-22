<template>
  <view class="container">
    <view class="form-wrapper">
      <!-- Deck Name Input -->
      <view class="form-group">
        <label for="deckName">卡片集名称</label>
        <input id="deckName" v-model="deckName" placeholder="例如：前端高频面试题" />
      </view>

      <!-- Divider -->
      <view class="divider">卡片列表</view>

      <!-- Cards List -->
      <view class="cards-list">
        <view class="card-editor-item" v-for="(item, index) in cards" :key="item.id">
          <view class="card-header">
            <view class="card-title">卡片 {{ index + 1 }}</view>
            <uni-icons type="trash" class="delete-card-icon" color="#e74c3c" @click="removeCard(item.id)" />
          </view>
          <view class="card-body">
            <textarea class="card-input" placeholder="输入正面内容..." v-model="item.front"></textarea>
            <textarea class="card-input" placeholder="输入反面内容..." v-model="item.back"></textarea>
          </view>
        </view>
      </view>

      <!-- Add Card Button -->
      <button class="add-card-btn-main" @click="addCard">
        <uni-icons type="plus" color="#6B59CC" class="add-card-btn-icon" />
        <text>添加新卡片</text>
      </button>
    </view>

    <!-- Save Button -->
    <button class="save-btn" @click="save">保存</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as util from '../../utils/util';

const deckId = ref<string | null>(null);
const deckName = ref('');
const cards = ref<any[]>([]);
const isEditMode = ref(false);

onLoad((options: any) => {
  const id = options.id;
  if (id) {
    // Edit Mode
    const allData = util.loadData();
    const deck = allData.decks.find((d: any) => d.id === id);
    if (deck) {
      isEditMode.value = true;
      deckId.value = deck.id;
      deckName.value = deck.name;
      cards.value = deck.cards;
      uni.setNavigationBarTitle({ title: '编辑卡片集' });
    } else {
      // Handle error: deck not found
      uni.showToast({ title: '找不到卡片集', icon: 'none' });
      uni.navigateBack();
    }
  } else {
    // Create Mode
    isEditMode.value = false;
    uni.setNavigationBarTitle({ title: '新建卡片集' });
  }
});

// --- Card List Management ---
const addCard = () => {
  const newCard = {
    id: util.generateId(),
    front: '',
    back: ''
  };
  cards.value.push(newCard);
};

const removeCard = (cardId: string) => {
  cards.value = cards.value.filter(c => c.id !== cardId);
};

// --- Save Logic ---
const save = () => {
  if (!deckName.value.trim()) {
    uni.showToast({ title: '卡片集名称不能为空', icon: 'none' });
    return;
  }

  const allData = util.loadData();

  if (isEditMode.value) {
    // Update existing deck
    const deckIndex = allData.decks.findIndex((d: any) => d.id === deckId.value);
    if (deckIndex > -1) {
      allData.decks[deckIndex].name = deckName.value;
      allData.decks[deckIndex].cards = cards.value;
    }
  } else {
    // Create new deck
    const newDeck = {
      id: util.generateId(),
      name: deckName.value,
      cards: cards.value
    };
    allData.decks.push(newDeck);
  }

  util.saveData(allData);

  uni.showToast({ title: '保存成功', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 1500);
};
</script>

<style>
/* pages/editor/editor.wxss */
.container {
  padding: 30rpx 30rpx 160rpx; /* Leave space for the fixed save button */
  box-sizing: border-box;
}

.form-wrapper {
  width: 100%;
}

.form-group {
  margin-bottom: 40rpx;
}

label {
  display: block;
  margin-bottom: 15rpx;
  color: #2c3e50;
  font-size: 32rpx;
  font-weight: 600;
}

input {
  border: none;
  border-bottom: 2rpx solid #ecf0f1;
  padding: 20rpx 0;
  font-size: 32rpx;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s;
  height: 80rpx; /* Explicitly set height */
}

input:focus {
  border-bottom-color: #6B59CC;
}

.divider {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 30rpx;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid #ecf0f1;
}

.cards-list {
  margin-bottom: 30rpx;
}

.card-editor-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  border: 1rpx solid #ecf0f1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #34495e;
}

.delete-card-icon {
  font-size: 44rpx !important;
}

.card-body textarea {
  width: 100%;
  height: 150rpx;
  padding: 20rpx;
  box-sizing: border-box;
  border: 1rpx solid #ecf0f1;
  border-radius: 8rpx;
  font-size: 30rpx;
  background-color: #f9fafb;
  line-height: 1.5;
}

.card-body textarea:first-child {
  margin-bottom: 20rpx;
}

.add-card-btn-main {
  width: 100%;
  height: 90rpx;
  background-color: #fff;
  color: #6B59CC;
  border: 1rpx dashed #bdc3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.add-card-btn-icon {
  margin-right: 15rpx;
}

.save-btn {
  position: fixed;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 700rpx;
  height: 96rpx;
  background-color: #6B59CC;
  color: white;
  border-radius: 48rpx;
  font-size: 32rpx;
  box-shadow: 0 8rpx 25rpx rgba(107, 89, 204, 0.45);
}
</style>
