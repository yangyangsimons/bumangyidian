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
    <view
      v-if="debugMode"
      class="debug-panel"
      style="
        position: fixed;
        top: 200rpx;
        right: 20rpx;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20rpx;
        border-radius: 10rpx;
        z-index: 999;
        font-size: 24rpx;
      "
    >
      <text>当前人数: {{ currentParticipants }}</text
      ><br />
      <text>基础进度: {{ baseProgressDebug.toFixed(2) }}%</text><br />
      <text>最终进度: {{ progressHeight.toFixed(2) }}%</text><br />
      <text>偏移量: {{ offsetPercentageDebug.toFixed(2) }}%</text><br />
      <button @click="testProgress">测试进度</button>
    </view>
    <!-- 标题部分 - 背景图 -->
    <image
      class="bg-img"
      src="https://mang.5gradio.com.cn/static/enrollment/bg.jpg"
      mode="aspectFill"
    />
    <!-- 主体部分 - 进度条和奖励 -->
    <view class="main-section">
      <view class="header">
        <image
          src="../../static/enrollment/header.png"
          mode="scaleToFill"
          class="header-image"
        />
      </view>
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
            </view>
          </view>

          <!-- 中间进度条 -->
          <view class="progress-bar">
            <view class="progress-track">
              <view class="dot-container">
                <view class="dot-outer">
                  <view class="dot"></view>
                </view>
                <view class="dot-outer">
                  <view class="dot"></view>
                </view>
                <view class="dot-outer">
                  <view class="dot"></view>
                </view>
                <view class="dot-outer">
                  <view class="dot"></view>
                </view>
                <view class="dot-outer">
                  <view class="dot"></view>
                </view>
                <view class="dot-outer">
                  <view class="dot"></view>
                </view>
              </view>
              <view
                class="progress-fill"
                :style="{ height: progressHeight + '%' }"
              ></view>
              <!-- 新增：当前进度指示器 -->
            </view>
            <view class="indicator-container">
              <view
                class="progress-indicator"
                :style="{ bottom: indicatorPosition + '%' }"
              ></view>
            </view>
          </view>

          <!-- 右侧奖励 -->
          <view class="rewards">
            <!-- 图片轮播区域 -->
            <view class="reward-images-container">
              <view
                class="reward-images-wrapper"
                :class="{ 'is-scrolling': isScrolling }"
              >
                <!-- 无限重复的图片序列 -->
                <view
                  v-for="(image, index) in infiniteImages"
                  :key="index"
                  class="reward-image-item"
                >
                  <image
                    v-if="image"
                    class="reward-image"
                    :src="image"
                    mode="aspectFit"
                  />
                </view>
              </view>
            </view>

            <!-- 文字描述区域（固定不动） -->
            <view class="reward-texts">
              <view
                v-for="(reward, index) in rewards.slice(0, 6)"
                :key="index"
                class="reward-text-item"
                :class="{
                  unlocked: currentParticipants >= stages[index].target,
                }"
              >
                <rich-text
                  class="reward-desc"
                  :nodes="reward.desc"
                  >{{
                }}</rich-text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部部分 -->
    <view class="footer-section">
      <rich-text class="disclaimer" :nodes="disclaimerHtml"></rich-text>
      <view class="share-btn" @click="handleShare">
        <image src="../../static/enrollment/share-nav-btn.png"></image>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    onShow,
    onHide,
    onShareAppMessage,
    onShareTimeline,
  } from '@dcloudio/uni-app'
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { baseUrl } from '@/utils/config.js'
  import request from '@/utils/request.js'

  const disclaimerHtml = ref(
    `&nbsp;参与"不芒一点"分享活动，赢取惊喜好礼！<br/>
&nbsp;活动达成指定参与人数，即解锁对应奖池：<br/>
&nbsp;• 参与即享，所有参与的学生用户，可获得中国移动“超星校园卡”7月及8月免费使用权，后期每月28元。每月均含240G流量、300分钟通话、25元咪咕视频会员、音视频会员、吃喝玩乐代金券等特权福利。（后续将有专人联系确认使用）<br/>
&nbsp;• 满1000人，前1000位用户可获得18元"楂堆"山楂莓莓饮品；<br/>
&nbsp;• 满5000人，抽50位送芒果tv季卡会员；<br/>
&nbsp;• 满1万人，抽50位送芒果tv年卡会员；<br/>
&nbsp;• 满2万人，抽20位送芒果综艺录制名额；<br/>
&nbsp;• 满5万人，抽5位送芒果跨年晚会门票！<br/>
&nbsp;除1000人奖励外，其他奖项均从所有参与者中随机抽取。<br/><br/>

「活动时间」<br/>
&nbsp;2025年7月30日-9月15日<br/>
「关于奖品兑换」<br/>
&nbsp;奖品兑换预计8月下旬开放，请关注服务信息推送，或在<span style="color: rgba(194,28,19);">"不芒一点"后续版本更新后</span>,<br/>
&nbsp;前往"我的-积分商城"领取，奖品以实际发放为准。因涉及办理中国移动超星校园卡，参与学生用户知悉并同意授权主办方将个人注册基本信息移交给中国移动。部分奖品需由工作人员电话联系确认兑奖信息，参与活动即视为您同意在兑奖环节接受相关联系与沟通。关注「不芒一点」微信公众号了解更多相关信息，活动最终解释权归主办方所有。`
  )
  const indicatorPosition = computed(() => {
    const progress = progressHeight.value

    // 因为progress-track旋转了180度，需要反向计算
    // 指示器应该在 (100 - progress) 的位置
    const position = 100 - progress

    // 微调让指示器正好在填充顶部
    const adjustment = 1 // 根据实际效果调整这个值

    return Math.max(0, Math.min(97, position + adjustment)) // 限制在0-97%之间，避免溢出
  })
  const debugMode = ref(false) // 调试完成后设为false
  const testProgress = () => {
    const testValues = [
      0, 300, 500, 800, 1000, 1100, 1200, 1500, 3000, 5000, 10000, 50000,
    ]
    const currentIndex = testValues.indexOf(currentParticipants.value)
    const nextIndex = (currentIndex + 1) % testValues.length
    currentParticipants.value = testValues[nextIndex]
  }

  // 暴露调试用的计算值
  const baseProgressDebug = ref(0)
  const offsetPercentageDebug = ref(0)
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

    // 开始滚动
    setTimeout(() => {
      startImageCarousel()
    }, 500)
  })

  // 人数阶段配置
  const stages = ref([
    { target: 0, label: '参与即享' },
    { target: 1000, label: '满1千' },
    { target: 5000, label: '满5千' },
    { target: 10000, label: '满1万' },
    { target: 20000, label: '满2万' },
    { target: 50000, label: '满5万' },
  ])

  // 奖励配置
  const rewards = ref([
    {
      image: '../../static/enrollment/reward/stage-7.png',
      desc: `暑期0元240G流量会员全家桶`,
    },
    {
      image: '../../static/enrollment/reward/stage-6.png',
      desc: `“楂堆”山楂莓莓饮品<br/>(1000份)`,
    },
    {
      image: '../../static/enrollment/reward/stage-1.jpg',
      desc: `芒果tv季卡会员<br/>(50份)`,
    },
    {
      image: '../../static/enrollment/reward/stage-2.jpg',
      desc: `芒果tv年卡会员<br/>(50份)`,
    },
    {
      image: '../../static/enrollment/reward/stage-3.jpg',
      desc: `芒果综艺录制名额<br/>(20份)`,
    },
    {
      image: '../../static/enrollment/reward/stage-4.jpg',
      desc: `芒果跨年权益<br/>(5份)`,
    },
    {
      image: '../../static/enrollment/reward/stage-5.jpg',
      desc: '11',
    },
  ])

  // 图片轮播相关
  const isScrolling = ref(false)

  // 创建足够多的图片副本来实现无缝循环
  const infiniteImages = computed(() => {
    const validImages = rewards.value
      .filter((reward) => reward.image)
      .map((reward) => reward.image)
    if (validImages.length === 0) return []

    // 创建更多副本确保无缝循环
    const result = []
    for (let i = 0; i < 20; i++) {
      // 创建10组副本
      result.push(...validImages)
    }
    return result
  })

  // 开始图片轮播
  const startImageCarousel = () => {
    if (rewards.value.filter((reward) => reward.image).length === 0) return
    isScrolling.value = true
  }

  // 停止图片轮播
  const stopImageCarousel = () => {
    isScrolling.value = false
  }

  // 页面隐藏时停止轮播
  onHide(() => {
    stopImageCarousel()
  })

  // 组件卸载时清理
  onUnmounted(() => {
    stopImageCarousel()
  })

  // 计算进度条高度百分比
  const progressHeight = computed(() => {
    const participants = currentParticipants.value
    const stageTargets = stages.value.map((s) => s.target)
    const stageCount = stageTargets.length // 5个阶段
    const segmentPercentage = 100 / stageCount // 每段20%

    // 计算基础进度（0-100%）
    let baseProgress = 0

    // 如果还没到第一个阶段
    if (participants < stageTargets[0]) {
      baseProgress = (participants / stageTargets[0]) * segmentPercentage
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
          baseProgress =
            (i + 1) * segmentPercentage + segmentProgress * segmentPercentage
          found = true
          break
        }
      }

      // 如果超过了最后一个阶段
      if (!found && participants >= stageTargets[stageTargets.length - 1]) {
        baseProgress = 100
      }
    }

    // 根据实际布局计算偏移量
    // people-stages: padding-top: 50rpx, height: 450rpx, 有效显示区域: 400rpx
    // progress-track: height: 470rpx
    // 需要让进度条的起始位置对齐people-stages的第一个stage-item

    // people-stages中第一个stage-item距离顶部的距离是50rpx
    // progress-track总高度是470rpx
    // 所以偏移百分比应该是: (50rpx / 470rpx) * 100% = 10.64%
    const peopleStagesPaddingTop = 40 // rpx
    const progressTrackHeight = 570 // rpx
    const offsetPercentage =
      (peopleStagesPaddingTop / progressTrackHeight) * 100

    return Math.max(0, baseProgress - offsetPercentage)
  })

  // 分享按钮点击事件
  const handleShare = () => {
    uni.navigateTo({ url: '/pages/enrollment2025/enrollment2025' })
  }
  onShareAppMessage(() => {
    console.log('onShareAppMessage......')
    return {
      title: `湖南见面礼已派件！晒高光时刻赢芒果跨年`,
      imageUrl:
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com:443/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E5%88%86%E4%BA%AB%E5%9B%BE.png',
      path: '/pages/lottery/lottery',
    }
  })
  onShareTimeline(() => {
    console.log('onShareTimeline......')
    return {
      title: `湖南见面礼已派件！晒高光时刻赢芒果跨年`,
      imageUrl:
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com:443/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E5%88%86%E4%BA%AB%E5%9B%BE.png',
      path: '/pages/lottery/lottery',
    }
  })
</script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
