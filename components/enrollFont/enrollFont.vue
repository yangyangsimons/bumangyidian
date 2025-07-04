<template>
  <view class="text-container">
    <image
      src="../../static/enrollment/slogon-bg.png"
      mode="scaleToFill"
      class="slogon-bg"
    />

    <view class="main-text-container">
      <text class="hash-symbol">#</text>
      <!-- 主标语的编辑功能 -->
      <text v-if="!isEditingSlogan" class="main-text" @tap="startEditSlogan">
        {{ slogan }}
      </text>
      <input
        v-else
        v-model="tempSlogan"
        class="main-text edit-input"
        :focus="isEditingSlogan"
        @blur="finishEditSlogan"
        @confirm="finishEditSlogan"
        maxlength="20"
      />
    </view>

    <view class="myname">
      <text class="name-prefix">我是: </text>
      <!-- 姓名的编辑功能 -->
      <text v-if="!isEditingName" class="main-text" @tap="startEditName">
        {{ userName }}
      </text>
      <input
        v-else
        v-model="tempUserName"
        class="main-text edit-input"
        :focus="isEditingName"
        @blur="finishEditName"
        @confirm="finishEditName"
        maxlength="15"
      />
    </view>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
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

  // 编辑标语
  const startEditSlogan = () => {
    tempSlogan.value = slogan.value
    isEditingSlogan.value = true
  }

  const finishEditSlogan = () => {
    if (tempSlogan.value.trim()) {
      slogan.value = tempSlogan.value.trim()
    }
    isEditingSlogan.value = false
  }

  // 编辑姓名
  const startEditName = () => {
    tempUserName.value = userName.value
    isEditingName.value = true
  }

  const finishEditName = () => {
    if (tempUserName.value.trim()) {
      userName.value = tempUserName.value.trim()
    }
    isEditingName.value = false
  }
</script>

<style scoped lang="scss">
  .text-container {
    font-family: 'SmileySans-Oblique', sans-serif;
    font-size: 40rpx;
    font-style: oblique;
    letter-spacing: 0.1em;
    width: 400rpx;
    height: 150rpx;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    // border: 1px solid #cdf91d;
    color: #fff;
    padding-left: 20rpx;
    white-space: nowrap;

    .slogon-bg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
    }

    .myname {
      font-size: 25rpx;
      margin-top: 3rpx;

      .name-prefix {
        color: #fff;
      }
    }

    .main-text {
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }

    .edit-input {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4rpx;
      padding: 5rpx 10rpx;
      color: #fff;
      font-family: inherit;
      font-size: inherit;
      font-style: inherit;
      letter-spacing: inherit;
      min-width: 200rpx;

      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .hash-symbol {
    color: #cdf91d;
  }
</style>
