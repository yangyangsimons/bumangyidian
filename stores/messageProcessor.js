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

  // 添加用于去重的变量
  const lastFullText = ref('')

  // 添加歌词相关状态
  const lyricSyncInterval = ref(null)
  const currentLyrics = ref([])
  const lyricMessageId = ref(null)
  const currentLyricIndex = ref(-1)

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
          showTextMessage(data.text || data.msg)
        }
    }
  }

  // 处理背景音乐消息
  const handleBgMusic = (data) => {
    console.log('收到背景音乐消息', data)
    const { audio_url, play_time, section_id, audio_id } = data

    // 播放背景音乐
    audioPlayerStore.playBgMusic(audio_url, play_time, section_id, audio_id)

    // 设置背景音乐循环播放
    audioPlayerStore.setBgLoop(true)

    // 是不是广播模式
    if (data.is_radio && data.is_radio == 1) {
      console.log('当前是广播模式')
      isRadioStore.setIsRadio(true)
      audioPlayerStore.setBgLoop(false) // 设置为不循环播放

      // 处理歌词
      if (data.lrc) {
        console.log('当前是广播模式,歌词:', data.lrc)
        handleLyrics(data.lrc, play_time || 0)
      }
    }

    // 可以选择是否在对话界面显示音乐播放信息
    // barrageStore.addMessage({
    //   type: 'system',
    //   content: '🎵 背景音乐播放中...',
    //   showInUI: false, // 如果不想在界面显示，可以设置标记
    // })
  }

  // 处理歌词数据
  const handleLyrics = (lyricsData, play_time) => {
    // 停止之前可能存在的歌词同步
    stopLyricSync()

    // 保存歌词数据以便后续使用
    currentLyrics.value = lyricsData
    currentLyricIndex.value = -1

    // 启动歌词同步
    startLyricSync(lyricsData, play_time)
  }

  // 启动歌词同步
  // 启动歌词同步
  const startLyricSync = (lyricsData, play_time) => {
    // 先停止之前可能存在的同步
    stopLyricSync()

    // 解析时间格式，将歌词数据处理成更易于使用的格式
    const parsedLyrics = lyricsData.map((item) => ({
      text: item.text,
      startTime: parseTimeToSeconds(item.start),
    }))

    console.log('解析后的歌词数据:', parsedLyrics)

    // 设置同步定时器
    lyricSyncInterval.value = setInterval(() => {
      if (audioPlayerStore.bgIsPlaying) {
        const currentTime = audioPlayerStore.bgPlayTime
        updateLyricByTime(currentTime, parsedLyrics, play_time)
      }
    }, 1000) // 每100毫秒检查一次
  }

  // 停止歌词同步
  const stopLyricSync = () => {
    if (lyricSyncInterval.value) {
      clearInterval(lyricSyncInterval.value)
      lyricSyncInterval.value = null
    }
  }

  // 根据当前时间更新歌词显示
  const updateLyricByTime = (currentTime, lyrics, play_time) => {
    // 找出当前应该显示的歌词
    let newIndex = -1

    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].startTime) {
        newIndex = i
      } else {
        // 找到比当前时间大的就停止，因为歌词是按时间排序的
        break
      }
    }

    // 如果找到有效的歌词且与当前显示的不同，更新显示
    if (newIndex !== -1 && newIndex !== currentLyricIndex.value) {
      currentLyricIndex.value = newIndex
      console.log('当前歌词索引:', newIndex)
      if (play_time != 0 && currentTime == 0) {
        console.log(currentTime, '当前时间:', currentTime)
      } else {
        // 修改这里：不是更新现有歌词，而是添加新的歌词消息
        addLyricMessage(lyrics[newIndex].text)
      }
    }
  }

  // 更新歌词显示
  // 添加新的歌词消息 (新增函数)
  const addLyricMessage = (text) => {
    // 创建新的歌词消息，而不是更新现有消息
    barrageStore.addMessage({
      type: 'lyric',
      content: text,
      isLyric: true,
    })

    console.log('添加新歌词:', text)
  }

  // 将时间字符串转换为秒数
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 0

    const parts = timeStr.split(':')
    let seconds = 0

    if (parts.length === 3) {
      // 格式为 "h:mm:ss.ms"
      seconds =
        parseInt(parts[0]) * 3600 +
        parseInt(parts[1]) * 60 +
        parseFloat(parts[2])
    } else if (parts.length === 2) {
      // 格式为 "m:ss.ms"
      seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1])
    } else {
      // 格式为 "ss.ms"
      seconds = parseFloat(parts[0])
    }

    return seconds
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

    // 获取要展示的文本内容
    const textToShow = full_text || accumulatedText.value

    // 去空处理：如果文本为空、null、undefined或只包含空白字符，直接返回
    if (!textToShow || textToShow.trim() === '') {
      console.log('文本为空，跳过展示')
      // 重置流式状态
      isStreaming.value = false
      accumulatedText.value = ''
      return
    }

    // 去重处理：如果与上一次的full_text相同，跳过展示
    if (textToShow === lastFullText.value) {
      console.log('文本与上次相同，跳过展示:', textToShow)
      // 重置流式状态
      isStreaming.value = false
      accumulatedText.value = ''
      return
    }

    // 更新上一次的文本记录
    lastFullText.value = textToShow

    // 判断是否有正在进行的流式消息
    if (isStreaming.value && barrageStore.currentStreamingMessageId) {
      // 如果有流式消息，完成它
      barrageStore.finishStreamingMessage(textToShow)
    } else {
      // 如果没有流式消息，直接添加新消息
      barrageStore.addMessage({
        type: 'ai',
        content: textToShow,
        isStreaming: false,
      })
    }

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
    lastFullText.value = '' // 重置去重记录

    // 停止歌词同步
    stopLyricSync()
    currentLyrics.value = []
    lyricMessageId.value = null
    currentLyricIndex.value = -1
  }

  return {
    processMessage,
    resetProcessor,
    isStreaming,
    accumulatedText,

    // 暴露歌词相关方法（如果需要在外部调用）
    stopLyricSync,
    currentLyrics,
    currentLyricIndex,
  }
})
