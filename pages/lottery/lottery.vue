<template>
  <view class="activity-page">
    <view class="nav-right">
      <uni-icons
        type="left"
        size="22"
        class="nav-icon"
        @click="goBack"
      ></uni-icons>
      <uni-icons
        type="home"
        size="22"
        class="nav-icon"
        @click="goHome"
      ></uni-icons>
    </view>
    <!-- 标题部分 - 背景图 -->
    <image
      class="bg-img"
      src="https://mang.5gradio.com.cn/static/enrollment/bg.jpg"
      mode="aspectFill"
    />
    <view class="header-section">
      <!-- <image
        class="bg-image"
        src="../../static/reward-bg.png"
        mode="aspectToFit"
      /> -->
      <view class="header-content">
        <text class="activity-title">欢迎新同学</text>
        <text class="activity-desc">参与即有机会获得丰厚奖品</text>
      </view>
    </view>

    <!-- 主体部分 - 进度条和奖励 -->
    <view class="main-section">
      <view class="progress-container">
        <!-- 进度条标题 -->
        <view class="section-titles">
          <text class="left-title">参与人数</text>
          <text class="right-title">阶梯奖励</text>
        </view>

        <!-- 进度条主体 -->
        <view class="progress-main">
          <!-- 左侧人数阶段 -->
          <view class="people-stages">
            <view
              v-for="(stage, index) in stages"
              :key="index"
              class="stage-item"
              :class="{ completed: currentParticipants >= stage.target }"
            >
              <text class="stage-text">{{ stage.label }}</text>
              <view class="stage-dot"></view>
            </view>
          </view>

          <!-- 中间进度条 -->
          <view class="progress-bar">
            <text class="current-count"
              >{{ formatNumber(currentParticipants) }}人</text
            >
            <view class="progress-track">
              <view
                class="progress-fill"
                :style="{ height: progressHeight + '%' }"
              ></view>
            </view>
          </view>

          <!-- 右侧奖励 -->
          <view class="rewards">
            <view
              v-for="(reward, index) in rewards"
              :key="index"
              class="reward-item"
              :class="{ unlocked: currentParticipants >= stages[index].target }"
            >
              <image
                class="reward-image"
                :src="reward.image"
                mode="aspectFit"
              />
              <text class="reward-desc">{{ reward.desc }}</text>
            </view>
          </view>
        </view>

        <!-- 当前进度说明 -->
        <view class="progress-info">
          <text class="progress-text">
            距离下一阶段还需 {{ getNextStageNeeded() }} 人参与
          </text>
        </view>
      </view>
    </view>

    <!-- 底部部分 -->
    <view class="footer-section">
      <text class="disclaimer">本活动的最终解释权归XXXXXXX所有</text>
      <button class="share-btn" @click="handleShare">
        <text class="share-text">开始分享</text>
      </button>
    </view>
  </view>
</template>

<script setup>
  import { onShow, onHide } from '@dcloudio/uni-app'
  import { ref, computed } from 'vue'
  import { baseUrl } from '@/utils/config.js'
  import request from '@/utils/request.js'

  // 跳转上一页的方法
  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      goHome()
    }
  }
  //返回首页的方法
  const goHome = () => {
    uni.reLaunch({
      url: '/pages/index/index',
    })
  }
  // 当前参与人数（可以从接口获取）
  const currentParticipants = ref(0)

  onShow(async () => {
    // 页面显示时获取最新参与人数
    const rest = await request(`${baseUrl}/user/count_new_term_activity`, 'get')
    if (rest.code === 0) {
      currentParticipants.value = rest.data.count
    } else {
      uni.showToast({
        title: '获取参与人数失败',
        icon: 'none',
      })
    }
  })
  // 人数阶段配置
  const stages = ref([
    { target: 1000, label: '满1千' },
    { target: 5000, label: '满5千' },
    { target: 20000, label: '满2万' },
    { target: 50000, label: '满5万' },
  ])

  // 奖励配置
  const rewards = ref([
    {
      image: '../../static/reward.jpg',
      desc: '芒果会员7天',
    },
    {
      image: '../../static/reward.jpg',
      desc: '芒果会员30天',
    },
    {
      image: '../../static/reward.jpg',
      desc: '芒果年费会员限量周边',
    },
    {
      image: '../../static/reward.jpg',
      desc: '终身会员\n+神秘大奖',
    },
  ])

  // 计算进度条高度百分比
  const progressHeight = computed(() => {
    const participants = currentParticipants.value
    const stageTargets = stages.value.map((s) => s.target)

    // 计算基础进度（0-100%）
    let baseProgress = 0

    // 如果还没到第一个阶段
    if (participants < stageTargets[0]) {
      baseProgress = (participants / stageTargets[0]) * 25 // 第一段占25%
    } else {
      // 找到当前处于哪个区间
      let found = false
      for (let i = 0; i < stageTargets.length - 1; i++) {
        if (
          participants >= stageTargets[i] &&
          participants < stageTargets[i + 1]
        ) {
          // 计算在当前区间的进度
          const segmentProgress =
            (participants - stageTargets[i]) /
            (stageTargets[i + 1] - stageTargets[i])
          baseProgress = (i + 1) * 25 + segmentProgress * 25
          found = true
          break
        }
      }

      // 如果超过了最后一个阶段
      if (!found && participants >= stageTargets[stageTargets.length - 1]) {
        baseProgress = 100
      }
    }

    // 减去margin-top偏移量对应的百分比 (100rpx / 600rpx = 16.67%)
    const offsetPercentage = (100 / 600) * 100 // 16.67%
    return Math.max(0, baseProgress - offsetPercentage)
  })
  // 格式化数字显示
  const formatNumber = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  // 获取距离下一阶段所需人数
  const getNextStageNeeded = () => {
    for (let stage of stages.value) {
      if (currentParticipants.value < stage.target) {
        return formatNumber(stage.target - currentParticipants.value)
      }
    }
    return 0
  }

  // 分享按钮点击事件
  const handleShare = () => {
    uni.navigateTo({ url: '/pages/enrollment2025/enrollment2025' })
  }
</script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
