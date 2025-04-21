// stores/audioPlayer.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { baseUrl } from '../utils/config'
import { useSubjectStore } from './subject' // 导入主题store
import { useIsRadioStore } from './isRadio'
import { useMessageProcessorStore } from './messageProcessor' // 导入messageProcessor

export const useAudioPlayerStore = defineStore('audioPlayer', () => {
  // 获取主题store
  const subjectStore = useSubjectStore()
  const isRadioStore = useIsRadioStore()

  // 背景音乐相关状态
  const bgAudioManager = ref(null)
  const bgSectionId = ref(null)
  const bgAudioId = ref(null)
  const bgPlayTime = ref(0)
  const bgIsPlaying = ref(false)
  const bgVolume = ref(1.0) // 背景音乐音量，范围0-1
  const bgLoop = ref(false) // 是否循环播放背景音乐
  const currentBgUrl = ref('') // 当前背景音乐URL，用于循环播放时重新播放

  // 计算属性：获取当前音乐标题（基于主题）
  const musicTitle = computed(() => {
    return `${subjectStore.subject}`
  })

  // TTS相关状态
  const ttsAudioContext = ref(null)
  const ttsSectionId = ref(null)
  const ttsAudioId = ref(null)
  const ttsIsPlaying = ref(false)
  const ttsPlayTime = ref(0)
  const ttsVolume = ref(1.0) // TTS音量，范围0-1
  const ttsPaused = ref(false) // 新增：TTS是否被暂停（与停止不同）
  const currentTtsUrl = ref('') // 新增：当前TTS音频URL，用于恢复播放

  // TTS音频队列
  const ttsQueue = ref([])
  const isProcessingQueue = ref(false)

  // 上报API地址
  const UPLOAD_PROGRESS_URL = `${baseUrl}/content/upload_progress`

  // 初始化背景音乐播放器 (使用backgroundAudioManager)
  const initBgAudioManager = () => {
    if (!bgAudioManager.value) {
      bgAudioManager.value = uni.getBackgroundAudioManager()

      // 播放结束事件
      bgAudioManager.value.onEnded(() => {
        console.log('背景音乐播放结束')

        // 如果设置了循环播放，则重新播放
        if (bgLoop.value && currentBgUrl.value) {
          console.log('背景音乐循环播放')
          // 短暂延迟以避免可能的问题
          setTimeout(() => {
            playBgMusic(
              currentBgUrl.value,
              0,
              bgSectionId.value,
              bgAudioId.value
            )
          }, 100)
        } else {
          // 上报播放完成
          reportBgMusicFinish()
          bgIsPlaying.value = false

          // 停止歌词同步
          try {
            const messageProcessorStore = useMessageProcessorStore()
            if (messageProcessorStore && messageProcessorStore.stopLyricSync) {
              messageProcessorStore.stopLyricSync()
            }
          } catch (err) {
            console.error('停止歌词同步失败', err)
          }
        }
      })

      // 记录当前播放时间
      bgAudioManager.value.onTimeUpdate(() => {
        bgPlayTime.value = bgAudioManager.value.currentTime
      })

      // 错误处理
      bgAudioManager.value.onError((err) => {
        console.error('背景音乐播放错误', err)
        bgIsPlaying.value = false

        // 发生错误时停止歌词同步
        try {
          const messageProcessorStore = useMessageProcessorStore()
          if (messageProcessorStore && messageProcessorStore.stopLyricSync) {
            messageProcessorStore.stopLyricSync()
          }
        } catch (err) {
          console.error('停止歌词同步失败', err)
        }
      })

      // 停止事件
      bgAudioManager.value.onStop(() => {
        console.log('背景音乐已停止')
        bgIsPlaying.value = false

        // 背景音乐停止时停止歌词同步
        try {
          const messageProcessorStore = useMessageProcessorStore()
          if (messageProcessorStore && messageProcessorStore.stopLyricSync) {
            messageProcessorStore.stopLyricSync()
          }
        } catch (err) {
          console.error('停止歌词同步失败', err)
        }
      })

      // 播放事件
      bgAudioManager.value.onPlay(() => {
        console.log('背景音乐开始播放')
        bgIsPlaying.value = true
      })

      // 暂停事件
      bgAudioManager.value.onPause(() => {
        console.log('背景音乐已暂停')
        bgIsPlaying.value = false
      })
    }
  }

  // 更新背景音乐属性
  const updateBgMusicProperties = () => {
    if (bgAudioManager.value) {
      // 使用当前主题设置标题
      bgAudioManager.value.title = musicTitle.value
      bgAudioManager.value.epname = '小程序背景音乐'

      // 如果需要可以设置封面
      bgAudioManager.value.coverImgUrl = '../../static/logo.png'

      console.log('更新背景音乐属性:', {
        title: musicTitle.value,
      })
    }
  }

  // 初始化TTS音频播放器
  const initTtsAudioContext = () => {
    if (!ttsAudioContext.value) {
      ttsAudioContext.value = uni.createInnerAudioContext()

      // 设置初始音量
      ttsAudioContext.value.volume = ttsVolume.value

      // 播放结束事件
      ttsAudioContext.value.onEnded(() => {
        console.log('TTS音频播放结束', '队列长度:', ttsQueue.value.length)

        // 上报播放完成
        if (ttsSectionId.value && ttsAudioId.value) {
          reportTtsFinish()
        }

        ttsIsPlaying.value = false
        ttsPaused.value = false // 重置暂停状态

        // 播放下一个队列中的音频
        playNextInQueue()
      })

      // 错误处理
      ttsAudioContext.value.onError((err) => {
        console.error('TTS音频播放错误', err)
        ttsIsPlaying.value = false
        ttsPaused.value = false // 重置暂停状态

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
        ttsIsPlaying.value = true
        ttsPaused.value = false // 重置暂停状态
      })

      // 添加时间更新事件监听，确保能获取到音频长度
      ttsAudioContext.value.onTimeUpdate(() => {
        if (ttsAudioContext.value.duration > 0 && ttsPlayTime.value === 0) {
          ttsPlayTime.value = ttsAudioContext.value.duration
          console.log('更新TTS音频长度:', ttsPlayTime.value)
        }
      })

      // 添加暂停事件监听
      ttsAudioContext.value.onPause(() => {
        console.log('TTS音频已暂停')
        ttsIsPlaying.value = false
        ttsPaused.value = true // 设置暂停状态
      })
    }
  }

  // 设置TTS音量
  const setTtsVolume = (volume) => {
    // 确保音量在0-1之间
    volume = Math.min(1.0, Math.max(0.0, volume))
    ttsVolume.value = volume

    // 如果音频上下文已初始化，直接设置音量
    if (ttsAudioContext.value) {
      ttsAudioContext.value.volume = volume
      console.log('TTS音量已设置为:', volume)
    }

    return volume // 返回实际设置的音量值
  }

  // 设置背景音乐音量
  const setBgVolume = (volume) => {
    // 确保音量在0-1之间
    volume = Math.min(1.0, Math.max(0.0, volume))
    bgVolume.value = volume

    // 如果背景音乐管理器已初始化，直接设置音量
    if (bgAudioManager.value) {
      bgAudioManager.value.volume = volume
      console.log('背景音乐音量已设置为:', volume)
    }

    return volume // 返回实际设置的音量值
  }

  // 设置背景音乐循环播放状态
  const setBgLoop = (loop) => {
    bgLoop.value = !!loop // 转为布尔值
    console.log('背景音乐循环播放状态设置为:', bgLoop.value)
    return bgLoop.value
  }

  // 播放背景音乐（使用backgroundAudioManager）
  const playBgMusic = (url, playTime = 0, sectionId = null, audioId = null) => {
    initBgAudioManager()

    // 保存相关ID和URL（用于循环播放）
    bgSectionId.value = sectionId
    bgAudioId.value = audioId
    bgPlayTime.value = playTime
    currentBgUrl.value = url

    // 更新背景音乐属性（使用当前主题）
    updateBgMusicProperties()

    // 设置音频源并播放
    bgAudioManager.value.src = url

    // 设置音量
    bgAudioManager.value.volume = bgVolume.value

    // 设置播放位置
    if (playTime > 0) {
      bgAudioManager.value.startTime = playTime
    }

    // backgroundAudioManager设置src后会自动播放
    bgIsPlaying.value = true

    console.log('开始播放背景音乐', {
      url,
      playTime,
      sectionId,
      audioId,
      title: musicTitle.value,
      volume: bgVolume.value,
      loop: bgLoop.value,
    })
  }

  // 暂停背景音乐
  const pauseBgMusic = () => {
    if (bgAudioManager.value && bgIsPlaying.value) {
      bgAudioManager.value.pause()
      bgIsPlaying.value = false
      console.log('背景音乐已暂停')
    }
  }

  // 恢复背景音乐播放
  const resumeBgMusic = () => {
    if (bgAudioManager.value && !bgIsPlaying.value && currentBgUrl.value) {
      // 更新背景音乐属性（如果主题已变化）
      updateBgMusicProperties()

      // 如果已经创建了对象但未播放，尝试直接播放
      try {
        bgAudioManager.value.play()
        bgIsPlaying.value = true
        console.log('背景音乐恢复播放')
      } catch (err) {
        console.error('背景音乐恢复播放失败', err)
        // 如果直接播放失败，尝试重新设置src
        playBgMusic(
          currentBgUrl.value,
          bgPlayTime.value,
          bgSectionId.value,
          bgAudioId.value
        )
      }
    } else if (currentBgUrl.value) {
      // 如果没有创建对象或其他原因，重新播放
      playBgMusic(
        currentBgUrl.value,
        bgPlayTime.value,
        bgSectionId.value,
        bgAudioId.value
      )
    }
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

    // 保存相关ID和URL
    ttsSectionId.value = sectionId
    ttsAudioId.value = audioId
    currentTtsUrl.value = url // 保存当前URL，用于恢复播放

    // 重置音频长度，确保为新音频重新获取长度
    ttsPlayTime.value = 0

    // 设置音频源并播放
    ttsAudioContext.value.src = url

    // 确保使用当前设置的音量
    ttsAudioContext.value.volume = ttsVolume.value

    // 尝试播放
    try {
      ttsAudioContext.value.play()
      ttsIsPlaying.value = true
      ttsPaused.value = false // 重置暂停状态
      console.log('正在播放TTS音频', {
        url: url.substring(0, 50) + '...', // 只显示URL的一部分，避免日志太长
        sectionId,
        audioId,
        volume: ttsVolume.value,
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

  // 暂停/恢复背景音乐（切换状态）
  const toggleBgMusic = () => {
    if (bgIsPlaying.value) {
      pauseBgMusic()
    } else {
      resumeBgMusic()
    }
  }

  // 暂停/恢复TTS音频（切换状态）
  const toggleTtsAudio = () => {
    if (!ttsAudioContext.value) return

    if (ttsIsPlaying.value) {
      pauseTtsAudio()
    } else {
      resumeTtsAudio()
    }
  }

  // 暂停TTS音频
  const pauseTtsAudio = () => {
    if (ttsAudioContext.value && ttsIsPlaying.value) {
      ttsAudioContext.value.pause()
      ttsIsPlaying.value = false
      ttsPaused.value = true
      console.log('TTS音频已暂停')
    }
  }

  // 恢复TTS音频播放
  const resumeTtsAudio = () => {
    if (!ttsAudioContext.value) {
      console.log('TTS音频上下文未初始化，无法恢复播放')
      return
    }

    if (ttsPaused.value && currentTtsUrl.value) {
      // 尝试恢复播放
      try {
        // 如果暂停状态，则直接播放当前音频
        ttsAudioContext.value.play()
        ttsIsPlaying.value = true
        ttsPaused.value = false
        console.log('恢复TTS音频播放')
      } catch (err) {
        console.error('恢复TTS音频播放失败', err)

        // 如果直接恢复失败，尝试重新设置音频源
        ttsAudioContext.value.src = currentTtsUrl.value
        ttsAudioContext.value.volume = ttsVolume.value
        ttsAudioContext.value.play()
        ttsIsPlaying.value = true
        ttsPaused.value = false
      }
    } else if (!ttsIsPlaying.value && ttsQueue.value.length > 0) {
      // 如果没有暂停的音频但队列中有待播放的内容，播放下一个
      playNextInQueue()
    } else {
      console.log('没有可恢复播放的TTS音频')
    }
  }

  // 停止背景音乐
  const stopBgMusic = () => {
    if (bgAudioManager.value) {
      bgAudioManager.value.stop()
      bgIsPlaying.value = false
    }
  }

  // 停止TTS音频
  const stopTtsAudio = () => {
    if (ttsAudioContext.value) {
      ttsAudioContext.value.stop()
      ttsIsPlaying.value = false
      ttsPaused.value = false // 重置暂停状态
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
    // 设置为非电台模式
    isRadioStore.setIsRadio(false)
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

  // 清除TTS音频相关信息（重置TTS状态）
  const resetTtsAudio = () => {
    console.log('重置TTS音频状态')

    // 如果正在播放，先停止
    if (ttsIsPlaying.value && ttsAudioContext.value) {
      ttsAudioContext.value.stop()
    }

    // 重置TTS相关状态
    ttsSectionId.value = null
    ttsAudioId.value = null
    ttsIsPlaying.value = false
    ttsPlayTime.value = 0
    ttsPaused.value = false
    currentTtsUrl.value = ''

    // 清空队列
    ttsQueue.value = []
    isProcessingQueue.value = false

    // 保留音量设置，不重置ttsVolume.value

    console.log('TTS音频状态已重置')
  }

  // 清除背景音乐相关信息（重置背景音乐状态）
  const resetBgMusic = () => {
    console.log('重置背景音乐状态')

    // 如果正在播放，先停止
    if (bgIsPlaying.value && bgAudioManager.value) {
      bgAudioManager.value.stop()
    }

    // 重置背景音乐相关状态
    bgSectionId.value = null
    bgAudioId.value = null
    bgIsPlaying.value = false
    bgPlayTime.value = 0
    currentBgUrl.value = ''

    // 保留音量和循环设置，不重置bgVolume.value和bgLoop.value

    console.log('背景音乐状态已重置')

    // 停止歌词同步
    try {
      const messageProcessorStore = useMessageProcessorStore()
      if (messageProcessorStore && messageProcessorStore.stopLyricSync) {
        messageProcessorStore.stopLyricSync()
      }
    } catch (err) {
      console.error('停止歌词同步失败', err)
    }
  }

  return {
    // 背景音乐相关
    playBgMusic,
    stopBgMusic,
    pauseBgMusic,
    resumeBgMusic,
    toggleBgMusic,
    bgIsPlaying,
    bgPlayTime, // 确保导出这个用于歌词同步
    setBgVolume,
    bgVolume,
    setBgLoop,
    bgLoop,
    musicTitle, // 导出计算属性，便于UI显示
    resetBgMusic, // 新增：重置背景音乐

    // TTS相关
    playTtsAudio,
    stopTtsAudio,
    toggleTtsAudio,
    pauseTtsAudio, // 新增：暂停TTS音频
    resumeTtsAudio, // 新增：恢复TTS音频播放
    ttsIsPlaying,
    ttsPaused, // 新增：TTS暂停状态
    setTtsVolume,
    ttsVolume,
    getQueueStatus,
    resetTtsAudio, // 新增：重置TTS音频

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
//
