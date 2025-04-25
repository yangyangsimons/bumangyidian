<template>
  <view class="notify-container">
    <view class="notify-content">
      <image
        class="notify-icon"
        src="../../static/notify/notify-icon.png"
        mode="scaleToFill"
      />
      <text class="notify-text">新消息通知</text>
    </view>
    <image
      class="notify-close"
      @click="closeNotify"
      src="../../static/notify-close-icon"
    >
    </image>
  </view>
</template>

<script setup></script>

<style lang="scss" scoped>
  .notify-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;

    .notify-content {
      display: flex;
      align-items: center;
      background-color: #fff;
      border-radius: 10px;
      padding: 20rpx;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
      width: 80%;
      max-width: 600rpx;

      .notify-icon {
        width: 50rpx;
        height: 50rpx;
        margin-right: 20rpx;
      }

      .notify-text {
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
      }
    }
    .notify-close {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      width: 36rpx;
      height: 36rpx;
    }
  }
</style>
