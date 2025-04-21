// stores/messageProcessor.js
import { defineStore } from 'pinia'
import { useBarrageStore } from './barrage'
import { useAudioPlayerStore } from './audioPlayer'
import { ref } from 'vue'
import { useSendStore } from './send'
import { useIsRadioStore } from './isRadio'
export const useMessageProcessorStore = defineStore('messageProcessor', () => {
  const barrageStore = useBarrageStore()
  const audioPlayerStore = useAudioPlayerStore()
  const sendStore = useSendStore()
  const isRadioStore = useIsRadioStore()
  // 处理接收到的流式消息
  const isStreaming = ref(false)
  const accumulatedText = ref('')
  const lastSectionId = ref(null)

  // 处理接收到的消息
  const processMessage = (data) => {
    // 如果是字符串，先尝试解析为JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        console.error('消息解析失败', e)
        // 作为纯文本消息处理
        showTextMessage(data)
        return
      }
    }

    // 根据cmd类型处理不同消息
    switch (data.cmd) {
      case 'bg_music':
        handleBgMusic(data)
        break
      case 'audio':
        handleTtsAudio(data)
        break
      case 'finish':
        handleFinishMessage(data)
        break
      case 'subject':
        handleSubjectRequest(data)
        break
      case 'error':
        handleErrorMessage(data)
        break
      default:
        // 未知消息类型，尝试作为文本显示
        console.warn('未知消息类型', data)
        if (data.text || data.msg) {
          showTextMessage(data.msg)
        }
    }
  }

  // 处理背景音乐消息
  const handleBgMusic = (data) => {
    console.log('收到背景音乐消息', data)
    const { audio_url, play_time, section_id, audio_id } = data
    // 播放背景音乐
    audioPlayerStore.playBgMusic(audio_url, play_time, section_id, audio_id)
    //设置背景音乐循环播放
    audioPlayerStore.setBgLoop(true)
    // 是不是广播模式
    if (data.is_radio && data.is_radio == 1) {
      console.log('当前是广播模式')
      isRadioStore.setIsRadio(true)
      audioPlayerStore.setBgLoop(false) // 设置为不循环播放
    }
    if (data.is_radio && data.lrc) {
      console.log('当前是广播模式,歌词:', data.lrc)
    }

    // 可以选择是否在对话界面显示音乐播放信息
    // barrageStore.addMessage({
    //   type: 'system',
    //   content: '🎵 背景音乐播放中...',
    //   showInUI: false, // 如果不想在界面显示，可以设置标记
    // })
  }

  // 处理TTS音频消息
  const handleTtsAudio = (data) => {
    console.log('收到TTS音频消息', data)
    if (data.is_radio && data.is_radio == 1) {
      console.log('当前是广播模式')
      isRadioStore.setIsRadio(true)
    }
    const { audio_url, section_id, audio_id, text } = data
    //设置为不能发送消息
    sendStore.setSend(false)
    // 记录当前处理的section_id
    lastSectionId.value = section_id

    // // 播放TTS音频
    audioPlayerStore.playTtsAudio(audio_url, section_id, audio_id)
    if (text) {
      console.log('处理文本:')

      // 如果是新的对话或新的section，开始新的流式消息
      if (!isStreaming.value || lastSectionId.value !== section_id) {
        console.log('开始新的流式消息', {
          isStreaming: isStreaming.value,
          lastSectionId: lastSectionId.value,
          newSectionId: section_id,
        })
        isStreaming.value = true
        accumulatedText.value = ''
        barrageStore.startNewStreamingMessage()
      }

      // 累积文本
      accumulatedText.value += text

      // 向弹幕添加文本
      barrageStore.appendToStreamingMessage(text)

      console.log('当前累积文本:', accumulatedText.value)
    }
  }

  // 处理结束消息
  const handleFinishMessage = (data) => {
    console.log('收到结束消息', data)
    // 设置可以发送消息
    sendStore.setSend(true)
    const { full_text } = data

    // 如果有full_text，用它替换累积的文本
    if (full_text) {
      accumulatedText.value = full_text
    }

    // 结束流式消息，使用累积的文本或full_text
    barrageStore.finishStreamingMessage(full_text || accumulatedText.value)

    // 重置流式状态
    isStreaming.value = false
    accumulatedText.value = ''
  }

  // 处理主题选择请求
  const handleSubjectRequest = (data) => {
    console.log('收到主题选择请求', data)
    const subjects = data.subjects.join('\n')
    console.log('可选主题列表', subjects)
    // 显示可选主题列表
    barrageStore.addMessage({
      type: 'subject',
      content: data.msg + '\n' + subjects,
    })
  }

  // 处理错误消息
  const handleErrorMessage = (data) => {
    console.log('收到错误消息', data)
    const { text } = data

    // 显示错误信息
    uni.showToast({
      title: text || '系统错误',
      icon: 'none',
      duration: 2000,
    })

    // 同时在对话界面显示
    // barrageStore.addMessage({
    //   type: 'error',
    //   content: text || '系统错误',
    // })
  }

  // 通用显示文本消息
  const showTextMessage = (text, type = 'ai') => {
    if (!text) return

    barrageStore.addMessage({
      type: type,
      content: text,
    })
  }

  // 添加一个重置方法
  const resetProcessor = () => {
    isStreaming.value = false
    accumulatedText.value = ''
    lastSectionId.value = null
  }

  return {
    processMessage,
    resetProcessor, // 暴露这个方法
    isStreaming, // 如果需要在外部访问这些状态，也可以暴露
    accumulatedText,
  }
})
