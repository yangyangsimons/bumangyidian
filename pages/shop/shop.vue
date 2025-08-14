<template>
  <view class="shop-container">
    <web-view :src="shopUrl" @message="handleMessage"></web-view>
  </view>
</template>

<script setup>
  import { ref, onLoad } from '@dcloudio/uni-app'

  const shopUrl = ref('')

  onLoad((options) => {
    if (options.url) {
      const url = decodeURIComponent(options.url)
      const token = decodeURIComponent(options.token || '')

      // 如果需要在URL中包含token，可以这样处理
      if (token) {
        const separator = url.includes('?') ? '&' : '?'
        shopUrl.value = `${url}${separator}token=${token}`
      } else {
        shopUrl.value = url
      }
    }
  })

  const handleMessage = (event) => {
    console.log('收到web-view消息:', event.detail.data)
  }
</script>
