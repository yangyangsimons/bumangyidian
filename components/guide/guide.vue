<template>
  <view class="intro-container" v-if="guideShow" @click="isYkClick">
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
  import { useWebSocketStore } from '@/stores/websocket'
  import { useAudioPlayerStore } from '@/stores/audioPlayer'
  import { useBarrageStore } from '@/stores/barrage'
  const barrageStore = useBarrageStore()
  const audioPlayerStore = useAudioPlayerStore()
  const wsStore = useWebSocketStore()
  const guideShow = ref(false)
  const token = ref('')
  const istourist = ref(true)
  const isYkClick = async () => {
    uni.getStorage({
      key: 'token',
      success: async (res) => {
        console.log('获取token成功', res.data)
        if (res.data) {
          // 如果token存在，说明是注册用户
          token.value = res.data
          uni.setStorage({
            key: 'isFirst',
            data: false,
          })
          uni.setStorage({
            key: 'tourist',
            data: false,
          })
          console.log('注册用户')
          guideShow.value = false
        } else {
          console.log('游客点击了页面')
          // 如果是游客点击了页面，直接跳转到登录页面
          const isFirst = await uni.getStorage({
            key: 'isFirst',
          })
          const tourist = await uni.getStorage({
            key: 'tourist',
          })
          istourist.value = tourist.data
          console.log(
            '游客点击了页面isFirst,tourist',
            isFirst.data,
            tourist.data
          )
          if (tourist.data) {
            uni.showModal({
              title: '',
              content: '登录后体验完整功能',
              success: async (res) => {
                if (res.confirm) {
                  await wsStore.close()
                  audioPlayerStore.stopAllAudio()
                  barrageStore.clearMessages()
                  console.log('用户点击确定')
                  // 1秒钟之后跳转登录
                  setTimeout(() => {
                    uni.reLaunch({
                      url: '/pages/login/login',
                    })
                  }, 1000)
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              },
            })
          }
        }
      },
      fail: async (error) => {
        console.log('获取token失败', error)
        // 如果获取token失败，说明是游客用户
        // 直接跳转到登录页面
        // 如果token不存在，说明是游客用户
        console.log('游客用户')
        //是否是游客点击了页面
        console.log('游客点击了页面')
        // 如果是游客点击了页面，直接跳转到登录页面
        const isFirst = await uni.getStorage({
          key: 'isFirst',
        })
        const tourist = await uni.getStorage({
          key: 'tourist',
        })
        console.log('游客点击了页面isFirst,tourist', isFirst.data, tourist.data)
        if (tourist.data) {
          uni.showModal({
            title: '',
            content: '登录后体验完整功能',
            success: async (res) => {
              if (res.confirm) {
                console.log('用户点击确定')
                await wsStore.close()
                audioPlayerStore.stopAllAudio()
                barrageStore.clearMessages()
                console.log('用户点击确定')
                // 1秒钟之后跳转登录
                setTimeout(() => {
                  uni.reLaunch({
                    url: '/pages/login/login',
                  })
                }, 1000)
                uni.reLaunch({
                  url: '/pages/login/login',
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            },
          })
        }
      },
    })
    if (token && token.data) {
      console.log('token', token.data)
    } else {
    }
  }
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
    console.log('新手引导页点击', istourist.value)
    if (istourist.value) {
      guideShow.value = true
      return
    } else {
      // 点击新手引导页时执行的逻辑
      console.log('点击了新手引导页')
      guideShow.value = false
      uni.setStorageSync('isFirst', false)
    }
  }
</script>

<style lang="scss" scoped>
  .intro-container {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 999;
    background: rgba(0, 0, 0, 0.45);
    .guide-bg {
      position: fixed;
      width: 100%;
      height: 100%;
    }
    .change-model-container-right {
      position: absolute;
      top: 345rpx;
      //   border: 1px solid #fff;
      right: 54rpx;
      image {
        width: 88rpx;
        height: 98rpx;
      }
      .text {
        width: 300rpx;
        font-weight: 400;
        font-size: 40rpx;
        color: #fff;
        position: absolute;
        right: 10rpx;
        top: 75%;
      }
    }
    .music-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      //   border: 1px solid #fff;
      position: absolute;
      //   border: 1px solid #fff;
      top: 600rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      image {
        width: 148rpx;
        height: 148rpx;
        margin-bottom: 20rpx;
      }
      .text {
        white-space: nowrap;
        font-weight: 500;
        font-size: 48rpx;
        color: #fff;
      }
    }
    .start {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      //   border: 1px solid #fff;
      position: absolute;
      //   border: 1px solid #fff;
      top: 950rpx;
      left: 50%;
      transform: translateX(-50%);
      image {
        width: 190rpx;
        height: 82rpx;
      }
    }
    .change-model-container {
      position: absolute;
      //   border: 1px solid #fff;
      top: 225rpx;
      right: 0;
      width: 230rpx;
      height: 112rpx;
      border-radius: 270rpx 0px 0px 270rpx;
      background: rgba(204, 204, 204, 0.5);
      z-index: 999;
    }
    .chat-container {
      position: absolute;
      //   border: 1px solid #fff;
      bottom: 37rpx;
      width: 602rpx;
      height: 104rpx;
      margin-left: 20rpx;
      background: rgba(204, 204, 204, 0.5);
      border-radius: 250rpx;
      z-index: 999;
    }
    .user-container {
      position: absolute;
      //   border: 1px solid #fff;
      bottom: 38rpx;
      right: 0rpx;
      width: 100rpx;
      height: 104rpx;
      margin-right: 26rpx;
      background: transparent;
      border-radius: 250rpx;
      background: rgba(204, 204, 204, 0.5);
      z-index: 999;
    }
    .chat-container-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: absolute;
      bottom: 140rpx;
      left: rpx;
      image {
        width: 88rpx;
        height: 98rpx;
      }
      text {
        font-weight: 400;
        font-size: 40rpx;
        color: #fff;
        width: 400rpx;
        margin-left: 32rpx;
      }
    }
    .chat-container-right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      position: absolute;
      bottom: 145rpx;
      right: 50rpx;
      image {
        width: 150rpx;
        height: 140rpx;
      }
      text {
        font-weight: 400;
        font-size: 40rpx;
        color: #fff;
      }
    }
  }
</style>
