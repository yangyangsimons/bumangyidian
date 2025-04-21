// stores/audioPlayer.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { baseUrl } from '../utils/config'
export const useQaAudioPlayerStore = defineStore('qAaudioPlayer', () => {
  // 背景音乐相关状态
  const bgAudioContext = ref(null)
  const bgSectionId = ref(null)
  const bgAudioId = ref(null)
  const bgPlayTime = ref(0)
  const bgIsPlaying = ref(false)

  // TTS相关状态
  const ttsAudioContext = ref(null)
  const ttsSectionId = ref(null)
  const ttsAudioId = ref(null)
  const ttsIsPlaying = ref(false)
  const ttsPlayTime = ref(0)

  // TTS音频队列
  const ttsQueue = ref([])
  const isProcessingQueue = ref(false)

  // 上报API地址
  const UPLOAD_PROGRESS_URL = `${baseUrl}/content/upload_progress`

  // 初始化背景音乐播放器
  const initBgAudioContext = () => {
    if (!bgAudioContext.value) {
      bgAudioContext.value = uni.createInnerAudioContext()

      // 播放结束事件
      bgAudioContext.value.onEnded(() => {
        console.log('背景音乐播放结束')
        // 上报播放完成
        reportBgMusicFinish()
        bgIsPlaying.value = false
      })

      // 记录当前播放时间，但不上报
      bgAudioContext.value.onTimeUpdate(() => {
        bgPlayTime.value = bgAudioContext.value.currentTime
      })

      // 错误处理
      bgAudioContext.value.onError((err) => {
        console.error('背景音乐播放错误', err)
        bgIsPlaying.value = false
      })
    }
  }

  // 初始化TTS音频播放器
  const initTtsAudioContext = () => {
    if (!ttsAudioContext.value) {
      ttsAudioContext.value = uni.createInnerAudioContext()

      // 播放结束事件
      ttsAudioContext.value.onEnded(() => {
        console.log('TTS音频播放结束', '队列长度:', ttsQueue.value.length)

        // 上报播放完成
        if (ttsSectionId.value && ttsAudioId.value) {
          reportTtsFinish()
        }

        ttsIsPlaying.value = false

        // 播放下一个队列中的音频
        playNextInQueue()
      })

      // 错误处理
      ttsAudioContext.value.onError((err) => {
        console.error('TTS音频播放错误', err)
        ttsIsPlaying.value = false

        // 即使出错，也尝试播放下一个
        playNextInQueue()
      })

      ttsAudioContext.value.onCanplay(() => {
        console.log('TTS音频已准备好播放')
        // 获取音频长度并存储
        if (ttsAudioContext.value.duration > 0) {
          ttsPlayTime.value = ttsAudioContext.value.duration
          console.log('TTS音频长度:', ttsPlayTime.value)
        }
      })

      ttsAudioContext.value.onPlay(() => {
        console.log('TTS音频开始播放')
      })

      // 添加时间更新事件监听，确保能获取到音频长度
      ttsAudioContext.value.onTimeUpdate(() => {
        if (ttsAudioContext.value.duration > 0 && ttsPlayTime.value === 0) {
          ttsPlayTime.value = ttsAudioContext.value.duration
          console.log('更新TTS音频长度:', ttsPlayTime.value)
        }
      })
    }
  }

  // 播放背景音乐
  const playBgMusic = (url, playTime = 0, sectionId = null, audioId = null) => {
    initBgAudioContext()

    // 保存相关ID
    bgSectionId.value = sectionId
    bgAudioId.value = audioId
    bgPlayTime.value = playTime

    // 设置音频源并播放
    bgAudioContext.value.src = url
    if (playTime > 0) {
      bgAudioContext.value.seek(playTime)
    }
    bgAudioContext.value.play()
    bgIsPlaying.value = true

    console.log('开始播放背景音乐', {
      url,
      playTime,
      sectionId,
      audioId,
    })
  }

  // 将TTS音频添加到播放队列
  const enqueueTtsAudio = (url, sectionId = null, audioId = null) => {
    console.log('将TTS音频添加到队列', {
      url,
      sectionId,
      audioId,
      currentQueueLength: ttsQueue.value.length,
    })

    // 添加到队列
    ttsQueue.value.push({
      url,
      sectionId,
      audioId,
    })

    // 如果队列没有在处理中，则开始处理
    if (!isProcessingQueue.value) {
      playNextInQueue()
    }
  }

  // 播放队列中的下一个TTS音频
  const playNextInQueue = () => {
    // 如果队列为空，重置处理状态
    if (ttsQueue.value.length === 0) {
      isProcessingQueue.value = false
      console.log('TTS队列为空，等待新音频')
      return
    }

    // 标记队列处理中
    isProcessingQueue.value = true

    // 取出队列中的第一个音频
    const nextAudio = ttsQueue.value.shift()
    console.log('播放队列中的下一个TTS音频', {
      remainingInQueue: ttsQueue.value.length,
      nextAudio,
    })

    // 播放该音频
    playTtsAudioDirectly(nextAudio.url, nextAudio.sectionId, nextAudio.audioId)
  }

  // 直接播放TTS音频（内部使用，不要直接调用）
  const playTtsAudioDirectly = (url, sectionId = null, audioId = null) => {
    initTtsAudioContext()

    // 保存相关ID
    ttsSectionId.value = sectionId
    ttsAudioId.value = audioId

    // 重置音频长度，确保为新音频重新获取长度
    ttsPlayTime.value = 0

    // 设置音频源并播放
    ttsAudioContext.value.src = url

    // 尝试播放
    try {
      ttsAudioContext.value.play()
      ttsIsPlaying.value = true
      console.log('正在播放TTS音频', {
        url: url.substring(0, 50) + '...', // 只显示URL的一部分，避免日志太长
        sectionId,
        audioId,
      })
    } catch (err) {
      console.error('播放TTS音频失败', err)
      // 继续下一个
      setTimeout(playNextInQueue, 500)
    }
  }

  // 外部接口：添加TTS音频到播放队列
  const playTtsAudio = (url, sectionId = null, audioId = null) => {
    // 将音频添加到队列
    enqueueTtsAudio(url, sectionId, audioId)
  }

  // 停止背景音乐
  const stopBgMusic = () => {
    if (bgAudioContext.value) {
      bgAudioContext.value.stop()
      bgIsPlaying.value = false
    }
  }

  // 停止TTS音频
  const stopTtsAudio = () => {
    if (ttsAudioContext.value) {
      ttsAudioContext.value.stop()
      ttsIsPlaying.value = false
    }

    // 清空队列
    ttsQueue.value = []
    isProcessingQueue.value = false
  }

  // 停止所有音频
  const stopAllAudio = () => {
    stopBgMusic()
    stopTtsAudio()
  }

  // 上报背景音乐播放完成
  const reportBgMusicFinish = () => {
    // 没有必要的ID就不上报
    if (!bgSectionId.value && !bgAudioId.value) return

    const reportData = {
      section_id: bgSectionId.value,
      audio_id: bgAudioId.value,
      play_time: Number(bgPlayTime.value.toFixed(1)),
      is_finish: true,
    }

    console.log('上报背景音乐播放完成', reportData)

    // 使用HTTP请求上报
    sendProgressReport(reportData)
  }

  // 上报TTS音频播放完成
  const reportTtsFinish = () => {
    // 没有必要的ID就不上报
    if (!ttsSectionId.value && !ttsAudioId.value) return

    const reportData = {
      section_id: ttsSectionId.value,
      audio_id: ttsAudioId.value,
      is_finish: true,
      play_time: Number(ttsPlayTime.value.toFixed(1)), // 添加play_time字段
    }

    console.log('上报TTS音频播放完成', reportData)

    // 使用HTTP请求上报
    sendProgressReport(reportData)
  }

  // 上报当前播放进度(App onHide时调用)
  const reportCurrentProgress = () => {
    // 如果背景音乐正在播放，上报当前进度
    if (bgIsPlaying.value && bgSectionId.value && bgAudioId.value) {
      const reportData = {
        section_id: bgSectionId.value,
        audio_id: bgAudioId.value,
        play_time: Number(bgPlayTime.value.toFixed(1)),
        is_finish: false,
      }

      console.log('上报背景音乐当前进度', reportData)
      sendProgressReport(reportData)
    }

    // 如果TTS正在播放，上报其进度
    if (ttsIsPlaying.value && ttsSectionId.value && ttsAudioId.value) {
      const reportData = {
        section_id: ttsSectionId.value,
        audio_id: ttsAudioId.value,
        is_finish: false,
        play_time: Number(ttsPlayTime.value.toFixed(1)), // 添加play_time字段
      }

      console.log('上报TTS当前进度', reportData)
      sendProgressReport(reportData)
    }
  }

  // 发送上报请求
  const sendProgressReport = (data) => {
    const token = uni.getStorageSync('token')

    uni.request({
      url: UPLOAD_PROGRESS_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      },
      data: data,
      success: (res) => {
        console.log('上报进度成功', res.data)
      },
      fail: (err) => {
        console.error('上报进度失败', err)
      },
    })
  }

  // 获取队列状态信息（用于调试）
  const getQueueStatus = () => {
    return {
      queueLength: ttsQueue.value.length,
      isProcessing: isProcessingQueue.value,
      currentlyPlaying: ttsIsPlaying.value
        ? {
            sectionId: ttsSectionId.value,
            audioId: ttsAudioId.value,
          }
        : null,
    }
  }

  return {
    // 背景音乐相关
    playBgMusic,
    stopBgMusic,
    bgIsPlaying,

    // TTS相关
    playTtsAudio,
    stopTtsAudio,
    ttsIsPlaying,
    getQueueStatus,

    // 通用方法
    stopAllAudio,
    reportCurrentProgress,

    // 播放状态
    get isAnyPlaying() {
      return bgIsPlaying.value || ttsIsPlaying.value
    },

    // 队列长度（便于调试显示）
    get queueLength() {
      return ttsQueue.value.length
    },
  }
})
