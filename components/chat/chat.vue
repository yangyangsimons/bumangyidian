<template>
  <view class="chat-container">
    <view
      class="input-container-voice"
      v-if="showText && !isRadio"
      :style="colorSystem"
    >
      <image
        class="input-icon"
        src="../../static/keyboard.png"
        @click="changeInputTypeToText"
      />
      <button
        class="input-field"
        type="text"
        @longpress="startRecord"
        @touchend="endRecord"
        @touchmove="onTouchMove"
        @touchstart="onTouchStart"
      >
        按住说话
      </button>
    </view>
    <view
      class="input-container-text"
      v-if="!showText && !isRadio"
      :style="colorSystem"
    >
      <image
        class="input-voice-icon"
        src="../../static/voice.png"
        mode="scaleToFill"
        @click="changeInputTypeToVoice"
      />
      <input
        type="text"
        :placeholder="placeholderStore.currentPlaceholder"
        p
        :placeholder-style="inputColor"
        class="input-field-text"
        @input="onKeyInput"
        :value="inputValue"
        confirm-type="send"
        @confirm="handleSubmit"
        @focus="onInputFocus"
        @blur="onInputBlur"
        adjust-position="true"
      />
      <view class="send" @tap.stop="handleSubmit" v-if="sendAble">
        <image
          class="send-icon send-fly"
          src="../../static/send-icon.png"
          mode="scaleToFill"
        />
      </view>
      <view class="send wrap" v-if="!sendAble" @tap.stop="handleStopGenerate">
        <view class="round"></view>
        <view class="round"></view>
        <view class="round"></view>
        <view class="round"></view>
        <view class="round"></view>
        <view class="round"></view>
        <view class="round"></view>
        <view class="round"></view>
      </view>
    </view>
    <view
      class="input-container-text mainbox"
      v-if="isRadio"
      :style="colorSystem"
    >
      <!-- <view class="moving-element"></view> -->
      <image
        class="input-voice-icon"
        src="../../static/radio.png"
        mode="scaleToFill"
      />
      <input
        type="text"
        :placeholder="radioText"
        :placeholder-style="inputColor"
        class="input-field-text"
        adjust-position="true"
        disabled
        @tap="radioInputtap"
        @longpress="backToQA"
      />
      <view class="send" @tap.stop="stopRadio" v-if="radioPlay">
        <image
          class="send-icon"
          src="../../static/play.png"
          mode="scaleToFill"
        />
      </view>
      <view class="send" v-if="!radioPlay" @tap.stop="resumeRadio">
        <image
          class="send-icon"
          src="../../static/stop.png"
          mode="scaleToFill"
        />
      </view>
    </view>
    <image
      class="voice-icon"
      :src="voiceIconSrc"
      mode="scaleToFill"
      @click="toggleUserPopup"
    />
    <user-popup ref="userPopupRef"></user-popup>
  </view>
</template>

<script setup>
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
  import { ref, computed } from 'vue'
  import { useRecordingStore } from '@/stores/recording'
  import { useBarrageStore } from '@/stores/barrage'
  import { useWebSocketStore } from '@/stores/websocket'
  import { useModelStore } from '@/stores/model'
  import { useSubjectStore } from '../../stores/subject'
  import { baseUrl } from '@/utils/config'
  import { useSendStore } from '../../stores/send'
  import { useIsRadioStore } from '../../stores/isRadio'
  import { useAudioPlayerStore } from '../../stores/audioPlayer'
  import { subjectShowStore } from '../../stores/subjectShow'
  import { usePlaceholderStore } from '../../stores/placeholderStore'
  import request from '@/utils/request'

  // 获取placeholder store
  const placeholderStore = usePlaceholderStore()
  const subjectShow = subjectShowStore()
  const radioText = ref('电台播出中')
  const audioPlayerStore = useAudioPlayerStore()
  const sbStore = useSubjectStore()
  const wsStore = useWebSocketStore()
  const sendStore = useSendStore()
  const isRadioStore = useIsRadioStore()
  const radioPlay = ref(true)
  const colorSystem = ref('background: rgba(0, 0, 0, 0.2);')
  const inputColor = ref('color:rgba(255, 255, 255, 1)')
  // 设置能否发送消息
  const sendAble = computed(() => {
    return sendStore.send
  })
  const isRadio = computed(() => {
    return isRadioStore.isRadio
  })

  const voiceIconSrc = computed(() => {
    return isRadio.value
      ? '../../static/voice-icon-disable.png'
      : '../../static/voice-icon.png'
  })
  // const isRadio = ref(true)
  // 初始化聊天模式
  const modelStore = useModelStore()
  const message = ref('')
  const inputValue = ref('')
  const barrageStore = useBarrageStore()
  const recordingStore = useRecordingStore()
  const uploadMessage = ref({})
  const keyboardHeight = ref(32) // 默认底部距离
  const placeholder = ref('')
  const emit = defineEmits(['submit'])
  const showText = ref(false)

  var plugin = requirePlugin('WechatSI')
  let manager = plugin.getRecordRecognitionManager()
  const userPopupRef = ref(null)
  // 录音相关状态
  const touchStartY = ref(0)
  const shouldCancel = ref(false)
  const cancelThreshold = 50 // 上滑取消的阈值（单位：px）

  // 触摸开始时记录位置
  const onTouchStart = (event) => {
    touchStartY.value = event.touches[0].clientY
  }

  // 触摸移动时计算距离
  const onTouchMove = (event) => {
    if (!recordingStore.isRecording) return

    const currentY = event.touches[0].clientY
    const moveDistance = touchStartY.value - currentY

    // 当上滑距离超过阈值时，标记为取消状态
    if (moveDistance > cancelThreshold) {
      shouldCancel.value = true
    } else {
      shouldCancel.value = false
    }
  }

  //控制用户信息弹窗

  const toggleUserPopup = () => {
    if (isRadio.value) {
      uni.showToast({
        title: '电台模式下无法查看用户信息',
        icon: 'none',
        duration: 1500,
      })
      return
    }
    userPopupRef.value.open()
  }

  // 监听键盘高度变化
  const onInputFocus = (e) => {
    console.log('输入框获取焦点', e)
    // 判断是否已经登录过了，token是否存在
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showModal({
        title: '',
        content: '登录后体验完整功能',
        success: async (res) => {
          if (res.confirm) {
            console.log('用户点击确定')
            await wsStore.close()
            audioPlayerStore.stopAllAudio()
            barrageStore.clearMessages()
            console.log('用户点击确定')
            // 1秒钟之后跳转登录
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/login',
              })
            }, 1000)
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        },
      })
      return
    }
    // 获取键盘高度
    uni.onKeyboardHeightChange((res) => {
      if (res.height > 0) {
        keyboardHeight.value = res.height + 32 // 32rpx 是原本的底部距离
      } else {
        keyboardHeight.value = 32
      }
    })
  }

  const onInputBlur = () => {
    keyboardHeight.value = 32
  }

  // 点击切换输入框类型
  const changeInputTypeToText = () => {
    // 这里可以添加逻辑来切换输入类型
    console.log('切换到文字模式')
    showText.value = false
  }
  const changeInputTypeToVoice = () => {
    console.log('切换到语音模式')
    showText.value = true
  }

  // 录音开始
  const startRecord = () => {
    audioPlayerStore.setTtsVolume(0)
    console.log('开始录音')
    recordingStore.startRecording()
    console.log(recordingStore.isRecording)
    shouldCancel.value = false
    manager.start({
      lang: 'zh_CN',
    })
  }

  // 当用户松开手指时，结束录音并开始识别
  const endRecord = () => {
    console.log('结束录音')
    audioPlayerStore.setTtsVolume(1)
    recordingStore.stopRecording()
    console.log(recordingStore.isRecording)
    manager.stop()
    // 检查是否应该取消发送
    if (shouldCancel.value) {
      console.log('取消发送录音')
      shouldCancel.value = false
      uni.showToast({
        title: '已取消发送',
        icon: 'none',
        duration: 1500,
      })
      return
    }

    manager.onStop = (res) => {
      console.log('识别结束：', res.result)
      message.value = res.result
      // 发送识别结果到服务器
      // sendStore.setSend(false) // 设置不能发送消息

      handleUploadMessage(message.value)
      // barrageStore.addMessage({
      //   type: 'user',
      //   content: message.value,
      // })
    }
    manager.onError = (res) => {
      console.error('识别错误：', res)
    }
  }

  // 处理输入框的输入事件
  const onKeyInput = (event) => {
    // console.log('输入内容：', event.detail.value)
    inputValue.value = event.detail.value
  }

  // 提交消息
  const handleSubmit = () => {
    if (!sendAble.value) {
      console.log('不能发送消息')
      uni.showLoading({
        title: '加载中',
        mask: true,
      })
      return
    }
    if (!inputValue.value.trim()) return // 避免发送空消息

    // 保存当前输入值
    const currentInput = inputValue.value

    // 清空输入框
    inputValue.value = ''

    // 主动使输入框失去焦点，收起键盘
    uni.hideKeyboard()
    sendStore.setSend(false) // 设置能发送消息
    // 使用保存的输入值处理消息
    setTimeout(() => {
      handleUploadMessage(currentInput)
    }, 50) // 轻微延迟确保UI更新
  }

  // 处理停止生成消息
  const handleStopGenerate = () => {
    console.log('停止生成消息')
    // 这里可以添加停止生成消息的逻辑
    wsStore.sendMessage({
      input_type: 4,
      text: 'stop',
      system_model: modelStore.model,
    })
  }
  //上传的消息处理
  const handleUploadMessage = async (userMessage) => {
    if (!userMessage || !userMessage.trim()) return
    console.log('上传消息了sendAble:', sendAble.value)

    console.log('上传的消息:', userMessage)
    // 这里可以添加处理上传消息的逻辑
    const barrageMessages = barrageStore.messages
    if (
      barrageMessages.length >= 1 &&
      barrageMessages[barrageMessages.length - 1].type === 'subject'
    ) {
      console.log('上一个对话是主题选择')
      uploadMessage.system_model = useModelStore().model
      uploadMessage.input_type = 2
      uploadMessage.text = userMessage
      //延迟两秒钟之后查询用户信息
      setTimeout(async () => {
        const currentSubject = await request(`${baseUrl}/user/user_info`, 'GET')
        console.log('获取当前主题', currentSubject.data.topic)
        // 更新主题
        sbStore.setSubject(currentSubject.data.topic)
      }, 2000)
    } else {
      uploadMessage.system_model = useModelStore().model
      uploadMessage.input_type = 1
      uploadMessage.text = userMessage
    }

    wsStore.sendMessage(uploadMessage)
    barrageStore.addMessage({
      type: 'user',
      content: userMessage, // 使用传入的userMessage而不是inputValue
    })
    audioPlayerStore.stopTtsAudio()
  }
  // 停止电台
  const stopRadio = () => {
    radioPlay.value = false
    console.log('停止电台')
    audioPlayerStore.pauseBgMusic()
    audioPlayerStore.pauseTtsAudio()
  }
  // 恢复电台
  const resumeRadio = () => {
    radioPlay.value = true
    console.log('恢复电台')
    try {
      // audioPlayerStore.resumeBgMusic()
      // audioPlayerStore.playBgMusic()
      // audioPlayerStore.playTtsAudio()
      audioPlayerStore.resumeTtsAudio()
      audioPlayerStore.resumeBgMusic()
      audioPlayerStore.setBgLoop(false)
    } catch (e) {
      console.log('恢复电台失败', e)
      audioPlayerStore.resumeTtsAudio()
      // audioPlayerStore.resumeBgMusic()
    }
  }

  onShow(() => {
    // 页面显示时可以进行一些操作

    if (isRadioStore.isRadio) {
      voiceIconSrc.value = '../../static/voice-icon-disable.png'
    }
    console.log('聊天组件显示')
    console.log('聊天组件显示isRadio', isRadioStore.isRadio)
    //随机placeholder
    if (modelStore.model === '金种子杯模式') {
      placeholderStore.setRandomSpecialPlaceholder()
    } else {
      placeholderStore.setRandomNormalPlaceholder()
    }
  })

  onLoad(() => {
    // 这里可以进行一些初始化操作
    console.log('聊天组件加载完成')
  })

  onUnload(() => {
    // 移除键盘高度监听
    uni.offKeyboardHeightChange()
  })

  const radioInputtap = () => {
    radioText.value = '长按退出电台,可以聊天哦'
    setTimeout(() => {
      radioText.value = '电台播出中'
    }, 2000)
  }
  const backToQA = () => {
    console.log('返回问答')
    audioPlayerStore.stopAllAudio()
    modelStore.setModel('QA模式')
    isRadioStore.setIsRadio(false)
    subjectShow.setSubjectShow(true)
  }
</script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
