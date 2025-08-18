<template>
  <view class="shop-container">
    <!-- Loading状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Web-view -->
    <web-view
      v-show="!isLoading"
      :src="adUrl"
      @load="handleLoad"
      @error="handleError"
    ></web-view>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { baseUrl } from '../../utils/config'

  const adUrl = ref('')
  const isLoading = ref(true)

  onMounted(() => {
    // 获取页面参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage.options.id) {
      console.log('传递的ID参数:', currentPage.options.id)
      adUrl.value = `${baseUrl}/shop/product-detail/${currentPage.options.id}?token=${currentPage.options.token}`
    } else {
      adUrl.value = `${baseUrl}/shop/shop?token=${currentPage.options.token}`
    }
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
</script>

<style scoped>
  .shop-container {
    width: 100%;
    height: 100vh;
    position: relative;
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
