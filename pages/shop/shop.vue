<template>
  <view class="shop-container">
    <!-- Loading状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    <cover-view
      class="back-button"
      @tap="goBackToMy"
      v-if="shouldShowCoverImage"
    >
      <!-- iOS系统且为shop页面时使用cover-image -->
      <cover-image
        src="/static/close-shop.png"
        class="back-button-img"
      ></cover-image>
    </cover-view>
    <web-view
      v-show="!isLoading"
      :src="adUrl"
      @load="handleLoad"
      @error="handleError"
    >
    </web-view>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { baseUrl } from '../../utils/config'

  const adUrl = ref('')
  const isLoading = ref(true)
  const backButtonTop = ref(44) // 默认值
  const shouldShowCoverImage = ref(false) // 控制cover-image是否显示

  onMounted(() => {
    // 获取系统信息，计算返回按钮位置
    uni.getSystemInfo({
      success: (res) => {
        // 微信小程序导航栏位置：状态栏高度 + 导航栏内部上边距
        // 一般导航栏高度为44px，按钮距离顶部约6-8px
        backButtonTop.value = res.statusBarHeight + 6

        // 检测系统平台
        const isIOS = res.platform === 'ios'
        console.log('当前系统平台:', res.platform, '是否为iOS:', isIOS)

        // 获取页面参数，判断是否为shop页面
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const isShopPage = !currentPage.options.id // 没有id参数说明是shop页面，有id参数说明是product-detail页面

        console.log('页面参数:', currentPage.options)
        console.log('是否为shop页面:', isShopPage)

        // 只有在iOS系统且为shop页面时才显示cover-image
        shouldShowCoverImage.value = isIOS && isShopPage
        console.log('是否显示cover-image:', shouldShowCoverImage.value)

        // 设置URL
        if (currentPage.options.id) {
          console.log('传递的ID参数:', currentPage.options.id)
          adUrl.value = `${baseUrl}/shop/product-detail/${currentPage.options.id}?token=${currentPage.options.token}`
        } else {
          adUrl.value = `${baseUrl}/shop/shop?token=${currentPage.options.token}`
        }
      },
    })

    console.log('广告链接:', adUrl.value)
  })

  // web-view加载完成
  const handleLoad = () => {
    isLoading.value = false
  }

  // web-view加载失败
  const handleError = () => {
    isLoading.value = false
    // 可以在这里处理错误，比如显示错误信息
    console.error('web-view加载失败')
  }

  // 返回到my页面
  const goBackToMy = () => {
    uni.switchTab({
      url: '/pages/my/my',
    })
  }
</script>

<style scoped lang="scss">
  .shop-container {
    width: 100%;
    height: 100vh;
    position: relative;
    cover-view,
    cover-image,
    image {
      visibility: visible !important;
      z-index: 99999;
    }
    .back-button {
      top: 2rpx !important;
      position: fixed;
      z-index: 99999;
      left: 15px; /* 距离左边距离，与原生返回按钮位置一致 */
      width: 144rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      //半透明背景
      background-color: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(200, 200, 200, 0.5);
      border-radius: 8rpx;

      &:active {
        background-color: #f5f5f5;
      }

      .back-button-img {
        width: 140rpx;
        height: 64rpx;
      }
    }
  }

  .loading-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    z-index: 999;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 16px;
    color: #666;
    font-size: 14px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
