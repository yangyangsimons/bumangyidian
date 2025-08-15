<template>
  <view class="container" :style="{ paddingTop: menuButtonRect.top + 'px' }">
    <image src="/static/my/bg.png" mode="scaleToFill" class="bg" />
    <div :style="{ height: menuButtonRect.height + 'px' }" class="header">
      <div
        v-for="(value, index) in nav"
        :class="{ progame: true, active: navActive == index }"
        :style="{
          backgroundImage: navActive == index ? 'url(/static/ellipse.png)' : '',
        }"
        :key="value"
        @click="navActive = index"
      >
        <text>{{ value }}</text>
      </div>
    </div>
    <div class="content">
      <!-- 改为 v-if -->
      <Programme v-if="navActive === 0" />
      <Messages v-if="navActive === 1" />
    </div>
    <tabbar />
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import Programme from './components/programme.vue'
  import Messages from '@/components/messages/messages.vue'
  import tabbar from '@/components/tabbar/tabbar.vue'
  const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
  const menuButtonRect = uni.getMenuButtonBoundingClientRect()
  console.log('导航栏高度:', statusBarHeight)
  console.log('菜单按钮位置:', menuButtonRect)
  const navActive = ref(0)
  const nav = ['节目', '留言']
</script>

<style lang="scss" scoped>
  .container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background-size: cover;
    }
    .header {
      display: flex;
      align-items: center;
      padding-inline: 32rpx;
      box-sizing: border-box;
      gap: 50rpx;

      view {
        background-size: cover;
        font-size: 28rpx;
        color: rgba(110, 112, 112, 1);
        padding: 10rpx;
      }

      .active {
        font-size: 36rpx;
        color: rgba(16, 18, 19, 1);
        font-weight: 700;
      }
    }

    .content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .section {
        flex: 1;
        margin-top: 14rpx;
        background-color: #ba3434;
        border-top-left-radius: 27.5rpx;
        border-top-right-radius: 27.5rpx;
        overflow: hidden;
      }
    }
  }
</style>
