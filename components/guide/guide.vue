<template>
  <view class="intro-container" v-if="guideShow">
    <view class="change-model-container"> </view>
    <view class="change-model-container-right">
      <image src="../../static/guide/right-top-icon.png" mode="scaleToFill" />
      <text class="text">模式一键切换</text>
    </view>
    <view class="music-container">
      <image src="../../static/guide/music-icon.png" mode="scaleToFill" />
      <text class="text">打开声音或者戴上耳机</text>
      <text class="text">让声音伴你多一点</text>
    </view>
    <view class="start" @click="guideShowClick">
      <image src="../../static/guide/start-icon.png" mode="scaleToFill" />
    </view>
    <view class="chat-container-left">
      <text>文字语音随心输入</text>
      <image src="../../static/guide/left-bottom-icon.png" mode="scaleToFill" />
    </view>
    <view class="chat-container-right">
      <text>更多音色任你选择</text>
      <image
        src="../../static/guide/right-bottom-icon.png"
        mode="scaleToFill"
      />
    </view>
    <view class="chat-container"></view>
    <view class="user-container"></view>
  </view>
</template>

<script setup>
  import { ref } from 'vue'
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
  const guideShow = ref(true)
  onShow(async () => {
    // 页面显示时执行的逻辑
    console.log('新手引导页页面显示')
    const isFirstOpen = await uni.getStorageSync('isFirst')
    if (isFirstOpen) {
      guideShow.value = true
    } else {
      guideShow.value = false
    }
  })
  const guideShowClick = () => {
    // 点击新手引导页时执行的逻辑
    console.log('点击了新手引导页')
    guideShow.value = false
    uni.setStorageSync('isFirst', false)
  }
</script>

<style lang="scss" scoped>
  @import 'index.scss';
</style>
