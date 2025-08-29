<template>
  <view class="my-message">
    <!-- 如果有消息数据，循环渲染每条消息 -->
    <scroll-view
      v-if="messageData.length > 0"
      scroll-y="true"
      class="my-message-container"
      bounces="true"
    >
      <view class="pull-wrapper">
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
  import { ref, onMounted, computed, nextTick } from 'vue'
  import request from '@/utils/request.js'
  import { baseUrl } from '@/utils/config'
  import { checkTokenAndNavigate } from '@/utils/auth'

  const messageData = ref([])
  const replyMessage = ref('')
  const isSubmitting = ref(false)

  // 已移除上拉/下拉回弹相关所有状态与计算
  // 根据点赞状态返回对应的图片地址
  const getLikeImageSrc = (message) => {
    return message.liked
      ? '../../static/my/like.png'
      : '../../static/my/like-false.png'
  }

  // 触摸/回弹逻辑已删除
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
    // 登录判断：未登录时 auth.js 内部会弹出 uni.showModal 并返回 false
    if (!checkTokenAndNavigate()) return
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
