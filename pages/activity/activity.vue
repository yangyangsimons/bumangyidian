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
      title="我的"
    >
    </uni-nav-bar>
    <image src="/static/my/bg.png" mode="scaleToFill" class="bg" />
    <view class="activity-list">
      <view
        class="activity-item"
        v-for="item in sortedActivityList"
        :key="item.id"
        @click="handleActivityClick(item)"
      >
        <view class="activity-image-wrapper">
          <image
            :src="item.pic"
            class="activity-image"
            mode="aspectFill"
            :lazy-load="true"
          />
          <view v-if="item.is_top" class="top-badge">置顶</view>
        </view>

        <view class="activity-content">
          <view class="activity-title">{{ item.title }}</view>

          <view class="activity-time">
            <view class="time-item">
              <text class="time-label">开始时间：</text>
              <text class="time-value">{{ formatTime(item.start_time) }}</text>
            </view>
            <view class="time-item">
              <text class="time-label">结束时间：</text>
              <text class="time-value">{{ formatTime(item.end_time) }}</text>
            </view>
          </view>

          <view class="activity-meta">
            <text class="create-time"
              >发布于 {{ formatTime(item.created_at) }}</text
            >
            <view class="activity-status" :class="getStatusClass(item)">
              {{ getActivityStatus(item) }}
            </view>
          </view>
        </view>
      </view>
    </view>
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
  import { ref, computed } from 'vue'
  import { onShow, onHide } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import { baseUrl } from '@/utils/config'
  import tabbar from '@/components/tabbar/tabbar.vue'

  const activityList = ref([])
  const loading = ref(false)

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

  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  // 获取活动状态
  const getActivityStatus = (item) => {
    const now = new Date()
    const startTime = new Date(item.start_time)
    const endTime = new Date(item.end_time)

    if (now < startTime) {
      return '未开始'
    } else if (now > endTime) {
      return '已结束'
    } else {
      return '进行中'
    }
  }

  // 获取状态样式类
  const getStatusClass = (item) => {
    const status = getActivityStatus(item)
    switch (status) {
      case '未开始':
        return 'status-pending'
      case '进行中':
        return 'status-active'
      case '已结束':
        return 'status-ended'
      default:
        return ''
    }
  }

  // 点击活动项
  const handleActivityClick = (item) => {
    if (item.link) {
      // 跳转到活动链接
      uni.navigateTo({
        url: `/pages/ad/ad?address=${item.link}&title=${encodeURIComponent(
          item.title
        )}`,
      })
    }
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
        // activityList.value = response.data.data || []
        //模拟数据
        activityList.value = [
          {
            id: 3,
            title: '测试3',
            link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
            pic: 'https://mmbiz.qpic.cn/sz_mmbiz_jpg/ZGV7NgMkyIEEXkG3SOGz0rGtfXrheoFjn6ZickVdYuNNvTNvpnyPia5ubiaWl0dmice2RAUa2H2gVNEsWUAGCnGic4w/640?wx_fmt=jpeg&wxfrom=10005&wx_lazy=1&tp=webp',
            start_time: '2025-06-20 00:00:00',
            end_time: '2025-07-14 00:00:00',
            is_top: 0,
            created_at: '2025-06-16 14:41:05',
          },
          {
            id: 1,
            title:
              '湖南广电"不芒学长"现身湘江实验室，这波"双创"经验包投递到校门口了',
            link: 'https://mp.weixin.qq.com/s/MhaqphOSsge3aT0kJkxkKA?scene=1',
            pic: 'https://mmbiz.qpic.cn/sz_mmbiz_jpg/ZGV7NgMkyIEEXkG3SOGz0rGtfXrheoFjn6ZickVdYuNNvTNvpnyPia5ubiaWl0dmice2RAUa2H2gVNEsWUAGCnGic4w/640?wx_fmt=jpeg&wxfrom=10005&wx_lazy=1&tp=webp',
            start_time: '2025-06-10 00:00:00',
            end_time: '2025-08-10 00:00:00',
            is_top: 1,
            created_at: '2025-06-16 09:56:09',
          },
        ]
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
</style>
