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
      @touchcancel="onTouchEnd"
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
        <!-- 移除底部 overscroll gap，因为不再使用 -->
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
  // 移除不再使用的 bottomGap 相关变量
  const containerHeight = ref(0)
  const contentHeight = ref(0)
  const vm = getCurrentInstance()

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
  // 弹性动画状态
  let springing = false
  const USE_SPRING_BACK = true // 可切换是否使用物理弹簧回弹

  // 判定参数
  const BOTTOM_TOLERANCE_PX = 30
  const TABBAR_HEIGHT_RPX = 120
  const INPUT_BLOCK_TOTAL_RPX = 320 // 静态底部 padding 预留 (tabbar + 输入框 + 缓冲)
  const { windowWidth } = uni.getSystemInfoSync()
  const rpx2px = (r) => (windowWidth / 750) * r
  const RESERVED_BOTTOM_PX = rpx2px(INPUT_BLOCK_TOTAL_RPX) // 用于底部判定
  const BOTTOM_PADDING_RPX = 200 // 与样式中 .my-message-container padding-bottom 保持一致
  const BOTTOM_PADDING_PX = rpx2px(BOTTOM_PADDING_RPX)

  const isContentShort = () => {
    if (!contentHeight.value || !containerHeight.value) {
      return true
    }
    // 扣除底部 padding 后的有效内容高度
    const effectiveContent = Math.max(
      0,
      contentHeight.value - BOTTOM_PADDING_PX
    )
    const isShort = effectiveContent <= containerHeight.value + 10
    // 调试
    // console.log('内容高度判断:', {
    //   rawContentHeight: contentHeight.value,
    //   effectiveContent,
    //   bottomPaddingPx: BOTTOM_PADDING_PX,
    //   containerHeight: containerHeight.value,
    //   isShort,
    //   scrollTop: scrollTop.value,
    // })
    return isShort
  }

  const isAtTop = () => scrollTop.value <= 2
  const visibleContentHeight = () =>
    Math.max(0, contentHeight.value - BOTTOM_PADDING_PX)
  const isAtBottom = () => {
    if (!containerHeight.value) return false
    return scrollTop.value + containerHeight.value >= visibleContentHeight() - 2
  }
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
      // 触发阈值（适当降低，提升灵敏度）
      const minTrigger = 5

      // 初始判定（增加 2px 迟滞，减少误触）
      if (overscrollMode.value === 'none') {
        // console.log('触摸判定:', {
        //   dy,
        //   scrollTop: scrollTop.value,
        //   isContentShort: isContentShort(),
        // })

        // 顶部下拉回弹：在顶部或内容不足一屏时允许
        if (dy > minTrigger + 2 && (isAtTop() || isContentShort())) {
          overscrollMode.value = 'top'
          console.log('激活顶部回弹模式')
        }
        // 底部上拉回弹：只在内容不足一屏或接近底部时允许
        else if (dy < -(minTrigger + 2) && (isContentShort() || isAtBottom())) {
          overscrollMode.value = 'bottom'
          overscrollStartY.value = currentY
          console.log('激活底部回弹模式')
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
            // console.log('顶部回弹更新:', {
            //   pull,
            //   resisted,
            //   translateY: translateY.value,
            // })
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

      // 底部模式 - 只在内容不足一屏时生效
      if (overscrollMode.value === 'bottom') {
        if (!overscrollStartY.value) overscrollStartY.value = currentY
        const raw = overscrollStartY.value - currentY // 正值
        if (raw > 0) {
          const resisted = Math.min(maxPull, applyDamping(raw))
          // 内容不足一屏时，使用 translateY 负值来实现上拉效果
          const neg = -resisted
          if (Math.abs(neg - lastAppliedY) > 0.5) {
            translateY.value = neg
            lastAppliedY = neg
            updated = true
            // console.log('底部回弹更新:', {
            //   raw,
            //   resisted,
            //   neg,
            //   translateY: translateY.value,
            // })
          }
          dragging.value = true
          evt.preventDefault()
          evt.stopPropagation()
        } else {
          // 如果拉动距离不够，重置状态
          if (translateY.value < 0) {
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
    if (springing) return // 动画过程中再次结束手势忽略
    // 松手立即结束拖拽状态，让 transition 生效
    dragging.value = false
    if (translateY.value !== 0) {
      animateBack()
    } else {
      overscrollMode.value = 'none'
      overscrollStartY.value = 0
    }
    // 兜底：300ms 后仍未复位则强制复位（防丢失 touchend / 某些端 transition 异常）
    setTimeout(() => {
      if (!dragging.value && translateY.value !== 0) {
        console.warn('触发兜底复位 translateY')
        translateY.value = 0
        overscrollMode.value = 'none'
        overscrollStartY.value = 0
      }
    }, 300)
  }

  const animateBack = () => {
    const currentY = translateY.value
    if (currentY === 0) {
      overscrollMode.value = 'none'
      return
    }
    dragging.value = false
    overscrollStartY.value = 0
    lastAppliedY = 0

    if (USE_SPRING_BACK) {
      springing = true
      let y = currentY
      let v = 0
      const target = 0
      const stiffness = 0.06 // 弹性系数（越大越紧）
      const damping = 0.75 // 阻尼 (0-1) 越小越有弹性
      const threshold = 0.4
      const step = () => {
        const force = -(y - target) * stiffness
        v += force
        v *= damping
        y += v
        translateY.value = y
        if (Math.abs(y - target) < threshold && Math.abs(v) < threshold) {
          translateY.value = 0
          overscrollMode.value = 'none'
          springing = false
          return
        }
        rAF(step)
      }
      rAF(step)
    } else {
      // 使用 CSS 过渡，先强制刷新再置 0，保证有动画
      const prev = translateY.value
      // 保险：下一帧再设 0，避免 drag->transition 切换被忽略
      rAF(() => {
        translateY.value = 0
        overscrollMode.value = 'none'
      })
      setTimeout(() => {
        if (translateY.value !== 0) translateY.value = 0
      }, 450)
    }
  }

  // 滚动事件处理
  const onScroll = (e) => {
    const detail = e.detail || {}
    const newScrollTop = detail.scrollTop || 0

    // 保存上一次的scrollTop用于比较
    const oldScrollTop = scrollTop.value
    scrollTop.value = newScrollTop

    // 更新内容高度 - 使用scrollHeight是更准确的内容高度
    if (detail.scrollHeight && detail.scrollHeight !== contentHeight.value) {
      contentHeight.value = detail.scrollHeight
      console.log('从滚动事件更新内容高度:', detail.scrollHeight)
    }

    // 改进回弹逻辑：只在非拖拽状态且有明显滚动变化时才回弹
    if (!dragging.value && overscrollMode.value !== 'none') {
      // 检查是否有有效的滚动动作（表示用户正在正常滚动）
      const hasScrollMovement = Math.abs(newScrollTop - oldScrollTop) > 1

      if (hasScrollMovement && translateY.value !== 0) {
        animateBack()
      }
    }
  }

  // 更平滑的阻尼函数：指数趋近最大值
  const applyDamping = (d) => {
    const MAX = maxPull
    const eased = MAX * (1 - Math.exp(-d / 140)) // 调整数值改变手感
    return Math.min(MAX, eased)
  }

  const isNearBottom = (scrollVal) => {
    if (!containerHeight.value) return false
    const remaining = contentHeight.value - (scrollVal + containerHeight.value)
    return remaining <= BOTTOM_TOLERANCE_PX + RESERVED_BOTTOM_PX
  }

  const measureHeights = () => {
    const query = uni.createSelectorQuery().in(vm)

    // 测量容器高度
    query.select('.my-message-container').boundingClientRect((rect) => {
      if (rect && rect.height) {
        containerHeight.value = rect.height
        console.log('容器高度测量:', rect.height)
      }
    })

    // 测量内容高度
    query.select('.pull-wrapper').boundingClientRect((rect) => {
      if (rect && rect.height) {
        contentHeight.value = rect.height
        // console.log('内容高度测量:', rect.height)
      }
    })

    query.exec()
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
        // 数据更新后重新测量高度
        setTimeout(() => {
          measureHeights()
        }, 100) // 给一些时间让DOM更新
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

    // 多次测量高度，确保能获取到正确的值
    setTimeout(() => measureHeights(), 80)
    setTimeout(() => measureHeights(), 200)
    setTimeout(() => measureHeights(), 500)

    // 添加兜底回弹机制，防止某些情况下状态卡住
    const checkAndResetStates = () => {
      // 如果长时间保持拖拽状态但没有实际变化，强制重置
      if (!dragging.value && translateY.value !== 0) {
        setTimeout(() => {
          if (translateY.value !== 0) {
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
