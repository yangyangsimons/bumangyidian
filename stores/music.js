// stores/music.js
import { defineStore } from 'pinia'
import { useAudioPlayerStore } from './audioPlayer'
import { ref, computed } from 'vue'
import request from '../utils/request'

export const useMusicStore = defineStore('music', () => {
  // 状态
  const currentIndex = ref(0)
  const playlist = ref([])
  const currentSong = ref(null)
  const currentCategory = ref(null)
  // 上报去重相关状态
  const lastReportedMusicId = ref(null)
  const lastReportedAt = ref(0) // ms 时间戳

  console.log('musicStore 正在创建...') // 调试信息

  // 计算属性：当前歌曲
  const getCurrentSong = computed(() => {
    return playlist.value[currentIndex.value] || null
  })

  // 计算属性：播放状态 - 基于audioPlayerStore的状态计算
  const isPlaying = computed(() => {
    if (!currentSong.value) return false

    const audioPlayerStore = useAudioPlayerStore() // 在计算属性内部获取
    const bgIsPlaying = audioPlayerStore.bgIsPlaying
    const currentId = currentSong.value.id

    // 如果背景音乐没有在播放，直接返回false
    if (!bgIsPlaying) return false

    // 尝试多种方式获取bgAudioId的值
    let bgAudioId = null
    try {
      // 方式1: 直接通过.value访问
      bgAudioId = audioPlayerStore.bgAudioId?.value

      // 方式2: 如果方式1失败，尝试直接访问bgAudioId属性
      if (bgAudioId === null || bgAudioId === undefined) {
        bgAudioId = audioPlayerStore.bgAudioId
        if (
          typeof bgAudioId === 'object' &&
          bgAudioId &&
          'value' in bgAudioId
        ) {
          bgAudioId = bgAudioId.value
        }
      }
    } catch (error) {
      console.error('获取bgAudioId时出错:', error)
      bgAudioId = null
    }

    // 严格匹配：只有当bgAudioId明确等于currentId时才认为正在播放
    const result = bgAudioId === currentId

    // 添加更详细的调试信息
    console.log('isPlaying计算 - 详细信息:', {
      currentId,
      bgAudioId,
      bgAudioIdRef: audioPlayerStore.bgAudioId,
      bgAudioIdDirect: audioPlayerStore.bgAudioId
        ? audioPlayerStore.bgAudioId.value
        : 'ref为null',
      bgIsPlaying,
      result,
    })

    return result
  })

  // 判断指定音乐是否正在播放
  const isPlayingAudio = (audioId) => {
    if (!audioId) return false

    const audioPlayerStore = useAudioPlayerStore() // 在方法内部获取
    const bgIsPlaying = audioPlayerStore.bgIsPlaying

    // 如果背景音乐没有在播放，直接返回false
    if (!bgIsPlaying) return false

    // 尝试从audioPlayerStore获取bgAudioId
    let currentAudioId = null
    try {
      // 尝试多种方式获取bgAudioId的值
      currentAudioId = audioPlayerStore.bgAudioId?.value

      if (currentAudioId === null || currentAudioId === undefined) {
        currentAudioId = audioPlayerStore.bgAudioId
        if (
          typeof currentAudioId === 'object' &&
          currentAudioId &&
          'value' in currentAudioId
        ) {
          currentAudioId = currentAudioId.value
        }
      }
    } catch (error) {
      console.error('获取bgAudioId时出错:', error)
      currentAudioId = null
    }

    // 严格匹配：只有当bgAudioId明确等于audioId时才认为正在播放
    // 移除备用逻辑，避免当用户从index页面进入programme页面时的误判
    const result = currentAudioId === audioId

    console.log('isPlayingAudio检查:', {
      audioId,
      bgIsPlaying,
      currentAudioId,
      bgAudioIdRef: audioPlayerStore.bgAudioId,
      bgAudioIdType: typeof audioPlayerStore.bgAudioId,
      result,
    })

    return result
  }

  // Actions
  const initAudio = () => {
    // 设置音乐播放完成的回调，用于自动切换下一首
    const audioPlayerStore = useAudioPlayerStore() // 在方法内部获取
    audioPlayerStore.setOnMusicEndedCallback(() => {
      console.log('音乐播放完成，切换到下一首')
      next()
    })
  }

  const setPlaylist = (list, index = 0, category = null) => {
    console.log('设置播放列表:', list, '当前索引:', index, '分类:', category)
    // 过滤掉无效的歌曲数据
    playlist.value = list.filter((item) => item && item.id && item.audio_url)
    currentIndex.value = index
    currentSong.value = getCurrentSong.value
    currentCategory.value = category // 设置当前分类

    const audioPlayerStore = useAudioPlayerStore() // 在方法内部获取
    if (currentSong.value) {
      // 使用audioPlayer store播放背景音乐
      audioPlayerStore.playBgMusic(
        currentSong.value.audio_url,
        0, // playTime
        null, // sectionId
        currentSong.value.id, // audioId - 使用歌曲ID作为audioId
        {
          title: currentSong.value.title || '不芒一点',
          epname: currentSong.value.desc || '校园节目',
          singer: currentSong.value.artist || '',
          coverImgUrl:
            currentSong.value.cover ||
            'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
        }
      )

      // 设置为不循环播放（音乐播放完成后可以切换到下一首）
      audioPlayerStore.setBgLoop(false)

      // 上报开始播放
      recordMusicPlay(currentSong.value.id)
    }
  }

  const setPlaylistWithoutPlay = (list, index = 0, category = null) => {
    console.log(
      '设置播放列表（不播放）:',
      list,
      '当前索引:',
      index,
      '分类:',
      category
    )
    // 过滤掉无效的歌曲数据
    playlist.value = list.filter((item) => item && item.id && item.audio_url)
    currentIndex.value = index
    currentSong.value = getCurrentSong.value
    currentCategory.value = category // 设置当前分类

    // 只设置歌曲信息，不播放音频
    console.log('播放列表已设置，但不会自动播放')
  }

  const addAndPlaySong = (song, playImmediately = true, category = null) => {
    console.log(
      '添加并播放歌曲:',
      song,
      '立即播放:',
      playImmediately,
      '分类:',
      category
    )

    // 验证歌曲数据的有效性
    if (!song || !song.id || !song.audio_url) {
      console.error('无效的歌曲数据:', song)
      return
    }

    currentCategory.value = category // 设置当前分类

    const existingIndex = playlist.value.findIndex(
      (item) => item && item.id === song.id
    )

    if (existingIndex !== -1) {
      if (playImmediately) {
        playSong(existingIndex)
      }
    } else {
      playlist.value.push(song)
      if (playImmediately) {
        playSong(playlist.value.length - 1)
      }
    }
  }

  const playNewSong = (song, category = null) => {
    setPlaylist([song], 0, category)
    playSong(0)
  }

  const insertAndPlayNext = (song) => {
    const insertIndex = currentIndex.value + 1
    playlist.value.splice(insertIndex, 0, song)
    playSong(insertIndex)
  }

  const togglePlay = () => {
    const audioPlayerStore = useAudioPlayerStore() // 在方法内部获取
    if (!currentSong.value) return

    console.log('togglePlay调用:', {
      isPlaying: isPlaying.value,
      currentSong: currentSong.value.title,
      bgIsPlaying: audioPlayerStore.bgIsPlaying,
      bgAudioId: audioPlayerStore.bgAudioId?.value || null,
    })

    if (isPlaying.value) {
      // 暂停背景音乐
      console.log('暂停音乐')
      audioPlayerStore.pauseBgMusic()
      // 暂停时上报播放进度
      reportMusicProgress()
    } else {
      // 如果当前歌曲与audioPlayer正在播放的不同，播放新歌曲
      if (
        !audioPlayerStore.bgIsPlaying ||
        (audioPlayerStore.bgAudioId?.value || null) !== currentSong.value.id
      ) {
        console.log('播放新歌曲')
        playSong(currentIndex.value)
      } else {
        // 恢复播放
        console.log('恢复播放')
        audioPlayerStore.resumeBgMusic()
        // 恢复播放也做一次开始播放上报（有去重保护）
        if (currentSong.value?.id) {
          recordMusicPlay(currentSong.value.id)
        }
      }
    }
  }

  const playSong = (index) => {
    if (index < 0 || index >= playlist.value.length) return

    const audioPlayerStore = useAudioPlayerStore() // 在方法内部获取
    currentIndex.value = index
    currentSong.value = getCurrentSong.value

    if (currentSong.value) {
      console.log(
        '开始播放歌曲:',
        currentSong.value.title,
        'ID:',
        currentSong.value.id
      )

      // 使用audioPlayer store播放背景音乐
      audioPlayerStore.playBgMusic(
        currentSong.value.audio_url,
        0, // playTime
        null, // sectionId
        currentSong.value.id, // audioId - 使用歌曲ID作为audioId
        {
          title: currentSong.value.title || '不芒一点',
          epname: currentSong.value.desc || '校园节目',
          singer: currentSong.value.artist || '',
          coverImgUrl:
            currentSong.value.cover ||
            'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
        }
      )

      // 设置为不循环播放（音乐播放完成后可以切换到下一首）
      audioPlayerStore.setBgLoop(false)

      // 上报开始播放
      recordMusicPlay(currentSong.value.id)

      // 状态同步由computed处理，不需要手动设置
      console.log(
        '播放后状态:',
        audioPlayerStore.bgIsPlaying,
        audioPlayerStore.bgAudioId?.value || null
      )

      // 添加延迟检查，确认状态是否正确设置
      setTimeout(() => {
        console.log('延迟检查audioPlayerStore状态:', {
          bgIsPlaying: audioPlayerStore.bgIsPlaying,
          bgAudioId: audioPlayerStore.bgAudioId?.value || null,
          传入的audioId: currentSong.value.id,
        })
      }, 100)
    }
  }

  // 上报音乐开始播放（去重）
  const recordMusicPlay = async (musicId) => {
    try {
      if (!musicId) return
      const now = Date.now()
      // 1 秒内相同歌曲的重复上报忽略，避免由于多处触发造成重复
      if (
        lastReportedMusicId.value === musicId &&
        now - lastReportedAt.value < 1000
      ) {
        console.log('跳过重复开始播放上报:', musicId)
        return
      }

      // 预先更新去重标记，避免并发触发
      lastReportedMusicId.value = musicId
      lastReportedAt.value = now

      const payload = { music_id: musicId }
      console.log('上报音乐开始播放:', payload)
      await request(
        'https://mang.5gradio.com.cn/school_music/record_school_music_play',
        'POST',
        payload
      )
      console.log('音乐开始播放上报成功')
    } catch (error) {
      console.error('音乐开始播放上报失败:', error)
    }
  }

  const next = () => {
    // 切换前上报当前歌曲的播放进度
    reportMusicProgress()
    const nextIndex = (currentIndex.value + 1) % playlist.value.length
    playSong(nextIndex)
  }

  const prev = () => {
    // 切换前上报当前歌曲的播放进度
    reportMusicProgress()
    const prevIndex =
      currentIndex.value === 0
        ? playlist.value.length - 1
        : currentIndex.value - 1
    playSong(prevIndex)
  }

  const startPlay = () => {
    if (!currentSong.value) return
    // 播放当前音乐
    playSong(currentIndex.value)
  }

  const pausePlay = () => {
    const audioPlayerStore = useAudioPlayerStore() // 在方法内部获取
    if (isPlaying.value) {
      audioPlayerStore.pauseBgMusic()
      // 暂停时上报播放进度
      reportMusicProgress()
    }
  }

  const stopPlay = () => {
    const audioPlayerStore = useAudioPlayerStore() // 在方法内部获取
    // 停止前先上报播放进度
    reportMusicProgress()
    audioPlayerStore.stopBgMusic()
  }

  // 上报音乐播放进度
  const reportMusicProgress = async () => {
    if (!currentSong.value) {
      console.log('没有当前播放的音乐，无需上报进度')
      return
    }

    const audioPlayerStore = useAudioPlayerStore()

    try {
      // 获取当前播放时间
      const currentTime = audioPlayerStore.bgPlayTime || 0

      // 获取音频总时长
      let duration = 0

      // 尝试从backgroundAudioManager获取duration
      if (
        audioPlayerStore.bgAudioManager &&
        audioPlayerStore.bgAudioManager.duration
      ) {
        duration = audioPlayerStore.bgAudioManager.duration
      }

      // 如果backgroundAudioManager没有duration属性，尝试获取音频元数据中的时长
      if (duration <= 0 && currentSong.value.duration) {
        duration = currentSong.value.duration
      }

      // 如果仍然无法获取总时长，设置一个默认值或跳过上报
      if (duration <= 0) {
        console.log('无法获取音频总时长，使用当前播放时间作为总时长')
        // 如果没有总时长信息，可以假设当前播放时间就是总进度
        // 或者我们可以设置播放百分比为当前播放的秒数除以一个估算值
        // 这里我们使用一种更安全的方式：如果播放时间大于0，设置为0.99（99%）
        if (currentTime > 0) {
          duration = currentTime / 0.99 // 假设当前时间为99%的进度
        } else {
          console.log('当前播放时间为0，跳过进度上报')
          return
        }
      }

      // 计算播放百分比
      const playPercentage = Math.min(Math.max(currentTime / duration, 0), 1.0)

      const reportData = {
        music_id: currentSong.value.id,
        play_percentage: Number(playPercentage.toFixed(3)), // 保留3位小数
      }

      console.log('上报音乐播放进度:', {
        ...reportData,
        currentTime,
        duration,
        musicTitle: currentSong.value.title,
      })

      // 发送上报请求
      await request(
        'https://mang.5gradio.com.cn/school_music/listen_music_points',
        'POST',
        reportData
      )
      console.log('音乐播放进度上报成功')
    } catch (error) {
      console.error('音乐播放进度上报失败:', error)
    }
  }

  const destroyAudio = () => {
    // audioPlayer store会统一管理，不需要单独销毁
    console.log('音乐播放器已停止')
  }

  /**
   * 后端推送的 bg_music（包含 school_music_info）时调用，
   * 只做前端状态同步或必要的播放动作，避免破坏现有播放/切歌逻辑。
   * data 结构期望：{ id, audio_url, title/desc/artist/cover/duration }
   * @param {Object} serverMusic 节目信息 (等同于 school_music_info)
   * @param {Boolean} shouldPlay 如果后端这条消息意味着需要立即播放
   * @param {Number} playTime 可选：从指定秒数（或毫秒换算）开始
   */
  const applyServerBgMusic = (serverMusic, shouldPlay = true, playTime = 0) => {
    if (!serverMusic || !serverMusic.id) {
      console.warn('applyServerBgMusic: 无有效 serverMusic.id', serverMusic)
      return
    }

    const audioPlayerStore = useAudioPlayerStore()

    // 情况1：当前已是同一首歌 -> 仅保证 UI 同步，不重复播放
    if (currentSong.value && currentSong.value.id === serverMusic.id) {
      // 可补充：若需要更新封面/标题等信息
      Object.assign(currentSong.value, serverMusic)
      console.log('applyServerBgMusic: 已在播放同一节目，仅同步字段', {
        id: serverMusic.id,
      })
      return
    }

    // 情况2：不在 playlist 中 -> 用不打断策略：设置 playlist 并按需播放
    const existIndex = playlist.value.findIndex(
      (m) => m && m.id === serverMusic.id
    )

    if (existIndex === -1) {
      // 保留原有列表还是重置？这里选择插入到当前索引后面（或者若无列表则直接设为单曲）
      if (playlist.value.length === 0) {
        playlist.value = [serverMusic]
        currentIndex.value = 0
      } else {
        playlist.value.splice(currentIndex.value + 1, 0, serverMusic)
        currentIndex.value = currentIndex.value + 1
      }
    } else {
      currentIndex.value = existIndex
      // 更新元数据（例如后端刷新了封面）
      Object.assign(playlist.value[existIndex], serverMusic)
    }

    currentSong.value = playlist.value[currentIndex.value]

    console.log('applyServerBgMusic: 同步节目到 musicStore', {
      id: currentSong.value.id,
      title: currentSong.value.title,
      shouldPlay,
      playTime,
    })

    if (shouldPlay) {
      audioPlayerStore.playBgMusic(
        currentSong.value.audio_url,
        playTime || 0,
        null,
        currentSong.value.id,
        {
          title: currentSong.value.title || '不芒一点',
          epname: currentSong.value.desc || '校园节目',
          singer: currentSong.value.artist || '',
          coverImgUrl:
            currentSong.value.cover ||
            'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
        }
      )
      audioPlayerStore.setBgLoop(false)
      recordMusicPlay(currentSong.value.id)
    }
  }

  // 返回所有需要暴露的状态和方法
  const storeInstance = {
    // 状态
    currentIndex,
    playlist,
    currentSong,
    currentCategory,

    // 计算属性
    getCurrentSong,
    isPlaying,

    // 方法
    isPlayingAudio,
    initAudio,
    setPlaylist,
    setPlaylistWithoutPlay,
    addAndPlaySong,
    playNewSong,
    insertAndPlayNext,
    togglePlay,
    playSong,
    next,
    prev,
    startPlay,
    pausePlay,
    stopPlay,
    recordMusicPlay,
    reportMusicProgress,
    destroyAudio,
    applyServerBgMusic,
  }

  console.log(
    'musicStore 创建完成，isPlayingAudio 方法:',
    typeof storeInstance.isPlayingAudio
  ) // 调试信息

  return storeInstance
})
