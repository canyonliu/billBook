<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
  uni.request({
    url: 'http://34.121.201.207/api/xcx/tips',
    success: (res: any) => {
      if (res.data && res.data.data && res.data.data.tip) {
        console.log('API success:', res.data.data.tip);
        uni.setStorageSync('tipsData', res.data.data.tip); // 缓存 tip 数据
      }
    },
    fail: (err) => {
      console.error('API request failed:', err);
    }
  });
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
/* app.wxss */
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 200rpx 0;
  box-sizing: border-box;
}

page {
  background-color: #F7F7F7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>