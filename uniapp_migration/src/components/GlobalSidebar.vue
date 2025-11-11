<!-- src/components/GlobalSidebar.vue -->
<template>
  <uni-popup ref="sidebarPopup" type="left">
    <view class="sidebar-container">
      <view class="sidebar-header">
        <text>导航</text>
      </view>
      <view class="sidebar-menu">
        <view class="menu-item" @click="navigateTo('/pages/accounting/accounting')">
          <uni-icons type="wallet" size="20" />
          <text>记账本</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/wordbook/wordbook')">
          <uni-icons type="shop" size="20" />
          <text>单词本</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/recycleBin/recycleBin')">
          <uni-icons type="trash" size="20" />
          <text>回收站</text>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const sidebarPopup = ref<any>(null);

const onOpenSidebar = () => {
  sidebarPopup.value?.open();
};

const onCloseSidebar = () => {
  sidebarPopup.value?.close();
};

const navigateTo = (url: string) => {
  onCloseSidebar();
  uni.switchTab({
    url: url,
    fail: () => {
      uni.navigateTo({ url: url });
    }
  });
};

onMounted(() => {
  uni.$on('open-sidebar', onOpenSidebar);
});

onUnmounted(() => {
  uni.$off('open-sidebar', onOpenSidebar);
});
</script>

<style>
.sidebar-container {
  width: 70vw;
  height: 100vh;
  background-color: #fff;
}

.sidebar-header {
  margin-top: 150rpx;
  padding: 50rpx 40rpx;
  font-size: 36rpx;
  font-weight: bold;
  border-bottom: 1rpx solid #eee;
}

.sidebar-menu {
  padding: 20rpx 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  font-size: 32rpx;
  color: #333;
}

:deep(.menu-item .uni-icons) {
  margin-right: 20rpx;
}

.menu-item:active {
  background-color: #f5f5f5;
}
</style>
