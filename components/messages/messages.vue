<template>
  <view class="my-message">
    <!-- 如果有消息数据，循环渲染每条消息 -->
    <scroll-view
      v-if="messageData.length > 0"
      scroll-y="true"
      class="my-message-container"
      bounces="true"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @scroll="onScroll"
    >
      <!-- pull-wrapper 会在顶部下拉时做 translateY 动画，产生回弹效果 -->
      <view
        class="pull-wrapper"
        :class="{ dragging: dragging }"
        :style="{
          transform: `translate3d(0, ${translateY}px, 0)`,
        }"
      >
        <view
          v-for="(message, index) in approvedMessages"
          :key="index"
          class="my-message-item"
        >
          <view class="my-message-header">
            <view class="avator">
              <image :src="message.avator"></image>
            </view>
            <view class="info-container">
              <view class="user-info-setting">
                <view class="user-info">
                  <view class="name">{{ message.user_name }}</view>
                  <view class="date">{{ message.created_at }}</view>
                </view>
              </view>
              <view class="like-container" @click="toggleLike(message)">
                <view class="text">{{ message.liked_count }}</view>
                <view class="like">
                  <image
                    :src="getLikeImageSrc(message)"
                    mode="aspectFill"
                  ></image>
                </view>
              </view>
            </view>
          </view>
          <view class="my-message-content">
            <view class="content">{{ message.content }}</view>
          </view>
        </view>
        <!-- 底部 overscroll 渐变 gap（长内容时启用） -->
        <view
          class="overscroll-gap"
          v-show="bottomGap > 0"
          :style="{ height: bottomGap + 'px' }"
        />
      </view>
    </scroll-view>

    <!-- 空状态显示 -->
    <view class="empty" v-else>
      <image
        class="empty-message"
        src="../../static/my/empty-message.png"
      ></image>
    </view>

    <!-- 留言输入区域 -->
    <view class="sendMessage">
      <input
        type="text"
        v-model="replyMessage"
        placeholder="请输入留言内容"
        @keyup.enter="sendMessage"
        :disabled="isSubmitting"
      />
      <view
        class="send-icon"
        @click="sendMessage"
        :class="{ disabled: isSubmitting }"
      >
        {{ isSubmitting ? '发送中...' : '发送' }}
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref, onMounted, computed, nextTick, getCurrentInstance } from 'vue'
  import request from '@/utils/request.js'
  import { baseUrl } from '@/utils/config'
  import { useMusicStore } from '@/stores/music'

  const messageData = ref([])
  const replyMessage = ref('')
  const isSubmitting = ref(false)

  // 回弹/overscroll 状态
  const startY = ref(0)
  const translateY = ref(0)
  const dragging = ref(false)
  const maxPull = 200
  const scrollTop = ref(0)
  const overscrollMode = ref('none') // none | top | bottom
  const overscrollStartY = ref(0)
  const bottomGap = ref(0) // 底部渐变 gap 高度（仅长内容）
  const containerHeight = ref(0)
  const contentHeight = ref(0)
  const vm = getCurrentInstance()
  const bottomUsesGap = ref(true)

  // rAF 兼容（某些端可能不存在 requestAnimationFrame）
  const rAF = (cb) =>
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(cb)
      : setTimeout(cb, 16)
  // 节流状态
  let ticking = false
  let pendingTouchEvent = null
  // 上次应用的值（减少微小抖动）
  let lastAppliedY = 0
  let lastAppliedGap = 0

  // 判定参数
  const BOTTOM_TOLERANCE_PX = 30
  const TABBAR_HEIGHT_RPX = 120
  const INPUT_BLOCK_TOTAL_RPX = 320 // 静态底部 padding 预留 (tabbar + 输入框 + 缓冲)
  const { windowWidth } = uni.getSystemInfoSync()
  const rpx2px = (r) => (windowWidth / 750) * r
  const RESERVED_BOTTOM_PX = rpx2px(INPUT_BLOCK_TOTAL_RPX) // 用于底部判定

  const isContentShort = () =>
    contentHeight.value &&
    containerHeight.value &&
    contentHeight.value <= containerHeight.value + 2
  // 根据点赞状态返回对应的图片地址
  const getLikeImageSrc = (message) => {
    return message.liked
      ? '../../static/my/like.png'
      : '../../static/my/like-false.png'
  }

  // 触摸/滚动处理：实现下拉拉伸与回弹
  const onTouchStart = (e) => {
    const touches = e.touches || (e.changedTouches && e.changedTouches)
    if (!touches || !touches[0]) return
    startY.value = touches[0].clientY
    dragging.value = false
    overscrollMode.value = 'none'
    overscrollStartY.value = 0
    // 重置上次应用的值
    lastAppliedY = 0
    lastAppliedGap = 0
  }

  const onTouchMove = (e) => {
    pendingTouchEvent = e
    if (ticking) return
    ticking = true
    rAF(() => {
      const evt = pendingTouchEvent
      pendingTouchEvent = null
      const touches =
        evt && (evt.touches || (evt.changedTouches && evt.changedTouches))
      if (!touches || !touches[0]) {
        ticking = false
        return
      }
      const currentY = touches[0].clientY
      const dy = currentY - startY.value
      const minTrigger = 8

      // 初始判定（增加 2px 迟滞，减少误触）
      if (overscrollMode.value === 'none') {
        // 改进顶部判定：更宽松的条件，考虑小误差
        if (dy > minTrigger + 2 && (scrollTop.value <= 5 || isContentShort())) {
          overscrollMode.value = 'top'
        } else if (
          dy < -(minTrigger + 2) &&
          (isNearBottom(scrollTop.value) || isContentShort())
        ) {
          overscrollMode.value = 'bottom'
          overscrollStartY.value = currentY
          bottomUsesGap.value = !isContentShort()
        }
      }

      let updated = false
      // 顶部模式
      if (overscrollMode.value === 'top') {
        const pull = dy - minTrigger
        if (pull > 0) {
          const resisted = Math.min(maxPull, applyDamping(pull))
          if (Math.abs(resisted - lastAppliedY) > 0.5) {
            // 降低阈值，让动画更流畅
            translateY.value = resisted
            lastAppliedY = resisted
            updated = true
          }
          dragging.value = true
          evt.preventDefault()
          evt.stopPropagation()
        } else {
          // 如果拉动距离不够，重置状态
          if (translateY.value > 0) {
            translateY.value = 0
            lastAppliedY = 0
          }
        }
      }

      // 底部模式
      if (overscrollMode.value === 'bottom') {
        if (!overscrollStartY.value) overscrollStartY.value = currentY
        const raw = overscrollStartY.value - currentY // 正值
        if (raw > 0) {
          const resisted = Math.min(maxPull, applyDamping(raw))
          if (bottomUsesGap.value) {
            if (Math.abs(resisted - lastAppliedGap) > 0.5) {
              bottomGap.value = resisted
              lastAppliedGap = resisted
              updated = true
            }
            if (translateY.value !== 0) translateY.value = 0
          } else {
            const neg = -resisted
            if (Math.abs(neg - lastAppliedY) > 0.5) {
              translateY.value = neg
              lastAppliedY = neg
              updated = true
            }
          }
          dragging.value = true
          evt.preventDefault()
          evt.stopPropagation()
        } else {
          // 如果拉动距离不够，重置状态
          if (bottomUsesGap.value && bottomGap.value > 0) {
            bottomGap.value = 0
            lastAppliedGap = 0
          } else if (!bottomUsesGap.value && translateY.value < 0) {
            translateY.value = 0
            lastAppliedY = 0
          }
        }
      }

      if (!updated && dragging.value) {
        // 没有显著变化，避免无意义刷新
      }
      ticking = false
    })
  }

  const onTouchEnd = () => {
    // 统一处理，存在偏移或 gap 都回弹
    if (translateY.value !== 0 || bottomGap.value !== 0) {
      animateBack()
    } else {
      // 即使没有明显偏移，也要重置状态
      dragging.value = false
      overscrollMode.value = 'none'
      overscrollStartY.value = 0
    }
  }

  const animateBack = () => {
    // 使用过渡 CSS 控制回弹动画，通过设置 translateY -> 0
    translateY.value = 0
    dragging.value = false
    bottomGap.value = 0
    overscrollStartY.value = 0
    overscrollMode.value = 'none'
    // 重置上次应用的值
    lastAppliedY = 0
    lastAppliedGap = 0
  }

  // 滚动事件处理
  const onScroll = (e) => {
    const detail = e.detail || {}
    const newScrollTop = detail.scrollTop || 0

    // 保存上一次的scrollTop用于比较
    const oldScrollTop = scrollTop.value
    scrollTop.value = newScrollTop

    if (detail.scrollHeight && detail.scrollHeight !== contentHeight.value) {
      contentHeight.value = detail.scrollHeight
    }

    // 改进回弹逻辑：只在非拖拽状态且有明显滚动变化时才回弹
    if (!dragging.value && overscrollMode.value !== 'none') {
      // 检查是否有有效的滚动动作（表示用户正在正常滚动）
      const hasScrollMovement = Math.abs(newScrollTop - oldScrollTop) > 1

      if (
        hasScrollMovement &&
        (translateY.value !== 0 || bottomGap.value !== 0)
      ) {
        animateBack()
      }
    }
  }

  const applyDamping = (d) => {
    if (d <= 60) return d * 0.8
    if (d <= 120) return 48 + (d - 60) * 0.5
    return 78 + Math.sqrt(d - 120) * 6
  }

  const isNearBottom = (scrollVal) => {
    if (!containerHeight.value) return false
    const remaining = contentHeight.value - (scrollVal + containerHeight.value)
    return remaining <= BOTTOM_TOLERANCE_PX + RESERVED_BOTTOM_PX
  }

  const measureHeights = () => {
    uni
      .createSelectorQuery()
      .in(vm)
      .select('.my-message-container')
      .boundingClientRect((rect) => {
        if (rect && rect.height) containerHeight.value = rect.height
      })
      .exec()
  }
  //点赞和取消点赞
  const toggleLike = async (message) => {
    //发送请求
    const response = await request(`${baseUrl}/leave_msg/like`, 'POST', {
      leave_msg_id: message.id,
    })
    if (response.data.liked) {
      uni.showToast({
        title: '点赞成功',
        icon: 'success',
      })
    } else {
      uni.showToast({
        title: '已取消点赞',
        icon: 'none',
      })
    }
    //刷新一下列表
    await loadData()
  }

  // 计算属性：只显示已审核通过的留言
  const approvedMessages = computed(() => {
    return messageData.value.filter((message) => message.status === 1)
  })

  // 发送留言
  const sendMessage = async () => {
    // 防止重复提交
    if (isSubmitting.value) {
      return
    }

    // 验证输入内容
    if (!replyMessage.value.trim()) {
      uni.showToast({
        title: '请输入留言内容',
        icon: 'none',
      })
      return
    }

    // 内容长度限制
    if (replyMessage.value.trim().length > 500) {
      uni.showToast({
        title: '留言内容不能超过500字',
        icon: 'none',
      })
      return
    }

    isSubmitting.value = true

    try {
      const response = await request(`${baseUrl}/leave_msg/leave_msg`, 'POST', {
        msg: replyMessage.value.trim(),
      })

      if (response.code === 0) {
        uni.showToast({
          title: '留言提交成功,审核通过后可见',
          icon: 'success',
        })
        replyMessage.value = ''
        // 重新加载数据
        await loadData()
      } else {
        uni.showToast({
          title: response.msg || '留言提交失败',
          icon: 'none',
        })
      }
    } catch (error) {
      console.error('发送留言失败:', error)
      uni.showToast({
        title: '网络错误，请稍后再试',
        icon: 'none',
      })
    } finally {
      isSubmitting.value = false
    }
  }

  // const mockData = [
  //   {
  //     avator:
  //       'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
  //     content: '我觉得这个 app使用起来很不错，点赞',
  //     created_at: '2025-08-16 00:15:38',
  //     id: 1,
  //     liked: true,
  //     liked_count: 1,
  //     reply_content: '通过',
  //     status: 1,
  //     user_name: 'BMYD11',
  //   },
  //   {
  //     avator:
  //       'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
  //     content: '我觉得这个 app使用起来很不错，点赞',
  //     created_at: '2025-08-16 00:15:38',
  //     id: 2,
  //     liked: true,
  //     liked_count: 1,
  //     reply_content: '通过',
  //     status: 1,
  //     user_name: 'BMYD11',
  //   },
  //   {
  //     avator:
  //       'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
  //     content: '我觉得这个 app使用起来很不错，点赞',
  //     created_at: '2025-08-16 00:15:38',
  //     id: 3,
  //     liked: true,
  //     liked_count: 1,
  //     reply_content: '通过',
  //     status: 1,
  //     user_name: 'BMYD11',
  //   },
  //   {
  //     avator:
  //       'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
  //     content: '我觉得这个 app使用起来很不错，点赞',
  //     created_at: '2025-08-16 00:15:38',
  //     id: 4,
  //     liked: true,
  //     liked_count: 1,
  //     reply_content: '通过',
  //     status: 1,
  //     user_name: 'BMYD11',
  //   },
  //   {
  //     avator:
  //       'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
  //     content: '我觉得这个 app使用起来很不错，点赞',
  //     created_at: '2025-08-16 00:15:38',
  //     id: 5,
  //     liked: true,
  //     liked_count: 1,
  //     reply_content: '通过',
  //     status: 1,
  //     user_name: 'BMYD11',
  //   },
  //   {
  //     avator:
  //       'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
  //     content: '我觉得这个 app使用起来很不错，点赞',
  //     created_at: '2025-08-16 00:15:38',
  //     id: 6,
  //     liked: true,
  //     liked_count: 1,
  //     reply_content: '通过',
  //     status: 1,
  //     user_name: 'BMYD11',
  //   },
  //   {
  //     avator:
  //       'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
  //     content: '我觉得这个 app使用起来很不错，点赞',
  //     created_at: '2025-08-16 00:15:38',
  //     id: 7,
  //     liked: true,
  //     liked_count: 1,
  //     reply_content: '通过',
  //     status: 1,
  //     user_name: 'BMYD11',
  //   },
  //   {
  //     avator:
  //       'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
  //     content: '我觉得这个 app使用起来很不错，点赞',
  //     created_at: '2025-08-16 00:15:38',
  //     id: 8,
  //     liked: true,
  //     liked_count: 1,
  //     reply_content: '通过',
  //     status: 1,
  //     user_name: 'BMYD11',
  //   },
  // ]
  // 加载数据的方法
  const loadData = async () => {
    console.log('开始加载留言数据')

    try {
      // 获取留言信息
      const messageInfo = await request(
        `${baseUrl}/leave_msg/get_leave_msg_list`,
        'GET'
      )
      console.log('获取到的留言信息:', messageInfo)

      if (messageInfo.code === 0 && messageInfo.data) {
        // 确保数据结构正确
        if (Array.isArray(messageInfo.data)) {
          messageData.value = messageInfo.data
        } else if (
          messageInfo.data.data &&
          Array.isArray(messageInfo.data.data)
        ) {
          messageData.value = messageInfo.data.data
          // messageData.value = mockData
        } else {
          messageData.value = []
        }
        console.log('留言数据加载完成，数据长度:', messageData.value.length)
        await nextTick()
        measureHeights()
      } else {
        console.log('获取留言数据失败:', messageInfo.msg || '未知错误')
        messageData.value = []
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      messageData.value = []
      uni.showToast({
        title: '加载数据失败',
        icon: 'none',
      })
    }
  }

  // 组件挂载时加载数据
  onMounted(() => {
    console.log('Messages组件已挂载')
    loadData()
    // 初次测量兜底
    setTimeout(() => measureHeights(), 80)

    // 添加兜底回弹机制，防止某些情况下状态卡住
    const checkAndResetStates = () => {
      // 如果长时间保持拖拽状态但没有实际变化，强制重置
      if (
        !dragging.value &&
        (translateY.value !== 0 || bottomGap.value !== 0)
      ) {
        setTimeout(() => {
          if (translateY.value !== 0 || bottomGap.value !== 0) {
            animateBack()
          }
        }, 500) // 0.5秒后检查
      }
    }

    // 每隔一段时间检查状态
    setInterval(checkAndResetStates, 2000)
  })

  // 暴露方法，以便父组件调用
  defineExpose({
    loadData,
    sendMessage,
  })
</script>

<style lang="scss" scoped>
  @import './index.scss';

  .pull-wrapper {
    transition: transform 0.4s cubic-bezier(0.22, 0.8, 0.2, 1);
    will-change: transform;
  }

  /* 当正在拖动时，去除 transition，让位移跟随手势更灵敏 */
  .pull-wrapper.dragging {
    transition: none;
  }

  /* 底部渐变gap的过渡效果 */
  .overscroll-gap {
    transition: height 0.4s cubic-bezier(0.22, 0.8, 0.2, 1);
  }

  /* 可选：在拖动时给列表顶部留白，避免图片被拉出圆角 */
  .my-message-item:first-child {
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
  }

  /* 增强消息项的交互效果 */
  .my-message-item {
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    }
  }

  .sendMessage {
    .send-icon.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }
</style>
