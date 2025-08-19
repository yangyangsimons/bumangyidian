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
    <view class="activity-list">
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
        const activities = response.data.data || []

        // 如果只有一个活动，自动设置为置顶
        if (activities.length === 1) {
          activities[0].is_top = true
        }

        activityList.value = activities
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
