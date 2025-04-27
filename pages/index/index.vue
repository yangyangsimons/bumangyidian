<template>
  <view class="cover">
    <image class="global-title" src="../../static/global-title.png"></image>
    <!-- 当金种子杯模式有效时显示切换按钮 -->
    <button
      v-if="isGoldModeAvailable"
      class="changeModel"
      @click="toggleSystemModel"
    >
      <view class="botton-title">
        <image
          :src="changeModelSrc"
          mode="scaleToFill"
          class="change-model-pic"
        />
        <text class="model">{{
          currentModel === '常规模式' ? '「不芒」学长' : '「树洞」模式'
        }}</text>
      </view>

      <text class="talk">{{
        currentModel === '常规模式' ? '创新创业专家解读' : '陪你早安到晚安'
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
    <view
      class="subject-container"
      v-if="currentModel != '金种子杯模式' && subjectShow"
      :style="{ color: systemColor }"
    >
      <view class="title">今日话题</view>
      <view class="subject-scroll-view">
        <view
          class="marquee-content"
          :style="{ transform: `translateX(${-scrollPosition}px)` }"
        >
          <view class="subject">{{ subejctText }}</view>
          <view class="space" v-if="needScroll"></view>
          <view class="subject" v-if="needScroll">{{ subejctText }}</view>
        </view>
      </view>
    </view>
    <view class="barrage-container">
      <barrage />
    </view>
    <chat @submit="handleSubmit" />
    <guide />
  </view>
</template>

<script setup>
  import { ref, reactive, computed, nextTick, watch } from 'vue'
  import { wsUrl, baseUrl } from '../../utils/config'
  import {
    onLoad,
    onUnload,
    onShow,
    onHide,
    onShareAppMessage,
    onShareTimeline,
  } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import barrage from '@/components/barrage/barrage.vue'
  import chat from '@/components/chat/chat.vue'
  import guide from '@/components/guide/guide.vue'
  import { useWebSocketStore } from '@/stores/websocket'
  import { useBarrageStore } from '../../stores/barrage'
  import { useModelStore } from '../../stores/model'
  // 导入音频播放器状态管理
  import { useAudioPlayerStore } from '@/stores/audioPlayer'
  import recordAnimation from '../../components/record-animation/record-animation.vue'
  //导入主题管理
  import { useSubjectStore } from '../../stores/subject'
  import { useIsRadioStore } from '../../stores/isRadio'
  import { subjectShowStore } from '../../stores/subjectShow'
  import { usePlaceholderStore } from '../../stores/placeholderStore'
  import { useToggleModelStore } from '../../stores/toggleModelStore'

  const toggleModelStore = useToggleModelStore()

  // 监听 store 中的状态变化
  watch(
    () => toggleModelStore.shouldToggleModel,
    (newValue) => {
      if (newValue) {
        // 如果状态为 true，则执行 toggleModelchange 函数
        toggleSystemModel()
        // 执行完后重置状态
        toggleModelStore.resetModelChangeFlag()
      }
    }
  )
  const placeholderStore = usePlaceholderStore()

  //主题管理
  const systemColor = ref('rgba(26, 28, 30, 1);')
  const subjectshowStore = subjectShowStore()
  const subjectShow = computed(() => {
    return isRadioStore.isRadio || subjectshowStore.subjectShow ? true : false
  })
  //导入电台模式状态
  const isRadioStore = useIsRadioStore()
  const isRadio = computed(() => isRadioStore.isRadio)
  const changeModelSrc = ref('../../static/changeModel.png')

  // 响应式数据
  const scrollPosition = ref(0)
  const needScroll = ref(false)
  let scrollTimer = null
  let textWidth = 0
  const scrollSpeed = 1 // 每次移动的像素
  const scrollDelay = 10 // 滚动间隔（毫秒）
  // 生命周期钩子
  onShow(() => {
    nextTick(() => {
      initScroll()
    })
  })

  onHide(() => {
    stopScroll()
  })

  // 方法
  const initScroll = () => {
    const query = uni.createSelectorQuery()
    query
      .select('.subject')
      .boundingClientRect((textRect) => {
        query
          .select('.subject-scroll-view')
          .boundingClientRect((containerRect) => {
            if (textRect && containerRect) {
              textWidth = textRect.width

              // 如果文本宽度大于容器宽度，需要滚动
              if (textRect.width > containerRect.width) {
                needScroll.value = true
                startScroll()
              }
            }
          })
          .exec()
      })
      .exec()
  }

  const startScroll = () => {
    stopScroll()

    scrollTimer = setInterval(() => {
      scrollPosition.value += scrollSpeed

      // 当滚动到第一个文本的末尾时，重置位置
      if (scrollPosition.value >= textWidth + 60) {
        scrollPosition.value = 0
      }
    }, scrollDelay)
  }

  const stopScroll = () => {
    if (scrollTimer) {
      clearInterval(scrollTimer)
      scrollTimer = null
    }
  }

  // 切换非电台模式
  const toggleRadioModel = () => {
    isRadioStore.setIsRadio(!isRadio.value)
    console.log('切换电台模式', isRadio.value)
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
        //更新随机的placeholder

        modelStore.setModel('金种子杯模式')
        placeholderStore.setRandomSpecialPlaceholder()
        isRadioStore.setIsRadio(false)
      } else {
        modelStore.setModel('常规模式')
        placeholderStore.setRandomNormalPlaceholder()
      }
      // 上报当前音频播放状态,停止所有音频并清空所有音频队列
      // 关闭连接
      await wsStore.close()
      console.log('模式切换WebSocket连接已关闭')

      // 等待一段时间，确保连接完全关闭
      await new Promise((resolve) => setTimeout(resolve, 1000))

      try {
        // 重新连接
        await wsStore.connect()
        console.log('切换模式的socket重新连接成功')

        // 等待连接稳定
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 发送模式切换消息
        if (currentModel.value === '金种子杯模式') {
          changeModelSrc.value = '../../static/changeModel-2.png'
          await wsStore.sendMessage({
            system_model: currentModel.value,
            input_type: 3,
            text: '',
          })
          console.log('模式切换消息发送成功')
        } else {
          changeModelSrc.value = '../../static/changeModel.png'
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

  onShow(async () => {
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

      // 设置当前模式
      if (isRadio.value) {
        // 如果是电台模式，直接返回
        console.log('电台模式下执行的onShow逻辑', isRadio.value)
        console.log('背景音乐是否正在播放', audioPlayerStore.bgIsPlaying)
        // audioPlayerStore.stopAllAudio()
        // 尝试连接WebSocket
        if (!wsStore.isConnected) {
          await wsStore.connect()
          console.log('socket连接成功')

          // 发送连接成功的消息 - 仅在页面首次加载时
        }
      } else {
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
      }
    } catch (error) {
      console.error('页面显示时发生错误:', error)
      uni.showToast({
        title: '连接失败，请重试',
        icon: 'none',
      })
    }
  })

  onHide(async () => {
    // 页面隐藏时关闭WebSocket连接
    console.log('onHide主页面隐藏')

    // 上报当前音频播放状态
    audioPlayerStore.reportCurrentProgress()
    console.log('音频播放状态已上报')

    // 停止并清空所有音频队列
    if (isRadio.value) {
      // 如果是电台模式，就不停止背景音乐
      console.log('电台模式下不停止背景音乐onHide', isRadio.value)
      audioPlayerStore.stopTtsAudio()
    } else {
      audioPlayerStore.stopAllAudio()
      barrageStore.clearMessages()
      console.log('停止并清空所有音频队列', '非电台模式下停止背景音乐')
      // 清空消息列表
      console.log('清空消息列表')
    }

    // 关闭WebSocket连接
    await wsStore.close()
    console.log('Hidesocket连接关闭')
  })
  onShareAppMessage(() => {
    console.log('onShareAppMessage......')
    return {
      title: `不芒一点，陪你世界加一点`,
      imageUrl: '../../static/share.png',
      path: '/pages/index/index',
    }
  })
  onShareTimeline(() => {
    console.log('onShareTimeline......')
    return {
      title: `不芒一点，陪你世界加一点`,
    }
  })
</script>

<style lang="scss" scoped>
  @import './index.scss';
  .popupshow {
    position: absolute;
    z-index: 9999;
  }
</style>
