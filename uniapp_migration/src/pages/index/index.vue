<template>
  <view class="container">
    <text class="title">欢迎来到 Uni-app</text>
    <text class="tip">这是一个基础的、可运行的首页</text>
    <button class="test-button" @click="testLoadData">测试加载数据 (原生按钮)</button>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { loadData } from '../../utils/util';

onShow(() => {
  console.log('index.vue: onShow triggered');
  loadDecks();
});

const loadDecks = () => {
  console.log('index.vue: loadDecks called');
  const data = loadData();
  console.log('index.vue: Data loaded from util', data);
};

const testLoadData = () => {
  console.log('--- 测试按钮点击 ---');
  const data = loadData();
  uni.showToast({
    title: `读取到 ${data.decks?.length || 0} 个卡片集`,
    icon: 'none'
  });
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
.tip {
  font-size: 16px;
  color: #888;
  margin-bottom: 20px;
}
.test-button {
  padding: 10px 20px;
  background-color: #007aff;
  color: white;
  border-radius: 5px;
}
</style>
