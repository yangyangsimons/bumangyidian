<template>
  <view class="text-container">
    <image
      src="../../static/enrollment/slogon-bg.png"
      mode="scaleToFill"
      class="slogon-bg"
    />

    <!-- 添加滑动容器 -->
    <view
      class="swipe-container"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <view class="main-text-container">
        <image class="slogan" :src="currentSloganImage" mode="scaleToFill" />
      </view>
      <!-- 用户指引的图片-->
      <image
        class="tip-slogan"
        src="../../static/enrollment/tip-slogan.png"
        mode="scaleToFill"
        v-if="showTip"
      />
    </view>
  </view>
</template>

<script setup>
  import { ref, computed, onMounted, defineExpose } from 'vue'
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'

  // 页面显示时
  onShow(() => {
    console.log('组件已显示')
  })

  // slogan图片相关
  const currentSloganIndex = ref(1) // 当前图片索引，从1开始
  const maxSloganCount = 9 // 总共9张图片
  // tip的展示
  const showTip = ref(true) // 是否显示用户指引图片
  // 滑动相关变量
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchEndX = ref(0)
  const touchEndY = ref(0)
  const minSwipeDistance = ref(50) // 最小滑动距离
  const maxVerticalDistance = ref(100) // 最大垂直距离，防止垂直滑动时触发

  // 计算当前slogan图片路径
  const currentSloganImage = computed(() => {
    return `../../static/enrollment/slogan/slogan-${currentSloganIndex.value}.png`
  })

  // 切换到上一张图片
  const switchSloganPrev = () => {
    if (currentSloganIndex.value > 1) {
      currentSloganIndex.value--
    } else {
      currentSloganIndex.value = maxSloganCount // 循环到最后一张
    }
  }

  // 切换到下一张图片
  const switchSloganNext = () => {
    if (currentSloganIndex.value < maxSloganCount) {
      currentSloganIndex.value++
    } else {
      currentSloganIndex.value = 1 // 循环到第一张
    }
  }

  // 滑动开始
  const handleTouchStart = (e) => {
    // tip 不展示
    showTip.value = false
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
  }

  // 滑动过程中
  const handleTouchMove = (e) => {
    // 可以在这里添加一些实时反馈效果，比如拖拽预览
    e.preventDefault() // 防止页面滚动
  }

  // 滑动结束
  const handleTouchEnd = (e) => {
    touchEndX.value = e.changedTouches[0].clientX
    touchEndY.value = e.changedTouches[0].clientY

    handleSwipe()
  }

  // 处理滑动逻辑
  const handleSwipe = () => {
    const deltaX = touchEndX.value - touchStartX.value
    const deltaY = Math.abs(touchEndY.value - touchStartY.value)

    // 检查是否是有效的水平滑动
    if (
      Math.abs(deltaX) > minSwipeDistance.value &&
      deltaY < maxVerticalDistance.value
    ) {
      if (deltaX > 0) {
        // 向右滑动，显示上一张图片
        switchSloganPrev()
      } else {
        // 向左滑动，显示下一张图片
        switchSloganNext()
      }
    }
  }

  // 暴露获取当前图片地址的方法
  const getCurrentSloganImage = () => {
    return currentSloganImage.value
  }

  // 暴露方法给父组件
  defineExpose({
    getCurrentSloganImage,
  })
</script>

<style scoped lang="scss">
  .text-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    color: #fff;
    white-space: nowrap;

    .slogon-bg {
      width: 430rpx;
      height: 135rpx;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
    }

    // 新增的滑动容器
    .swipe-container {
      // border: 1px solid #ffffff;
      width: 100%;
      height: 100%;
      position: relative;
      // 扩大触摸区域
      padding: 20rpx;
      margin: -20rpx;
      // 确保触摸事件能够被捕获
      touch-action: pan-y; // 允许垂直滚动，但处理水平滑动
      .tip-slogan {
        position: absolute;
        top: 8%;
        left: 0;
        width: 100%;
        height: 90%;
      }
    }

    .main-text-container {
      width: 420rpx;
      height: 125rpx;
      display: grid;
      // 重新调整位置以适应padding
      padding: 15rpx;

      .slogan {
        width: 85%;
        height: 73%;
        // 添加一些过渡效果
        transition: opacity 0.3s ease;
      }

      .control-icon {
        width: 20rpx;
        height: 30rpx;
        margin-top: 30rpx;
        cursor: pointer;
        // 添加过渡效果
        transition: opacity 0.2s ease;

        &:active {
          opacity: 0.7;
        }
      }

      .control-left {
        text-align: center;
      }

      .control-right {
        text-align: center;
      }
    }
  }

  // 添加一些触摸反馈效果（可选）
  .swipe-container:active {
    .slogan {
      opacity: 0.9;
    }
  }
</style>
