// stores/audioPlayer.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { baseUrl } from '../utils/config'
export const useAudioPlayerStore1 = defineStore('audioPlayer1', () => {
  // 背景音乐相关状态
  const bgAudioContext = ref(null)
  const bgSectionId = ref(null)
  const bgAudioId = ref(null)
  const bgPlayTime = ref(0)
  const bgIsPlaying = ref(false)
  const bgVolume = ref(1.0) // 背景音乐音量控制，默认为1.0（最大音量）
  const bgLoop = ref(false) // 背景音乐循环播放状态，默认不循环

  // TTS相关状态
  const ttsAudioContext = ref(null)
  const ttsSectionId = ref(null)
  const ttsAudioId = ref(null)
  const ttsIsPlaying = ref(false)
  const ttsPlayTime = ref(0)
  const ttsVolume = ref(1.0) // TTS音量控制，默认为1.0（最大音量）

  // 背景音频管理器（用于后台播放TTS）
  const backgroundAudioManager = ref(null)

  // 控制播放器类型
  const useBackgroundAudio = ref(true) // 是否使用backgroundAudioManager
  const isBackgroundAudioAvailable = ref(false) // 背景音频API是否可用

  // TTS音频队列
  const ttsQueue = ref([])
  const isProcessingQueue = ref(false)
  const isPreloading = ref(false) // 是否正在预加载下一音频
  const nextAudioPreloaded = ref(null) // 预加载的下一个音频

  // 记录当前播放的背景音乐URL（用于循环播放）
  const currentBgMusicUrl = ref('')

  // 上报API地址
  const UPLOAD_PROGRESS_URL = `${baseUrl}/content/upload_progress`

  // 检查环境是否支持BackgroundAudioManager
  const checkBackgroundAudioAvailability = () => {
    isBackgroundAudioAvailable.value =
      typeof wx !== 'undefined' &&
      typeof wx.getBackgroundAudioManager === 'function'
    return isBackgroundAudioAvailable.value
  }

  // 初始化背景音频管理器（用于TTS播放）
  const initBackgroundAudioManager = () => {
    if (!backgroundAudioManager.value && isBackgroundAudioAvailable.value) {
      try {
        backgroundAudioManager.value = wx.getBackgroundAudioManager()

        // 设置必要的属性
        backgroundAudioManager.value.title = 'TTS音频'
        backgroundAudioManager.value.epname = 'TTS播放'
        backgroundAudioManager.value.singer = '小程序'

        // 播放结束事件
        backgroundAudioManager.value.onEnded(() => {
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
        backgroundAudioManager.value.onError((err) => {
          console.error('TTS音频播放错误', err)
          ttsIsPlaying.value = false

          // 如果使用backgroundAudioManager失败，则下次尝试使用innerAudioContext
          if (err.errCode >= 10001) {
            // 一般10001以上的错误是API相关错误
            console.warn('由于错误，切换到InnerAudioContext播放模式')
            useBackgroundAudio.value = false
          }

          // 即使出错，也尝试播放下一个
          playNextInQueue()
        })

        backgroundAudioManager.value.onCanplay(() => {
          console.log('TTS音频已准备好播放')
        })

        backgroundAudioManager.value.onPlay(() => {
          console.log('TTS音频开始播放')
          ttsIsPlaying.value = true
        })

        backgroundAudioManager.value.onStop(() => {
          console.log('TTS音频停止播放')
          ttsIsPlaying.value = false
        })

        backgroundAudioManager.value.onPause(() => {
          console.log('TTS音频暂停播放')
          ttsIsPlaying.value = false
        })

        // 添加时间更新事件监听，确保能获取到音频长度
        backgroundAudioManager.value.onTimeUpdate(() => {
          if (
            backgroundAudioManager.value.duration > 0 &&
            ttsPlayTime.value === 0
          ) {
            ttsPlayTime.value = backgroundAudioManager.value.duration
            console.log('更新TTS音频长度:', ttsPlayTime.value)
          }

          // 当音频播放到接近结尾时，开始预加载下一个音频
          if (
            backgroundAudioManager.value.duration > 0 &&
            backgroundAudioManager.value.currentTime > 0 &&
            !isPreloading.value &&
            ttsQueue.value.length > 0 &&
            backgroundAudioManager.value.duration -
              backgroundAudioManager.value.currentTime <
              2
          ) {
            // 提前2秒预加载
            preloadNextAudio()
          }
        })

        console.log('背景音频管理器初始化成功')
        return true
      } catch (err) {
        console.error('初始化背景音频管理器失败', err)
        isBackgroundAudioAvailable.value = false
        useBackgroundAudio.value = false
        return false
      }
    }
    return !!backgroundAudioManager.value
  }

  // 初始化背景音乐播放器
  const initBgAudioContext = () => {
    if (!bgAudioContext.value) {
      bgAudioContext.value = uni.createInnerAudioContext()

      // 设置初始音量
      bgAudioContext.value.volume = bgVolume.value

      // 播放结束事件
      bgAudioContext.value.onEnded(() => {
        console.log('背景音乐播放结束')

        // 如果设置了循环播放，则重新开始播放
        if (bgLoop.value && currentBgMusicUrl.value) {
          console.log('背景音乐循环播放')
          // 重新设置音频源并播放
          bgAudioContext.value.src = currentBgMusicUrl.value
          bgAudioContext.value.play()
          // 不改变bgIsPlaying.value的状态，保持为播放中
        } else {
          // 如果未设置循环，则上报播放完成并更新播放状态
          reportBgMusicFinish()
          bgIsPlaying.value = false
        }
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

      console.log('背景音乐播放器初始化成功')
    }
  }

  // 初始化TTS音频播放器（作为备用，当无法使用backgroundAudioManager时）
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
        ttsIsPlaying.value = true
      })

      // 添加时间更新事件监听，确保能获取到音频长度
      ttsAudioContext.value.onTimeUpdate(() => {
        if (ttsAudioContext.value.duration > 0 && ttsPlayTime.value === 0) {
          ttsPlayTime.value = ttsAudioContext.value.duration
          console.log('更新TTS音频长度:', ttsPlayTime.value)
        }

        // 当音频播放到接近结尾时，开始预加载下一个音频
        if (
          ttsAudioContext.value.duration > 0 &&
          ttsAudioContext.value.currentTime > 0 &&
          !isPreloading.value &&
          ttsQueue.value.length > 0 &&
          ttsAudioContext.value.duration - ttsAudioContext.value.currentTime < 2
        ) {
          // 提前2秒预加载
          preloadNextAudio()
        }
      })

      console.log('TTS音频播放器初始化成功')
    }
  }

  // 播放背景音乐
  const playBgMusic = (url, playTime = 0, sectionId = null, audioId = null) => {
    initBgAudioContext()

    // 保存相关ID和URL
    bgSectionId.value = sectionId
    bgAudioId.value = audioId
    bgPlayTime.value = playTime
    currentBgMusicUrl.value = url // 保存URL用于循环播放

    // 设置音频源并播放
    bgAudioContext.value.src = url
    // 确保应用当前设置的音量
    bgAudioContext.value.volume = bgVolume.value
    // 设置循环播放状态
    bgAudioContext.value.loop = bgLoop.value

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
      volume: bgVolume.value,
      loop: bgLoop.value,
    })
  }

  // 设置背景音乐循环状态
  const setBgLoop = (loop) => {
    bgLoop.value = !!loop // 转换为布尔值

    // 如果有正在播放的背景音乐，立即应用循环设置
    if (bgAudioContext.value) {
      bgAudioContext.value.loop = bgLoop.value
      console.log('更新背景音乐循环状态:', bgLoop.value)
    }
  }

  // 预加载下一个音频（优化播放流畅性）
  const preloadNextAudio = () => {
    if (isPreloading.value || ttsQueue.value.length === 0) return

    isPreloading.value = true
    const nextAudio = ttsQueue.value[0] // 不从队列中移除，只是获取引用

    // 创建临时音频上下文用于预加载
    const preloadContext = uni.createInnerAudioContext()
    preloadContext.autoplay = false
    preloadContext.src = nextAudio.url

    preloadContext.onCanplay(() => {
      console.log(
        '下一音频已预加载完成:',
        nextAudio.url.substring(0, 50) + '...'
      )
      nextAudioPreloaded.value = nextAudio
      isPreloading.value = false

      // 清理预加载上下文
      preloadContext.destroy()
    })

    preloadContext.onError((err) => {
      console.error('预加载音频失败:', err)
      isPreloading.value = false

      // 清理预加载上下文
      preloadContext.destroy()
    })

    console.log('开始预加载下一音频:', nextAudio.url.substring(0, 50) + '...')
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
    } else if (ttsQueue.value.length === 1 && !isPreloading.value) {
      // 如果这是队列中的第一个且没有在预加载，则开始预加载
      preloadNextAudio()
    }
  }

  // 确保播放器已初始化
  const ensureTtsPlayerInitialized = () => {
    // 检查环境并决定使用哪种播放器
    checkBackgroundAudioAvailability()

    if (useBackgroundAudio.value && isBackgroundAudioAvailable.value) {
      return initBackgroundAudioManager() || initTtsAudioContext()
    } else {
      return initTtsAudioContext()
    }
  }

  // 播放队列中的下一个TTS音频
  const playNextInQueue = () => {
    // 重置预加载状态
    nextAudioPreloaded.value = null

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
      nextAudio: nextAudio.url.substring(0, 50) + '...',
    })

    // 播放该音频
    playTtsAudioDirectly(nextAudio.url, nextAudio.sectionId, nextAudio.audioId)

    // 如果队列中还有音频，开始预加载下一个
    if (ttsQueue.value.length > 0 && !isPreloading.value) {
      setTimeout(() => preloadNextAudio(), 500) // 稍微延迟预加载，避免与当前播放冲突
    }
  }

  // 直接播放TTS音频（内部使用，不要直接调用）
  const playTtsAudioDirectly = (url, sectionId = null, audioId = null) => {
    // 保存相关ID
    ttsSectionId.value = sectionId
    ttsAudioId.value = audioId

    // 重置音频长度，确保为新音频重新获取长度
    ttsPlayTime.value = 0

    // 确保已初始化播放器
    ensureTtsPlayerInitialized()

    // 根据配置选择合适的播放方式
    if (useBackgroundAudio.value && backgroundAudioManager.value) {
      try {
        // 设置音频源并播放
        backgroundAudioManager.value.src = url
        backgroundAudioManager.value.title = 'TTS音频' // 必须设置title
        backgroundAudioManager.value.epname = 'TTS播放'
        backgroundAudioManager.value.singer = '小程序'
        // 设置音量
        backgroundAudioManager.value.volume = ttsVolume.value

        // BackgroundAudioManager会自动播放，无需调用play()
        ttsIsPlaying.value = true
        console.log('使用BackgroundAudioManager播放TTS音频', {
          url: url.substring(0, 50) + '...',
          sectionId,
          audioId,
          volume: ttsVolume.value,
        })
      } catch (err) {
        console.error(
          '使用BackgroundAudioManager播放失败，尝试使用InnerAudioContext',
          err
        )
        useBackgroundAudio.value = false // 切换到InnerAudioContext模式
        playWithInnerAudioContext(url)
      }
    } else {
      // 使用InnerAudioContext播放
      playWithInnerAudioContext(url)
    }
  }

  // 使用InnerAudioContext播放TTS（内部使用）
  const playWithInnerAudioContext = (url) => {
    try {
      initTtsAudioContext()

      // 如果播放器已经在播放，先停止当前播放
      if (ttsIsPlaying.value && ttsAudioContext.value) {
        try {
          ttsAudioContext.value.stop()
        } catch (e) {
          console.error('停止当前播放失败', e)
        }
      }

      // 设置新的音频源
      ttsAudioContext.value.src = url
      ttsAudioContext.value.volume = ttsVolume.value // 设置音量

      // 播放
      ttsAudioContext.value.play()
      ttsIsPlaying.value = true

      console.log('使用InnerAudioContext播放TTS音频', {
        url: url.substring(0, 50) + '...',
        volume: ttsVolume.value,
      })
    } catch (err) {
      console.error('播放TTS音频失败', err)
      // 如果仍然失败，继续下一个
      ttsIsPlaying.value = false
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

  // 暂停背景音乐
  const pauseBgMusic = () => {
    if (bgAudioContext.value && bgIsPlaying.value) {
      bgAudioContext.value.pause()
      bgIsPlaying.value = false
    }
  }

  // 恢复背景音乐播放
  const resumeBgMusic = () => {
    if (bgAudioContext.value && !bgIsPlaying.value) {
      bgAudioContext.value.play()
      bgIsPlaying.value = true
    }
  }

  // 设置背景音乐音量（0.0-1.0）
  const setBgVolume = (volume) => {
    // 确保音量在有效范围内
    if (volume < 0) volume = 0
    if (volume > 1) volume = 1

    bgVolume.value = volume

    // 如果当前有背景音乐在播放，立即应用新音量
    if (bgAudioContext.value) {
      bgAudioContext.value.volume = volume
    }

    console.log('设置背景音乐音量:', volume)
  }

  // 停止TTS音频
  const stopTtsAudio = () => {
    // 停止背景音频管理器
    if (backgroundAudioManager.value) {
      try {
        backgroundAudioManager.value.stop()
      } catch (e) {
        console.error('停止backgroundAudioManager失败', e)
      }
    }

    // 停止备用播放器
    if (ttsAudioContext.value) {
      try {
        ttsAudioContext.value.stop()
      } catch (e) {
        console.error('停止ttsAudioContext失败', e)
      }
    }

    ttsIsPlaying.value = false

    // 清空队列
    ttsQueue.value = []
    isProcessingQueue.value = false
    isPreloading.value = false
    nextAudioPreloaded.value = null
  }

  // 停止所有音频
  const stopAllAudio = () => {
    stopBgMusic()
    stopTtsAudio()
  }

  // 暂停TTS音频
  const pauseTtsAudio = () => {
    if (backgroundAudioManager.value && ttsIsPlaying.value) {
      try {
        backgroundAudioManager.value.pause()
        ttsIsPlaying.value = false
      } catch (e) {
        console.error('暂停backgroundAudioManager失败', e)
      }
    } else if (ttsAudioContext.value && ttsIsPlaying.value) {
      try {
        ttsAudioContext.value.pause()
        ttsIsPlaying.value = false
      } catch (e) {
        console.error('暂停ttsAudioContext失败', e)
      }
    }
  }

  // 恢复TTS音频播放
  const resumeTtsAudio = () => {
    if (backgroundAudioManager.value && !ttsIsPlaying.value) {
      try {
        backgroundAudioManager.value.play()
        ttsIsPlaying.value = true
      } catch (e) {
        console.error('恢复backgroundAudioManager播放失败', e)
      }
    } else if (ttsAudioContext.value && !ttsIsPlaying.value) {
      try {
        ttsAudioContext.value.play()
        ttsIsPlaying.value = true
      } catch (e) {
        console.error('恢复ttsAudioContext播放失败', e)
      }
    }
  }

  // 设置TTS音频音量（0.0-1.0）
  const setTtsVolume = (volume) => {
    // 确保音量在有效范围内
    if (volume < 0) volume = 0
    if (volume > 1) volume = 1

    ttsVolume.value = volume

    // 如果当前有音频在播放，立即应用新音量
    if (backgroundAudioManager.value) {
      try {
        backgroundAudioManager.value.volume = volume
      } catch (e) {
        console.error('设置backgroundAudioManager音量失败', e)
      }
    }

    if (ttsAudioContext.value) {
      try {
        ttsAudioContext.value.volume = volume
      } catch (e) {
        console.error('设置ttsAudioContext音量失败', e)
      }
    }

    console.log('设置TTS音量:', volume)
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
      isPreloading: isPreloading.value,
      hasPreloadedNext: !!nextAudioPreloaded.value,
      currentlyPlaying: ttsIsPlaying.value
        ? {
            sectionId: ttsSectionId.value,
            audioId: ttsAudioId.value,
          }
        : null,
    }
  }

  // 初始化 - 在创建store时检查环境
  checkBackgroundAudioAvailability()

  return {
    // 背景音乐相关
    playBgMusic,
    stopBgMusic,
    pauseBgMusic, // 暂停背景音乐
    resumeBgMusic, // 恢复背景音乐播放
    setBgVolume, // 设置背景音乐音量
    setBgLoop, // 设置背景音乐循环状态
    bgIsPlaying,
    bgVolume, // 暴露背景音乐音量状态
    bgLoop, // 暴露背景音乐循环状态

    // TTS相关
    playTtsAudio,
    stopTtsAudio,
    pauseTtsAudio, // 暂停TTS
    resumeTtsAudio, // 恢复TTS播放
    setTtsVolume, // 设置TTS音量
    ttsIsPlaying,
    getQueueStatus,
    ttsVolume, // 暴露TTS音量状态

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
