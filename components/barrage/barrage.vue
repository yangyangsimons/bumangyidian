<template>
  <view class="barrage-container">
    <view class="scroll-container">
      <view class="top-mask"></view>
      <scroll-view
        scroll-y
        class="scroll-view"
        :show-scrollbar="false"
        :scroll-with-animation="true"
        :scroll-top="scrollTop"
      >
        <view class="messages-wrapper">
          <view
            v-for="msg in messages"
            :key="msg.id"
            class="message-bubble"
            :class="{ user: msg.type === 'user' }"
          >
            <view class="content-box">
              <text class="content">
                <text class="type"> </text>{{ msg.content }}
              </text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref,
    watch,
    nextTick,
    computed,
    onMounted,
    onUnmounted,
    getCurrentInstance,
  } from 'vue'

  import { useBarrageStore } from '@/stores/barrage'
  const instance = getCurrentInstance() // 获取组件实例
  const barrageStore = useBarrageStore()
  const scrollTop = ref(0)

  // 保留原来的scrollToBottom逻辑，但添加错误处理和内存优化
  const scrollToBottom = async () => {
    await nextTick()

    try {
      const query = uni.createSelectorQuery().in(instance)
      query
        .select('.messages-wrapper')
        .boundingClientRect((wrapperRect) => {
          if (!wrapperRect) return // 防止空对象

          query
            .select('.scroll-view')
            .boundingClientRect((scrollRect) => {
              if (!scrollRect) return // 防止空对象

              // 计算需要滚动的高度 = 内容总高度 - 容器可视高度
              const heightDifference = wrapperRect.height - scrollRect.height
              scrollTop.value = Math.max(0, heightDifference + 50) // 添加安全边距
            })
            .exec()
        })
        .exec()
    } catch (error) {
      console.error('滚动计算出错:', error)
    }
  }

  // 监听消息变化并在组件卸载时清理
  const stopWatch = watch(
    () => barrageStore.messages.length,
    (newVal, oldVal) => {
      if (newVal > oldVal) {
        scrollToBottom() // 直接调用，不使用防抖以保证即时滚动
      }
    }
  )

  // 组件卸载时清理资源
  onUnmounted(() => {
    stopWatch() // 清理监听器
  })

  const messages = computed(() => {
    // 限制日志输出频率
    if (barrageStore.messages.length % 5 === 0) {
      console.log('消息数量:', barrageStore.messages.length)
    }
    return barrageStore.messages
  })
</script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
