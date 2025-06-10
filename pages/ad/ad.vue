<template>
  <view class="agreement-container">
    <web-view :src="adUrl"></web-view>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const adUrl = ref('')

  onMounted(() => {
    // 获取页面参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    adUrl.value = currentPage.options.address
    console.log('广告链接:', adUrl.value)
  })
</script>

<style scopped>
  .agreement-container {
    width: 100%;
    height: 100vh;
  }
</style>
