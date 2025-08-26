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
    <view class="main">
      <scroll-view
        scroll-y="true"
        class="activity-list"
        bounces="true"
        @touchstart="onTouchStart"
        @touchmove.stop.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @scroll="onScroll"
        :scroll-top="scrollTop"
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
    </view>

    <tabbar />
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { onShow, onHide } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import { baseUrl } from '@/utils/config'
  import tabbar from '@/components/tabbar/tabbar.vue'
  const triggered = ref(false)
  const activityList = ref([])
  const loading = ref(false)
  // 下拉回弹相关状态
  const startY = ref(0)
  const translateY = ref(0)
  const dragging = ref(false)
  const maxPull = 200 // 最大可拉距离（像素）
  const scrollTop = ref(0) // 记录滚动位置

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

  // 触摸/滚动处理：实现下拉拉伸与回弹
  const onTouchStart = (e) => {
    const touches = e.touches || (e.changedTouches && e.changedTouches)
    if (!touches || !touches[0]) return
    startY.value = touches[0].clientY
    dragging.value = false
  }

  const onTouchMove = (e) => {
    const touches = e.touches || (e.changedTouches && e.changedTouches)
    if (!touches || !touches[0]) return
    const currentY = touches[0].clientY
    const dy = currentY - startY.value

    // 仅在滚动到顶部并且向下拖动时生效
    if (dy > 0 && scrollTop.value <= 5) {
      // 增强阻尼效果：使用三段式阻尼
      let resisted
      if (dy <= 60) {
        // 初始阶段：线性阻尼
        resisted = dy * 0.8
      } else if (dy <= 120) {
        // 中间阶段：二次阻尼
        resisted = 48 + (dy - 60) * 0.5
      } else {
        // 最后阶段：强阻尼
        resisted = 78 + Math.sqrt(dy - 120) * 6
      }

      translateY.value = Math.min(maxPull, resisted)
      dragging.value = true

      // 阻止默认滚动行为
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const onTouchEnd = () => {
    if (!dragging.value) return
    // 直接回弹，不执行任何刷新操作
    animateBack()
  }

  const animateBack = () => {
    // 使用过渡 CSS 控制回弹动画，通过设置 translateY -> 0
    translateY.value = 0
    dragging.value = false
  }

  // 滚动事件处理
  const onScroll = (e) => {
    scrollTop.value = e.detail.scrollTop || 0
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
        //     id: 2,
        //     title:
        //       '湖南广电“不芒学长”现身湘江实验室，这波“双创”经验包投递到校门口了',
        //     link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
        //     pic: 'https://i.postimg.cc/5tSW8SHQ/temp-Image91h-X5-F.avif',
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
        //     pic: 'https://i.postimg.cc/5tSW8SHQ/temp-Image91h-X5-F.avif',
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
</style>
