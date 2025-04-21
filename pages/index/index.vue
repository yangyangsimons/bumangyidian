<template>
  <view class="cover">
    <image
      class="global-title"
      src="../../static/global-title-dark.png"
    ></image>
    <!-- 当金种子杯模式有效时显示切换按钮 -->
    <button
      v-if="isGoldModeAvailable"
      class="changeModel"
      @click="toggleSystemModel"
    >
      <view class="botton-title">
        <image
          src="../../static/changeModel.png"
          mode="scaleToFill"
          class="change-model-pic"
        />
        <text class="model">{{
          currentModel === '常规模式' ? '创业金种子' : '常规模式'
        }}</text>
      </view>

      <text class="talk">{{
        currentModel === '常规模式' ? '来湘创业全掌握' : '退出创业问答'
      }}</text>
    </button>

    <image :src="bgSrc" class="cover-image" mode="aspectFill" />
    <!-- 根据shine_point的valid显示亮点 -->
    <view
      v-if="shinePointVisible"
      class="shine-point"
      :style="{
        left: `${shinePointConfig.x_ratio * 100}%`,
        top: `${shinePointConfig.y_ratio * 100}%`,
      }"
    >
      <image
        class="shining-image"
        src="../../static/shining-point.png"
        mode="scaleToFill"
      />
      <text class="shining-text">{{ shinePointConfig.text }} </text>
    </view>
    <record-animation />
    <view class="subject-container" v-if="currentModel === '常规模式'">
      <view class="title">今日话题</view>
      <scroll-view
        class="subject-scroll-view"
        scroll-x
        :scroll-left="scrollLeft"
        :enhanced="true"
        :show-scrollbar="false"
        @scroll="onScroll"
      >
        <view class="subject">{{ subejctText }}</view>
      </scroll-view>
    </view>
    <view class="barrage-container">
      <barrage />
    </view>
    <chat @submit="handleSubmit" />
  </view>
</template>

<script setup>
  import { ref, reactive, computed, nextTick } from 'vue'
  import { wsUrl, baseUrl } from '../../utils/config'
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import barrage from '@/components/barrage/barrage.vue'
  import chat from '@/components/chat/chat.vue'
  import { useWebSocketStore } from '@/stores/websocket'
  import { useBarrageStore } from '../../stores/barrage'
  import { useModelStore } from '../../stores/model'
  // 导入音频播放器状态管理
  import { useAudioPlayerStore } from '@/stores/audioPlayer'
  import recordAnimation from '../../components/record-animation/record-animation.vue'
  //导入主题管理
  import { useSubjectStore } from '../../stores/subject'
  import { useIsRadioStore } from '../../stores/isRadio'
  //导入电台模式状态
  const isRadioStore = useIsRadioStore()
  const isRadio = computed(() => isRadioStore.isRadio)
  //自动滑动实现动画
  // 新增变量
  const scrollLeft = ref(0)
  const scrollTimer = ref(null)
  const maxScrollLeft = ref(0)
  const scrollSpeed = 1 // 数值越大滚动越快

  // 切换非电台模式
  const toggleRadioModel = () => {
    isRadioStore.setIsRadio(!isRadio.value)
    console.log('切换电台模式', isRadio.value)
  }
  // 新增方法
  const startAutoScroll = () => {
    stopAutoScroll()

    const query = uni.createSelectorQuery()
    query
      .select('.subject-scroll-view')
      .boundingClientRect((container) => {
        query
          .select('.subject')
          .boundingClientRect((content) => {
            if (content && container && content.width > container.width) {
              maxScrollLeft.value = content.width - container.width
              const animate = () => {
                scrollLeft.value += scrollSpeed
                if (scrollLeft.value >= maxScrollLeft.value) {
                  scrollLeft.value = 0
                }
                scrollTimer.value = requestAnimationFrame(animate)
              }
              animate()
            }
          })
          .exec()
      })
      .exec()
  }

  const stopAutoScroll = () => {
    if (scrollTimer.value) {
      cancelAnimationFrame(scrollTimer.value)
      scrollTimer.value = null
    }
  }

  // 在主题更新时（如获取新主题后）
  // nextTick(startAutoScroll)

  const bgSrc = ref('../../static/index-bg.png')
  const messages = ref([])
  const subejctText = computed(() => sbStore.subject)
  //初始化subject管理
  const sbStore = useSubjectStore()
  subejctText.value = sbStore.subject

  const wsStore = useWebSocketStore()
  // 初始化音频播放器状态管理
  const audioPlayerStore = useAudioPlayerStore()
  // 初始化弹幕状态管理
  const barrageStore = useBarrageStore()

  // 初始化模型状态管理
  const modelStore = useModelStore()
  // 添加状态管理
  const currentModel = ref('常规模式')
  const isGoldModeAvailable = ref(false)
  const systemModelConfig = reactive({
    常规模式: {
      pic_id: 0,
      pic_url: '',
    },
    金种子杯模式: {
      pic_id: 0,
      pic_url: '',
      valid: false,
    },
  })
  const shinePointConfig = reactive({
    text: '',
    valid: 0,
    x_ratio: 0,
    y_ratio: 0,
  })

  // 计算属性：是否显示亮点
  const shinePointVisible = computed(() => {
    if (typeof shinePointConfig.valid === 'boolean') {
      return shinePointConfig.valid
    } else {
      return !!shinePointConfig.valid // 将数字转为布尔值
    }
  })

  // 切换系统模式 - 只更新UI，不发送WebSocket消息
  // 添加防抖变量
  const isTogglingModel = ref(false)

  // 切换系统模式 - 只更新UI，不发送WebSocket消息
  const toggleSystemModel = async () => {
    uni.showToast({
      title: '切换中...',
      icon: 'loading',
      duration: 2500,
    })
    // 防止重复点击
    if (isTogglingModel.value) {
      console.log('切换模式操作进行中，请勿重复点击')
      uni.showToast({
        title: '操作进行中，请稍候',
        icon: 'none',
      })
      return
    }
    try {
      isTogglingModel.value = true

      // 更新当前模式
      currentModel.value =
        currentModel.value === '常规模式' ? '金种子杯模式' : '常规模式'
      // 更新背景图
      bgSrc.value = systemModelConfig[currentModel.value].pic_url

      console.log(`切换到${currentModel.value}`)
      audioPlayerStore.reportCurrentProgress()
      audioPlayerStore.stopAllAudio()
      // audioPlayerStore.resetBgMusic()
      // audioPlayerStore.resetTtsAudio()
      console.log('停止并清空所有音频队列')
      barrageStore.clearMessages()
      console.log('清空消息列表')
      // 更新状态管理
      if (currentModel.value === '金种子杯模式') {
        modelStore.setModel('金种子杯模式')
        isRadioStore.setIsRadio(false)
      } else {
        modelStore.setModel('常规模式')
      }
      // 上报当前音频播放状态,停止所有音频并清空所有音频队列
      // 关闭连接
      await wsStore.close()
      console.log('WebSocket连接已关闭')

      // 等待一段时间，确保连接完全关闭
      await new Promise((resolve) => setTimeout(resolve, 1500))

      try {
        // 重新连接
        await wsStore.connect()
        console.log('socket重新连接成功')

        // 等待连接稳定
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 发送模式切换消息
        if (currentModel.value === '金种子杯模式') {
          await wsStore.sendMessage({
            system_model: currentModel.value,
            input_type: 3,
            text: '',
          })
          console.log('模式切换消息发送成功')
        } else {
          modelStore.setModel('常规模式')
          await wsStore.sendMessage({
            system_model: currentModel.value,
            input_type: 1,
            text: '',
          })
          console.log('模式切换消息发送成功')
        }

        uni.showToast({
          title: '模式切换成功',
          icon: 'success',
          duration: 1500,
        })
      } catch (error) {
        console.error('WebSocket操作失败:', error)
        uni.showToast({
          title: '切换失败，请稍后再试',
          icon: 'none',
        })
        // 如果失败，回滚UI状态
        currentModel.value =
          currentModel.value === '常规模式' ? '金种子杯模式' : '常规模式'
        bgSrc.value = systemModelConfig[currentModel.value].pic_url
        if (currentModel.value === '金种子杯模式') {
          modelStore.setModel('金种子杯模式')
        } else {
          modelStore.setModel('常规模式')
        }
      }
    } catch (error) {
      console.error('切换模式过程中出错:', error)
      uni.showToast({
        title: '切换失败，请稍后再试',
        icon: 'none',
      })
    } finally {
      isTogglingModel.value = false
    }
  }

  const handleSubmit = (message) => {
    console.log(message, 'handleSubmit')
  }

  // 从服务器获取系统配置
  const fetchSystemConfig = async () => {
    try {
      const res = await request(`${baseUrl}/system/get_system_setting`, 'GET')
      console.log('获取系统配置', res)

      // 更新shine_point配置
      if (res.data && res.data.shine_point) {
        Object.assign(shinePointConfig, res.data.shine_point)
      }

      // 更新system_model配置
      if (res.data && res.data.system_model) {
        // 更新常规模式配置
        if (res.data.system_model['常规模式']) {
          systemModelConfig['常规模式'] = res.data.system_model['常规模式']
        }

        // 更新金种子杯模式配置
        if (res.data.system_model['金种子杯模式']) {
          systemModelConfig['金种子杯模式'] =
            res.data.system_model['金种子杯模式']
          // 检查金种子杯模式是否可用
          isGoldModeAvailable.value =
            !!res.data.system_model['金种子杯模式'].valid
        }

        // 设置当前背景图
        bgSrc.value = systemModelConfig[currentModel.value].pic_url
      }
    } catch (error) {
      console.error('获取系统配置失败:', error)
    }
  }

  onLoad(async () => {
    try {
      // 页面显示时可以进行一些操作
      console.log('主页面显示')
      // 获取当前主题
      const currentSubject = await request(`${baseUrl}/user/user_info`, 'GET')
      console.log('获取当前主题', currentSubject.data.topic)
      // 更新主题
      sbStore.setSubject(currentSubject.data.topic)
      // 获取系统配置
      await fetchSystemConfig()

      // 尝试连接WebSocket
      if (!wsStore.isConnected) {
        await wsStore.connect()
        console.log('socket连接成功')

        // 发送连接成功的消息 - 仅在页面首次加载时
        await wsStore.sendMessage({
          system_model: currentModel.value,
          input_type: 3,
          text: '',
        })
        console.log('发送input_type=3的初始消息成功')
      }
    } catch (error) {
      console.error('页面显示时发生错误:', error)
      uni.showToast({
        title: '连接失败，请重试',
        icon: 'none',
      })
    }
  })

  onUnload(() => {
    // 页面隐藏时关闭WebSocket连接
    console.log('onHide主页面隐藏')

    // 上报当前音频播放状态
    audioPlayerStore.reportCurrentProgress()
    console.log('音频播放状态已上报')

    // 停止并清空所有音频队列
    audioPlayerStore.stopAllAudio()
    console.log('停止并清空所有音频队列')
    // 清空消息列表
    barrageStore.clearMessages()
    console.log('清空消息列表')

    // 关闭WebSocket连接
    wsStore.close()
    console.log('socket连接关闭')
  })

  // 添加onUnload钩子，在页面卸载时上报音频状态并清空队列
  // onUnload(() => {
  //   console.log('onUnload主页面卸载')

  //   // 上报当前音频播放状态
  //   audioPlayerStore.reportCurrentProgress()
  //   console.log('音频播放状态已上报')

  //   // 停止并清空所有音频队列
  //   audioPlayerStore.stopAllAudio()
  //   console.log('停止并清空所有音频队列')

  //   // 关闭WebSocket连接
  //   wsStore.close()
  //   console.log('socket连接关闭')
  // })
</script>

<style lang="scss" scoped>
  @import './index.scss';
  .popupshow {
    position: absolute;
    z-index: 9999;
  }
</style>
