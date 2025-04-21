<template>
  <view class="prompt" v-if="recordingStore.isRecording">
    <image class="prompt-image" src="../../static/audio-animation.png" />
    <section class="dots-container">
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
    </section>
    <view class="cancle">松开发送，上滑取消</view>
  </view>
</template>

<script setup>
  import { useRecordingStore } from '@/stores/recording'
  const recordingStore = useRecordingStore()
</script>

<style lang="scss" scoped>
  .prompt {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    .prompt-image {
      position: absolute;
      top: 650rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 430rpx;
      height: 154rpx;
      border-radius: 28rpx;
    }
  }
  .cancle {
    position: absolute;
    top: 810rpx;
    left: 50%;
    transform: translateX(-50%);
    color: #ffffff;
  }
  .dots-container {
    position: absolute;
    top: 715rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 310rpx;
    height: 15rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dot {
    height: 14rpx;
    width: 8rpx;
    margin-right: 5rpx;
    border-radius: 5rpx;
    background-color: #000000;
    animation: pulse 1.5s infinite ease-in-out;
  }
  .dot:nth-child(4) {
    height: 22rpx;
  }
  .dot:nth-child(8) {
    height: 22rpx;
  }
  .dot:nth-child(12) {
    height: 22rpx;
  }
  .dot:nth-child(16) {
    height: 22rpx;
  }
  .dot:last-child {
    margin-right: 0;
    background: rgba(32, 40, 48, 0.22);
  }

  .dot:nth-child(1) {
    background: rgba(32, 40, 48, 0.22);
    animation-delay: -0.3s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.1s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.1s;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.9);
      background-color: #000000;
    }

    50% {
      transform: scale(1.2);
      // box-shadow: 0 0 0 10px rgba(12, 12, 12, 0);
    }

    100% {
      transform: scale(0.8);
      // box-shadow: 0 0 0 0 rgba(14, 14, 14, 0.7);
    }
  }

  @keyframes puls {
    0% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(-2rpx);
    }

    100% {
      transform: translateY(0px);
    }
  }
</style>
