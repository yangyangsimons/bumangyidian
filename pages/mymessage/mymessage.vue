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
    <view
      v-if="messageShow && messageData.length > 0"
      class="my-message-container"
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
</style>
