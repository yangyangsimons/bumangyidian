<template>
  <view class="container" :style="{ paddingTop: menuButtonRect.top + 'px' }">
    <image src="/static/my/bg.png" mode="scaleToFill" class="bg" />
    <div :style="{ height: menuButtonRect.height + 'px' }" class="header">
      <div
        v-for="(value, index) in nav"
        :class="{ progame: true, active: navActive == index }"
        :key="value"
        @click="navActive = index"
      >
        <!-- 用 image 替代 backgroundImage -->
        <image
          v-if="navActive == index"
          src="/static/ellipse.png"
          mode="scaleToFill"
          class="nav-bg-image"
        />
        <text class="nav-text">{{ value }}</text>
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
  import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import Programme from './components/programme.vue'
  import Messages from '@/components/messages/messages.vue'
  import tabbar from '@/components/tabbar/tabbar.vue'
  import { useMusicStore } from '@/stores/music'

  const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
  const menuButtonRect = uni.getMenuButtonBoundingClientRect()
  console.log('导航栏高度:', statusBarHeight)
  console.log('菜单按钮位置:', menuButtonRect)
  const navActive = ref(0)
  const nav = ['节目', '留言']
  onShareAppMessage(() => {
    console.log('onShareAppMessage......')
    return {
      title: `不芒一点，陪你世界加一点`,
      imageUrl:
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com:443/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E5%88%86%E4%BA%AB%E5%9B%BE.png',
      path: 'pages/interaction/interaction',
    }
  })
  onShareTimeline(() => {
    console.log('onShareTimeline......')
    return {
      title: `不芒一点，陪你世界加一点`,
    }
  })
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
        position: relative; // 添加相对定位，为背景图片提供定位参考
        font-size: 28rpx;
        color: rgba(110, 112, 112, 1);
        padding: 10rpx;

        // 背景图片样式
        .nav-bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1; // 置于文字后面
        }

        // 文字样式，确保在背景图片之上
        .nav-text {
          position: relative;
          z-index: 1;
        }
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
