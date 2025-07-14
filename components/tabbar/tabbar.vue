<template>
  <view class="custom-tabbar">
    <view
      v-for="(item, index) in tabbarStore.tabList"
      :key="index"
      :class="['tab-item', { active: tabbarStore.activeIndex === index }]"
      @click="handleTabClick(index)"
    >
      <image
        :src="tabbarStore.activeIndex === index ? item.iconSelected : item.icon"
        :class="['tab-icon', { 'tab-icon-large': item.isLarge }]"
        mode="aspectFill"
      />
      <text
        :class="[
          'tab-text',
          { 'tab-text-active': tabbarStore.activeIndex === index },
        ]"
      >
        {{ item.name }}
      </text>

      <!-- 提示气泡 -->
      <view
        v-if="showTip && tipIndex === index"
        :class="['tip-bubble', { 'tip-bubble-large': item.isLarge }]"
      >
        <text class="tip-text">{{ tipMessage }}</text>
        <view
          :class="['tip-arrow', { 'tip-arrow-large': item.isLarge }]"
        ></view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref } from 'vue'
  import { useTabbarStore } from '@/stores/tabbar'

  const tabbarStore = useTabbarStore()

  // 提示相关的响应式数据
  const showTip = ref(false)
  const tipIndex = ref(-1)
  const tipMessage = ref('')

  // 提示消息数组，可以根据需要自定义
  const tipMessages = [
    '功能即将开放，敬请期待！',
    '新功能正在开发中~',
    '精彩内容即将上线！',
    '敬请期待更多惊喜！',
    '功能升级中，请耐心等待',
  ]

  const handleTabClick = (index) => {
    if (index !== tabbarStore.activeIndex) {
      // 原来的页面跳转功能（暂时注释，开发完后恢复使用）
      // tabbarStore.switchTab(index)

      // 临时功能：只更新activeIndex，不跳转页面
      tabbarStore.activeIndex = index
    }

    // 临时添加：显示提示功能
    showTip.value = true
    tipIndex.value = index
    // 随机选择一个提示消息
    tipMessage.value =
      tipMessages[Math.floor(Math.random() * tipMessages.length)]

    // 2秒后隐藏提示
    setTimeout(() => {
      showTip.value = false
      tipIndex.value = -1
    }, 2000)
  }
</script>

<style scoped>
  .custom-tabbar {
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    height: 140rpx;
    background-color: #fff;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
  }

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20rpx 0;
    position: relative; /* 为提示气泡定位 */
  }

  .tab-icon {
    width: 40rpx;
    height: 40rpx;
    margin-bottom: 8rpx;
  }
  .tab-icon-large {
    width: 108rpx;
    height: 108rpx;
    margin-top: -32rpx;
  }

  .tab-text {
    font-size: 20rpx;
    color: rgba(185, 187, 188, 1);
    font-weight: 400;
    transition: color 0.5s;
  }
  .tab-text-active {
    color: rgba(43, 57, 58, 1);
    font-weight: 400;
  }

  /* 临时添加：提示气泡样式 */
  .tip-bubble {
    position: absolute;
    bottom: 120rpx;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12rpx 20rpx;
    border-radius: 8rpx;
    white-space: nowrap;
    z-index: 1000;
    animation: tipFadeIn 0.3s ease-out;
  }

  .tip-bubble-large {
    bottom: 160rpx; /* 大图标的气泡位置调整 */
  }

  .tip-text {
    font-size: 24rpx;
    line-height: 1.2;
  }

  /* 气泡箭头 */
  .tip-arrow {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 12rpx solid transparent;
    border-right: 12rpx solid transparent;
    border-top: 12rpx solid rgba(0, 0, 0, 0.8);
  }

  .tip-arrow-large {
    /* 大图标的箭头样式保持一致 */
  }

  /* 提示动画 */
  @keyframes tipFadeIn {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(10rpx);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
