<template>
  <view class="agreement-container">
    <web-view :src="agreementUrl"></web-view>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const agreementUrl = ref('')

  onMounted(() => {
    // 获取页面参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const type = currentPage.options.type || 'user'

    // 设置对应的URL
    if (type === 'user') {
      agreementUrl.value = 'https://mang.5gradio.com.cn/protocol/user_agreement'
    } else {
      agreementUrl.value = 'https://mang.5gradio.com.cn/protocol/privacy'
    }
  })
</script>

<style>
  .agreement-container {
    width: 100%;
    height: 100vh;
  }
</style>
