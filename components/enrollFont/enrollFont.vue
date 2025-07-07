<template>
  <view class="text-container">
    <image
      src="../../static/enrollment/slogon-bg.png"
      mode="scaleToFill"
      class="slogon-bg"
    />

    <view class="main-text-container">
      <view class="control-left" @click="switchSloganPrev">
        <image
          src="../../static/enrollment/slogan/left.png"
          mode="scaleToFill"
          class="control-icon"
        />
      </view>

      <image class="slogan" :src="currentSloganImage" mode="scaleToFill" />
      <view class="control-right" @click="switchSloganNext">
        <image
          src="../../static/enrollment/slogan/right.png"
          mode="scaleToFill"
          class="control-icon"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed, onMounted, defineExpose } from 'vue' // 添加 defineExpose
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'

  // 页面显示时
  onShow(() => {
    console.log('组件已显示')
  })

  // 响应式数据
  const slogan = ref('月光是我的补光灯')
  const userName = ref('午夜光合作用者')

  // 编辑状态
  const isEditingSlogan = ref(false)
  const isEditingName = ref(false)

  // 临时编辑内容
  const tempSlogan = ref('')
  const tempUserName = ref('')

  // slogan图片相关
  const currentSloganIndex = ref(1) // 当前图片索引，从1开始
  const maxSloganCount = 9 // 总共9张图片

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
  // 样式代码保持不变
  .text-container {
    width: 420rpx;
    height: 125rpx;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    color: #fff;
    white-space: nowrap;

    .slogon-bg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
    }
    .main-text-container {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 1.5fr 7fr 1.5fr;

      .slogan {
        width: 95%;
        height: 80%;
        margin: auto 0;
      }
      .control-icon {
        width: 20rpx;
        height: 30rpx;
        margin-top: 30rpx;
        cursor: pointer;
      }
      .control-left {
        text-align: center;
      }
      .control-right {
        text-align: center;
      }
    }
  }
</style>
