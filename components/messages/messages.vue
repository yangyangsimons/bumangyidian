<template>
  <view class="my-message">
    <!-- 如果有消息数据，循环渲染每条消息 -->
    <view v-if="messageData.length > 0" class="my-message-container">
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
    <view class="empty" v-else>
      <image
        class="empty-message"
        src="../../static/my/empty-message.png"
      ></image>
      <text>暂无留言数据</text>
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
  import { ref, onMounted } from 'vue'
  import request from '@/utils/request.js'
  import { baseUrl } from '@/utils/config'

  const messageData = ref([])
  const replyMessage = ref('')
  const isSubmitting = ref(false)

  // 用户信息
  const avator = ref('../../static/logo.png')
  const userName = ref('用户名')

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
        content: replyMessage.value.trim(),
      })

      if (response.code === 0) {
        uni.showToast({
          title: '留言提交成功',
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

  // 加载数据的方法
  const loadData = async () => {
    console.log('开始加载留言数据')

    try {
      // 获取用户信息
      const userInfo = await request(`${baseUrl}/user/user_info`, 'GET')
      console.log('获取用户信息:', userInfo)

      if (userInfo.code === 0 && userInfo.data) {
        avator.value = userInfo.data.avator || '../../static/logo.png'
        userName.value = userInfo.data.username || '游客'
      }

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
        } else {
          messageData.value = []
        }
        console.log('留言数据加载完成，数据长度:', messageData.value.length)
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
  })

  // 暴露方法，以便父组件调用
  defineExpose({
    loadData,
    sendMessage,
  })
</script>

<style lang="scss" scoped>
  @import './index.scss';

  .sendMessage {
    .send-icon.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }
</style>
