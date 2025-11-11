<!-- src/components/CustomNavBar.vue -->
<template>
  <view class="custom-navbar">
    <view class="left-section">
      <view v-if="showBackButton" class="back-button" @click="goBack">
        <uni-icons type="back" size="24" color="#fff" />
      </view>
      <view v-else class="menu-button" @click="onOpenSidebar">
        <uni-icons type="bars" size="24" color="#fff" />
      </view>
    </view>
    <view class="center-section">
      <!-- Page Title will go here -->
      <text class="navbar-title">{{ title }}</text>
    </view>
    <view class="right-section">
      <!-- Right actions if any -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const title = ref('');
const showBackButton = ref(false);

const onOpenSidebar = () => {
  uni.$emit('open-sidebar');
};

const goBack = () => {
  uni.navigateBack();
};

// Dynamically set title based on current page
onShow(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentRoute = currentPage?.route;

  const rootPages = ['pages/accounting/accounting', 'pages/wordbook/wordbook'];

  if (rootPages.includes(currentRoute)) {
    showBackButton.value = false;
  } else {
    showBackButton.value = pages.length > 1;
  }

  // uni-app page config has navigationBarTitleText
  // For Vue 3 setup, $vm is not directly available on currentPage.
  // We need to access the options from the page object itself.
  title.value = currentPage?.options?.navigationBarTitleText || '';
  // Fallback to route name if navigationBarTitleText is not set
  if (!title.value && currentPage?.route) {
    const routeParts = currentPage.route.split('/');
    title.value = routeParts[routeParts.length - 1]; // Use last part of route as title
  }
});
</script>

<style scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 130rpx; /* Standard navigation bar height */
  padding-top: var(--status-bar-height); /* Push content below status bar */
  background-color: #6B59CC;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.08);
  z-index: 999; /* Ensure it's above page content */
  box-sizing: content-box; /* Ensure padding is added to height */
}

.left-section, .right-section {
  display: flex;
  align-items: center;
  height: 100%;
}

.left-section {
  padding-left: 20rpx;
}

.right-section {
  padding-right: 20rpx;
}

.center-section {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.navbar-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.menu-button {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-color: #f0f0f0; */ /* Optional: add background to button */
}

.back-button {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
