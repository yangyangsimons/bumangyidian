<template>
  <view class="my-message">
    <uni-nav-bar
      :fixed="true"
      :status-bar="true"
      :shadow="false"
      background-color="rgba(255, 255, 255, 0)"
      color="#333"
      :border="false"
      leftWidth="0"
    >
      <uni-icons
        type="left"
        size="22"
        class="nav-icon"
        @click="goBack"
      ></uni-icons>
      <view class="nav-title">
        <text class="title-text">留言</text>
      </view>
    </uni-nav-bar>
    <image class="bg" src="../../static/my/bg.png" mode="scaleToFill"></image>

    <!-- 如果有消息数据，循环渲染每条消息 -->
    <scroll-view
      v-if="messageShow && messageData.length > 0"
      scroll-y="true"
      class="my-message-container"
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
          v-for="(message, index) in messageData"
          :key="index"
          class="my-message-item"
        >
          <view class="my-message-header">
            <view class="avator">
              <image :src="avator"></image>
            </view>
            <view class="info-container">
              <view class="user-info-setting">
                <view class="user-info">
                  <view class="name">{{ userName }}</view>
                  <view class="date">{{ message.created_at }}</view>
                </view>
              </view>
              <view class="audit">
                <!--审核状态 根据status字段显示-->
                <view
                  class="audit-text"
                  v-if="message.status === 2"
                  style="background-color: rgba(250, 116, 104, 1)"
                  ><text>审核未通过</text></view
                >
                <view
                  class="audit-text"
                  v-if="message.status === 0"
                  style="background-color: rgba(107, 215, 227, 1)"
                  ><text>审核中</text></view
                >
                <view class="audit-text" v-if="message.status === 1"
                  ><text>已审核</text></view
                >
              </view>
            </view>
          </view>
          <view class="my-message-content">
            <view class="content">{{ message.content }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态显示 -->
    <view class="empty" v-if="!messageShow">
      <image
        class="empty-message"
        src="../../static/my/empty-message.png"
      ></image>
    </view>
  </view>
</template>

<script setup>
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import request from '@/utils/request.js'
  import { baseUrl } from '../../utils/config'

  const messageShow = ref(false)
  const messageData = ref([])

  // 下拉回弹相关状态
  const startY = ref(0)
  const translateY = ref(0)
  const dragging = ref(false)
  const maxPull = 200 // 最大可拉距离（像素）
  const scrollTop = ref(0) // 记录滚动位置
  // 模拟数据函数
  const getMockData = () => {
    return {
      code: 0,
      msg: '获取成功',
      data: [
        {
          content: '这是我的第一条留言，希望能够得到及时回复！',
          created_at: '2025-08-10 14:30:25',
          status: 1, // 已审核
        },
        {
          content: '请问关于产品使用方面有什么注意事项吗？期待您的回复。',
          created_at: '2025-08-11 09:15:42',
          status: 0, // 审核中
        },
        {
          content:
            '昨天提交的申请还没有处理，麻烦尽快处理一下，谢谢！还没有处理，麻烦尽快处理一下，谢谢！还没有处理，麻烦尽快处理一下，谢谢！还没有处理，麻烦尽快处理一下，谢谢！',
          created_at: '2025-08-11 16:22:18',
          status: 2, // 审核未通过
        },
        {
          content: '非常感谢客服的耐心解答，问题已经解决了。',
          created_at: '2025-08-12 10:45:33',
          status: 1, // 已审核
        },
        {
          content: '建议增加更多的功能选项，这样会更方便用户使用。',
          created_at: '2025-08-12 13:20:15',
          status: 0, // 审核中
        },
        {
          content: '建议增加更多的功能选项，这样会更方便用户使用。',
          created_at: '2025-08-12 13:20:15',
          status: 0, // 审核中
        },
        {
          content: '建议增加更多的功能选项，这样会更方便用户使用。',
          created_at: '2025-08-12 13:20:15',
          status: 0, // 审核中
        },
        {
          content: '建议增加更多的功能选项，这样会更方便用户使用。',
          created_at: '2025-08-12 13:20:15',
          status: 0, // 审核中
        },
        {
          content: '建议增加更多的功能选项，这样会更方便用户使用。',
          created_at: '2025-08-12 13:20:15',
          status: 0, // 审核中
        },
        {
          content: '建议增加更多的功能选项，这样会更方便用户使用。',
          created_at: '2025-08-12 13:20:15',
          status: 0, // 审核中
        },
      ],
      traceid: 'mock-trace-id-12345',
    }
  }

  // 这些应该从你的用户信息或其他地方获取
  const avator = ref('../../static/logo.png') // 你需要设置默认头像路径
  const userName = ref('用户名') // 你需要设置用户名

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
  //返回首页的方法
  const goHome = () => {
    uni.reLaunch({
      url: '/pages/index/index',
    })
  }
  // 返回上一页的方法
  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      goHome()
    }
  }
  onShow(async () => {
    console.log('我的留言页面显示')
    // 获取用户信息

    try {
      const userInfo = await request(`${baseUrl}/user/user_info`, 'GET')
      console.log('获取用户信息:', userInfo)
      if (userInfo.code === 0) {
        avator.value = userInfo.data.avator || '../../static/logo.png'
        userName.value = userInfo.data.username || '游客'
      } else {
        console.error('获取用户信息失败:', userInfo.message)
      }
      const messageInfo = await request(
        `${baseUrl}/leave_msg/get_my_leave_msg`,
        'GET'
      )
      console.log('获取到的留言信息:', messageInfo)

      if (
        messageInfo.code === 0 &&
        messageInfo.data &&
        messageInfo.data.length > 0
      ) {
        // 如果后端有数据，使用真实数据
        messageData.value = messageInfo.data
        messageShow.value = true
      } else {
        // 如果后端没有数据，使用模拟数据
        console.log('后端数据为空，使用模拟数据')
        const mockData = getMockData()
        messageData.value = mockData.data
        messageShow.value = false
      }
    } catch (error) {
      console.error('获取留言信息失败，使用模拟数据:', error)
      // 如果请求失败，也使用模拟数据
      const mockData = getMockData()
      messageData.value = mockData.data
      messageShow.value = false
    }
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
</style>
