// stores/music.js
import { defineStore } from 'pinia'
import { useAudioPlayerStore } from './audioPlayer'
import { ref, computed } from 'vue'

export const useMusicStore = defineStore('music', () => {
  // 状态
  const currentIndex = ref(0)
  const playlist = ref([])
  const currentSong = ref(null)
  const currentCategory = ref(null)
  const audioPlayerStore = useAudioPlayerStore()

  // 计算属性：当前歌曲
  const getCurrentSong = computed(() => {
    return playlist.value[currentIndex.value] || null
  })

  // 计算属性：播放状态 - 基于audioPlayerStore的状态计算
  const isPlaying = computed(() => {
    if (!currentSong.value || !audioPlayerStore) return false

    const bgIsPlaying = audioPlayerStore.bgIsPlaying
    const bgAudioId = audioPlayerStore.bgAudioId
    const currentId = currentSong.value.id

    console.log('isPlaying计算:', {
      currentId,
      bgAudioId,
      bgIsPlaying,
      result: bgIsPlaying && bgAudioId === currentId,
    })

    return bgIsPlaying && bgAudioId === currentId
  })

  // 判断指定音乐是否正在播放
  const isPlayingAudio = (audioId) => {
    if (!audioPlayerStore || !audioId) return false

    const bgIsPlaying = audioPlayerStore.bgIsPlaying
    const currentAudioId = audioPlayerStore.bgAudioId

    console.log('isPlayingAudio检查:', {
      audioId,
      bgIsPlaying,
      currentAudioId,
      result: bgIsPlaying && currentAudioId === audioId,
    })

    return bgIsPlaying && currentAudioId === audioId
  }

  // Actions
  const initAudio = () => {
    // 设置音乐播放完成的回调，用于自动切换下一首
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

    if (audioPlayerStore && currentSong.value) {
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
    if (!audioPlayerStore || !currentSong.value) return

    console.log('togglePlay调用:', {
      isPlaying: isPlaying.value,
      currentSong: currentSong.value.title,
      bgIsPlaying: audioPlayerStore.bgIsPlaying,
      bgAudioId: audioPlayerStore.bgAudioId,
    })

    if (isPlaying.value) {
      // 暂停背景音乐
      console.log('暂停音乐')
      audioPlayerStore.pauseBgMusic()
    } else {
      // 如果当前歌曲与audioPlayer正在播放的不同，播放新歌曲
      if (
        !audioPlayerStore.bgIsPlaying ||
        audioPlayerStore.bgAudioId !== currentSong.value.id
      ) {
        console.log('播放新歌曲')
        playSong(currentIndex.value)
      } else {
        // 恢复播放
        console.log('恢复播放')
        audioPlayerStore.resumeBgMusic()
      }
    }
  }

  const playSong = (index) => {
    if (index < 0 || index >= playlist.value.length) return

    currentIndex.value = index
    currentSong.value = getCurrentSong.value

    if (audioPlayerStore && currentSong.value) {
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

      // 状态同步由computed处理，不需要手动设置
      console.log(
        '播放后状态:',
        audioPlayerStore.bgIsPlaying,
        audioPlayerStore.bgAudioId
      )
    }
  }

  const next = () => {
    const nextIndex = (currentIndex.value + 1) % playlist.value.length
    playSong(nextIndex)
  }

  const prev = () => {
    const prevIndex =
      currentIndex.value === 0
        ? playlist.value.length - 1
        : currentIndex.value - 1
    playSong(prevIndex)
  }

  const startPlay = () => {
    if (!audioPlayerStore || !currentSong.value) return
    // 播放当前音乐
    playSong(currentIndex.value)
  }

  const pausePlay = () => {
    if (audioPlayerStore && isPlaying.value) {
      audioPlayerStore.pauseBgMusic()
    }
  }

  const stopPlay = () => {
    if (audioPlayerStore) {
      audioPlayerStore.stopBgMusic()
    }
  }

  const destroyAudio = () => {
    // audioPlayer store会统一管理，不需要单独销毁
    console.log('音乐播放器已停止')
  }

  // 返回所有需要暴露的状态和方法
  return {
    // 状态
    currentIndex,
    playlist,
    currentSong,
    currentCategory,
    audioPlayerStore,

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
    destroyAudio,
  }
})
