<template>
  <view class="skeleton-wrapper">
    <view class="skeleton-container">
      <!-- 头部骨架 -->
      <view class="skeleton-header">
        <view class="skeleton-avatar"></view>
        <view class="skeleton-header-content">
          <view class="skeleton-line skeleton-line-short"></view>
          <view class="skeleton-line skeleton-line-medium"></view>
        </view>
      </view>

      <!-- 内容区域骨架 -->
      <view class="skeleton-content">
        <view class="skeleton-card" v-for="item in 5" :key="item">
          <view class="skeleton-card-image"></view>
          <view class="skeleton-card-content">
            <view class="skeleton-line skeleton-line-long"></view>
            <view class="skeleton-line skeleton-line-medium"></view>
            <view class="skeleton-line skeleton-line-short"></view>
          </view>
        </view>
      </view>

      <!-- 加载动画 -->
      <view class="loading-animation">
        <view class="loading-dot"></view>
        <view class="loading-dot"></view>
        <view class="loading-dot"></view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    onLoad() {
      // 获取系统信息来适配不同设备
      const systemInfo = uni.getSystemInfoSync()
      console.log('设备信息:', systemInfo)

      setTimeout(() => {
        console.log('骨架屏加载完成')
      }, 500)
    },
  }
</script>

<style scoped>
  /* 最外层容器，确保占满全屏 */
  .skeleton-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background-color: #f8f8f8;
    z-index: 9999;
  }

  .skeleton-container {
    width: 100%;
    height: 100%;
    padding: 20rpx;
    box-sizing: border-box;
    overflow-y: auto;
    /* 添加顶部安全区域适配 */
    padding-top: calc(20rpx + env(safe-area-inset-top));
    /* 添加底部安全区域适配 */
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  }

  /* 头部骨架 */
  .skeleton-header {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    padding: 20rpx;
    background-color: #fff;
    border-radius: 16rpx;
  }

  .skeleton-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  .skeleton-header-content {
    flex: 1;
  }

  /* 骨架线条 */
  .skeleton-line {
    height: 24rpx;
    border-radius: 12rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    margin-bottom: 16rpx;
  }

  .skeleton-line-short {
    width: 30%;
  }

  .skeleton-line-medium {
    width: 60%;
  }

  .skeleton-line-long {
    width: 90%;
  }

  .skeleton-line:last-child {
    margin-bottom: 0;
  }

  /* 内容区域 */
  .skeleton-content {
    flex: 1;
    min-height: 60vh; /* 确保内容区域有足够高度 */
  }

  /* 卡片骨架 */
  .skeleton-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    display: flex;
    min-height: 140rpx; /* 设置最小高度 */
  }

  .skeleton-card-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  .skeleton-card-content {
    flex: 1;
    padding-top: 10rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  /* 加载动画 */
  .loading-animation {
    position: fixed;
    bottom: calc(100rpx + env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8rpx;
    z-index: 10000;
  }

  .loading-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background-color: #007aff;
    animation: loading-bounce 1.4s infinite ease-in-out both;
  }

  .loading-dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .loading-dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  /* 动画定义 */
  @keyframes skeleton-loading {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes loading-bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  /* 媒体查询，针对不同屏幕尺寸优化 */
  @media screen and (max-height: 667px) {
    .skeleton-container {
      padding: 15rpx;
      padding-top: calc(15rpx + env(safe-area-inset-top));
    }

    .skeleton-card {
      margin-bottom: 15rpx;
      min-height: 120rpx;
    }
  }
</style>
