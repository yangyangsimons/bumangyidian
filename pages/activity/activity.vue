<template>
  <view class="activity-container">
    <uni-nav-bar
      :fixed="true"
      :status-bar="true"
      :shadow="false"
      background-color="rgba(255, 255, 255, 0)"
      color="#333"
      :border="false"
      leftWidth="0"
      title="活动"
    >
    </uni-nav-bar>
    <image src="/static/my/bg.png" mode="scaleToFill" class="bg" />
    <scroll-view
      scroll-y="true"
      class="activity-list"
      bounces="true"
      :lower-threshold="50"
      :upper-threshold="50"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @scroll="onScroll"
      @scrolltolower="onScrollToLower"
      @scrolltoupper="onScrollToUpper"
    >
      <!-- pull-wrapper 会在顶部下拉时做 translateY 动画，产生回弹效果 -->
      <view
        class="pull-wrapper"
        :class="{ dragging: dragging }"
        :style="{
          transform: `translateY(${translateY}px)`,
        }"
      >
        <view
          class="activity-item"
          :class="{ 'top-item': item.is_top }"
          v-for="item in sortedActivityList"
          :key="item.id"
          @click="handleActivityClick(item)"
        >
          <image
            :src="item.pic"
            class="activity-image"
            mode="aspectFill"
            :lazy-load="true"
          />
        </view>
        <!-- 底部 overscroll 空白渐变层（放在内容后方，随内容高度扩展） -->
        <view class="overscroll-gap" :style="{ height: bottomGap + 'px' }" />
      </view>
    </scroll-view>
    <!-- 空状态 -->
    <view
      v-if="sortedActivityList.length === 0 && !loading"
      class="empty-state"
    >
      <text class="empty-text">暂无活动信息</text>
    </view>
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
    <tabbar />
  </view>
</template>

<script setup>
  import { ref, computed, getCurrentInstance, nextTick } from 'vue'
  import { onShow, onHide } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import { baseUrl } from '@/utils/config'
  import tabbar from '@/components/tabbar/tabbar.vue'
  const triggered = ref(false)
  // 配置：底部判定的容忍像素（防止必须精确到底才触发）、tabbar 语义值
  const BOTTOM_TOLERANCE_PX = 30
  const TABBAR_HEIGHT_RPX = 120
  // 计算 tabbar 像素高度（基于 750 设计稿宽度换算）
  const { windowWidth } = uni.getSystemInfoSync()
  const TABBAR_HEIGHT_PX = (windowWidth / 750) * TABBAR_HEIGHT_RPX
  const activityList = ref([])
  const loading = ref(false)
  // 下拉和上拉回弹相关状态
  const startY = ref(0)
  const translateY = ref(0)
  const dragging = ref(false)
  // 统一的回弹模式：none | top | bottom
  const overscrollMode = ref('none')
  const startScrollTop = ref(0)
  const bottomGap = ref(0)
  const overscrollStartY = ref(0) // 进入 overscroll(bottom) 当时的手指 Y
  const maxPull = 200 // 最大可拉距离（像素）
  const scrollTop = ref(0) // 记录滚动位置
  const isAtTop = ref(true) // 是否在顶部
  const isAtBottom = ref(false) // 是否在底部
  // 可视区域与内容高度，用于精准判断是否到底部（兼容内容不足一屏场景）
  const containerHeight = ref(0)
  const contentHeight = ref(0)
  const maxScroll = ref(0) // scrollHeight - containerHeight 缓存
  const bottomUsesGap = ref(true) // 短内容时 bottom 不使用 gap，改用 translateY 形成对称回弹
  const isContentShort = () =>
    !!containerHeight.value &&
    !!contentHeight.value &&
    contentHeight.value <= containerHeight.value + 2 // 容差 2px
  const vm = getCurrentInstance()

  // 计算属性：排序后的活动列表（置顶的排在前面）
  const sortedActivityList = computed(() => {
    return [...activityList.value].sort((a, b) => {
      // 如果 a 是置顶而 b 不是，a 排在前面
      if (a.is_top && !b.is_top) {
        return -1
      }
      // 如果 b 是置顶而 a 不是，b 排在前面
      if (b.is_top && !a.is_top) {
        return 1
      }
      // 如果都是置顶或都不是置顶，按创建时间倒序排列（新的在前）
      return new Date(b.created_at) - new Date(a.created_at)
    })
  })

  // 点击活动项
  const handleActivityClick = (item) => {
    const adUrl = item.link || ''
    if (adUrl.includes('pages')) {
      // 确保路径以 / 开头
      const localUrl = adUrl.startsWith('/') ? adUrl : `/${adUrl}`
      console.log('跳转到本地页面:', localUrl)

      uni.navigateTo({
        url: localUrl,
        success: () => {
          console.log('跳转成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
        },
      })
      return
    }
    if (item.link) {
      // 跳转到活动链接
      uni.navigateTo({
        url: `/pages/ad/ad?address=${item.link}&title=${encodeURIComponent(
          item.title
        )}`,
      })
    }
  }

  // 触摸/滚动处理：实现下拉和上拉拉伸与回弹
  const onTouchStart = (e) => {
    const touches = e.touches || (e.changedTouches && e.changedTouches)
    if (!touches || !touches[0]) return
    startY.value = touches[0].clientY
    dragging.value = false
    overscrollMode.value = 'none'
    startScrollTop.value = scrollTop.value
  }

  const onTouchMove = (e) => {
    const touches = e.touches || (e.changedTouches && e.changedTouches)
    if (!touches || !touches[0]) return
    const currentY = touches[0].clientY
    const dy = currentY - startY.value

    // 设置最小触发距离，避免轻微触摸导致的抖动
    const minTriggerDistance = 10

    // 进入模式判定（只判定一次）
    if (overscrollMode.value === 'none') {
      const atTopNow = scrollTop.value <= 5 || isAtTop.value
      if (
        dy > minTriggerDistance &&
        (startScrollTop.value <= 5 || atTopNow || isContentShort())
      ) {
        overscrollMode.value = 'top'
      } else if (
        dy < -minTriggerDistance &&
        (isNearBottom(startScrollTop.value) ||
          isNearBottom(scrollTop.value) ||
          isAtBottom.value)
      ) {
        overscrollMode.value = 'bottom'
        bottomUsesGap.value = !isContentShort()
        overscrollStartY.value = currentY
      } else if (dy < -minTriggerDistance && isContentShort()) {
        overscrollMode.value = 'bottom'
        bottomUsesGap.value = false
        overscrollStartY.value = currentY
      }
    }

    if (overscrollMode.value === 'top') {
      const pull = dy - minTriggerDistance
      if (pull <= 0) return
      const resisted = applyDamping(pull)
      translateY.value = Math.min(maxPull, resisted)
      dragging.value = true
      e.preventDefault()
      e.stopPropagation()
      return
    }

    if (overscrollMode.value === 'bottom') {
      if (!overscrollStartY.value) overscrollStartY.value = currentY
      const raw = overscrollStartY.value - currentY
      if (raw <= 0) return
      const resisted = applyDamping(raw)
      if (bottomUsesGap.value) {
        bottomGap.value = Math.min(maxPull, resisted)
        translateY.value = 0
      } else {
        // 短内容：对称处理，使用 translateY 形成向上“拉伸”视觉
        translateY.value = -Math.min(maxPull, resisted)
      }
      dragging.value = true
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // 尚未进入模式时，如果当前已经接近底部并继续上滑，则允许立刻进入 bottom 模式（解决同一手势滑到末尾再上拉的问题）
    if (
      overscrollMode.value === 'none' &&
      dy < -minTriggerDistance &&
      (isNearBottom(scrollTop.value) || isAtBottom.value)
    ) {
      overscrollMode.value = 'bottom'
      overscrollStartY.value = currentY
      // console.log('[overscroll] enter bottom mode (dynamic)')
    }
  }

  const onTouchEnd = () => {
    if (!dragging.value) return
    // 顶部模式：直接回弹
    if (overscrollMode.value === 'top') {
      animateBack()
      return
    }
    // 底部模式：仅收起 gap 高度
    if (overscrollMode.value === 'bottom') {
      if (bottomUsesGap.value) {
        dragging.value = false
        overscrollStartY.value = 0
        bottomGap.value = 0
        overscrollMode.value = 'none'
      } else {
        // translateY 方式复用 animateBack 即可
        animateBack()
      }
      return
    }
  }

  const animateBack = () => {
    // 使用过渡 CSS 控制回弹动画，通过设置 translateY -> 0
    translateY.value = 0
    dragging.value = false
    bottomGap.value = 0
    overscrollStartY.value = 0
    overscrollMode.value = 'none'
  }

  // 移除 requestAnimationFrame 方案，统一用 CSS transition

  // 滚动事件处理
  const onScroll = (e) => {
    const detail = e.detail || {}
    scrollTop.value = detail.scrollTop || 0
    // 仅当高度变化时再写入，减少响应式触发
    if (detail.scrollHeight && detail.scrollHeight !== contentHeight.value) {
      contentHeight.value = detail.scrollHeight
    }
    if (detail.scrollHeight && containerHeight.value) {
      const ms = detail.scrollHeight - containerHeight.value
      if (ms >= 0) maxScroll.value = ms
    }
    // 如果底部模式已结束但状态未重置
    if (
      overscrollMode.value === 'bottom' &&
      bottomGap.value === 0 &&
      !dragging.value
    ) {
      overscrollMode.value = 'none'
      overscrollStartY.value = 0
    }
    updateEdgeStatus()
  }

  // 滚动到底部事件
  const onScrollToLower = () => {
    // 作为兜底（但主逻辑仍由 updateEdgeStatus 计算）
    isAtBottom.value = true
    updateEdgeStatus()
  }

  // 滚动到顶部事件
  const onScrollToUpper = () => {
    isAtTop.value = true
    // 不立即把 isAtBottom 置为 false，短内容场景下仍可能同时在底部
    updateEdgeStatus()
  }

  // 精准更新顶部/底部状态
  const updateEdgeStatus = () => {
    // overscroll bottom 中也更新 isAtTop，底部状态保持 true
    if (
      overscrollMode.value === 'bottom' &&
      bottomUsesGap.value &&
      bottomGap.value > 0
    ) {
      // 正在拉底部，保持底部状态，同时允许顶部实时更新（极短内容）
      isAtTop.value = scrollTop.value <= 5
      isAtBottom.value = true
      return
    }
    isAtTop.value = scrollTop.value <= 5
    if (!containerHeight.value) return
    // 内容不足一屏：上下均可回弹（允许 top 与 bottom 进入）
    if (isContentShort()) {
      isAtTop.value = true
      isAtBottom.value = true
      return
    }
    isAtBottom.value = checkBottom()
    console.log('isAtTop:', isAtTop.value, 'isAtBottom:', isAtBottom.value)
  }

  const checkBottom = () => {
    if (!containerHeight.value) return false
    const remaining =
      contentHeight.value - (scrollTop.value + containerHeight.value)
    console.log('距离底部还剩:', remaining, 'px')
    return remaining <= BOTTOM_TOLERANCE_PX + TABBAR_HEIGHT_PX
  }

  const isNearBottom = (scrollVal) => {
    if (!containerHeight.value) return false
    const remaining = contentHeight.value - (scrollVal + containerHeight.value)
    return remaining <= BOTTOM_TOLERANCE_PX + TABBAR_HEIGHT_PX
  }

  // 三段式阻尼函数复用
  const applyDamping = (d) => {
    let resisted
    if (d <= 60) resisted = d * 0.8
    else if (d <= 120) resisted = 48 + (d - 60) * 0.5
    else resisted = 78 + Math.sqrt(d - 120) * 6
    return resisted
  }

  // 测量容器与内容高度
  const measureHeights = (cb) => {
    uni
      .createSelectorQuery()
      .in(vm)
      .select('.activity-list')
      .boundingClientRect((rect) => {
        if (rect && rect.height && rect.height !== containerHeight.value) {
          containerHeight.value = rect.height
        }
      })
      .select('.pull-wrapper')
      .boundingClientRect((rect) => {
        if (rect && rect.height && rect.height !== contentHeight.value) {
          contentHeight.value = rect.height
        }
      })
      .exec(() => {
        updateEdgeStatus()
        cb && cb()
      })
  }

  // 获取活动列表
  const getActivityList = async () => {
    try {
      loading.value = true
      const response = await request(
        `${baseUrl}/school_activity/get_school_activity_list`,
        'GET'
      )
      console.log('活动列表:', response.data)

      if (response.code === 0 && response.data) {
        const activities = response.data.data || []

        // 如果只有一个活动，自动设置为置顶
        if (activities.length === 1) {
          activities[0].is_top = true
        }
        // const mock = [
        //   {
        //     id: 10,
        //     title:
        //       '湖南广电“不芒学长”现身湘江实验室，这波“双创”经验包投递到校门口了',
        //     link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
        //     pic: 'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/1755855801_eeee.png',
        //     is_top: 0,
        //   },
        //   {
        //     id: 2,
        //     title:
        //       '湖南广电“不芒学长”现身湘江实验室，这波“双创”经验包投递到校门口了',
        //     link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
        //     pic: 'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/1755854553_32333.png',
        //     is_top: 0,
        //   },
        //   {
        //     id: 3,
        //     title:
        //       '湖南广电“不芒学长”现身湘江实验室，这波“双创”经验包投递到校门口了',
        //     link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
        //     pic: 'https://i.postimg.cc/5tSW8SHQ/temp-Image91h-X5-F.avif',
        //     is_top: 0,
        //   },
        //   {
        //     id: 6,
        //     title:
        //       '湖南广电“不芒学长”现身湘江实验室，这波“双创”经验包投递到校门口了',
        //     link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
        //     pic: 'https://i.postimg.cc/5tSW8SHQ/temp-Image91h-X5-F.avif',
        //     is_top: 0,
        //   },
        //   {
        //     id: 7,
        //     title:
        //       '湖南广电“不芒学长”现身湘江实验室，这波“双创”经验包投递到校门口了',
        //     link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
        //     pic: 'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/1755855801_eeee.png',
        //     is_top: 0,
        //   },
        //   {
        //     id: 1,
        //     title:
        //       '湖南广电“不芒学长”现身湘江实验室，这波“双创”经验包投递到校门口了',
        //     link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
        //     pic: 'https://i.postimg.cc/5tSW8SHQ/temp-Image91h-X5-F.avif',
        //     is_top: 0,
        //   },
        //   {
        //     id: 5,
        //     title:
        //       '湖南广电“不芒学长”现身湘江实验室，这波“双创”经验包投递到校门口了',
        //     link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
        //     pic: 'https://i.postimg.cc/5tSW8SHQ/temp-Image91h-X5-F.avif',
        //     is_top: 1,
        //   },
        // ]
        activityList.value = activities
        // activityList.value = mock
        await nextTick()
        measureHeights()
      }
    } catch (error) {
      console.error('获取活动列表失败:', error)
      uni.showToast({
        title: '获取活动列表失败',
        icon: 'none',
      })
    } finally {
      loading.value = false
    }
  }

  onShow(async () => {
    await getActivityList()
    // 兜底再次测量（例如返回页面后窗口变化）
    setTimeout(() => measureHeights(), 50)
  })

  onHide(() => {
    // 页面隐藏时的逻辑
  })
</script>
<style lang="scss" scoped>
  @import './index.scss';

  .pull-wrapper {
    transition: transform 400ms cubic-bezier(0.22, 0.8, 0.2, 1);
    will-change: transform;
    min-height: 100%;
  }

  /* 当正在拖动时，去除 transition，让位移跟随手势更灵敏 */
  .pull-wrapper.dragging {
    transition: none;
  }

  /* 刷新状态下的过渡效果 */
  .pull-wrapper.refreshing {
    transition: transform 300ms ease-out;
  }

  /* 可选：在拖动时给列表顶部留白，避免图片被拉出圆角 */
  .activity-item:first-child {
    border-top-left-radius: 16rpx;
    border-top-right-radius: 16rpx;
  }

  /* 增强活动项的交互效果 */
  .activity-item {
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    }
  }

  /* 底部回弹效果的优化 */
  .activity-item:last-child {
    border-bottom-left-radius: 16rpx;
    border-bottom-right-radius: 16rpx;
  }

  .overscroll-gap {
    width: 100%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.6),
      rgba(255, 255, 255, 0)
    );
    transition: height 0.4s cubic-bezier(0.22, 0.8, 0.2, 1);
    pointer-events: none;
    height: 0; // 初始为 0
  }
</style>
