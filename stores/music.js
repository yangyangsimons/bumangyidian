// stores/music.js
import { defineStore } from 'pinia'
import { useAudioPlayerStore } from './audioPlayer'

export const useMusicStore = defineStore('music', {
  state: () => ({
    isPlaying: false,
    currentIndex: 0,
    playlist: [],
    currentSong: null,
    audioContext: null,
  }),

  getters: {
    getCurrentSong: (state) => {
      return state.playlist[state.currentIndex] || null
    },
  },

  actions: {
    initAudio() {
      this.audioContext = uni.getBackgroundAudioManager()
      this.setupAudioEvents()
    },

    setupAudioEvents() {
      if (!this.audioContext) return

      this.audioContext.onPlay(() => {
        this.isPlaying = true
      })

      this.audioContext.onPause(() => {
        this.isPlaying = false
      })

      this.audioContext.onStop(() => {
        this.isPlaying = false
      })

      this.audioContext.onEnded(() => {
        this.next()
      })

      this.audioContext.onError((error) => {
        console.error('音频播放错误:', error)
        this.isPlaying = false
      })
    },

    setPlaylist(list, index = 0) {
      console.log('设置播放列表:', list, '当前索引:', index)
      // 过滤掉无效的歌曲数据
      this.playlist = list.filter((item) => item && item.id && item.audio_url)
      this.currentIndex = index
      this.currentSong = this.getCurrentSong
      if (this.audioContext && this.currentSong) {
        // 设置背景音乐管理器的必要属性
        this.audioContext.title = this.currentSong.title || '不芒一点'
        this.audioContext.epname = this.currentSong.desc || '校园节目'
        this.audioContext.singer = this.currentSong.artist || ''
        this.audioContext.coverImgUrl =
          this.currentSong.cover ||
          'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg'

        this.audioContext.src = this.currentSong.audio_url
      }
    },

    // 设置播放列表但不自动播放（仅准备音频源）
    setPlaylistWithoutPlay(list, index = 0) {
      console.log('设置播放列表（不播放）:', list, '当前索引:', index)
      // 过滤掉无效的歌曲数据
      this.playlist = list.filter((item) => item && item.id && item.audio_url)
      this.currentIndex = index
      this.currentSong = this.getCurrentSong

      // 只设置歌曲信息，不设置音频源，避免自动播放
      if (this.audioContext && this.currentSong) {
        // 设置背景音乐管理器的必要属性
        this.audioContext.title = this.currentSong.title || '不芒一点'
        this.audioContext.epname = this.currentSong.desc || '校园节目'
        this.audioContext.singer = this.currentSong.artist || ''
        this.audioContext.coverImgUrl =
          this.currentSong.cover ||
          'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg'

        // 注意：这里不设置 src，避免自动播放
        console.log('播放列表已设置，但不会自动播放')
      }
    },

    // 添加歌曲到播放列表并立即播放
    addAndPlaySong(song, playImmediately = true) {
      console.log('添加并播放歌曲:', song, '立即播放:', playImmediately)

      // 验证歌曲数据的有效性
      if (!song || !song.id || !song.audio_url) {
        console.error('无效的歌曲数据:', song)
        return
      }

      const existingIndex = this.playlist.findIndex(
        (item) => item && item.id === song.id
      )

      if (existingIndex !== -1) {
        if (playImmediately) {
          this.playSong(existingIndex)
        }
      } else {
        this.playlist.push(song)
        if (playImmediately) {
          this.playSong(this.playlist.length - 1)
        }
      }
    },

    // 替换当前播放列表并播放指定歌曲
    playNewSong(song) {
      this.setPlaylist([song], 0)
      this.playSong(0)
    },

    // 插入歌曲到当前播放位置之后
    insertAndPlayNext(song) {
      const insertIndex = this.currentIndex + 1
      this.playlist.splice(insertIndex, 0, song)
      this.playSong(insertIndex)
    },

    togglePlay() {
      if (!this.audioContext || !this.currentSong) return

      if (this.isPlaying) {
        this.audioContext.pause()
      } else {
        // 播放前先停止其他音频
        const audioPlayerStore = useAudioPlayerStore()
        audioPlayerStore.stopAllAudio()

        // 检查是否已经设置了音频源
        if (
          !this.audioContext.src ||
          this.audioContext.src !== this.currentSong.audio_url
        ) {
          console.log('音频源未设置或不匹配，重新设置音频源')
          // 设置音频源
          this.audioContext.src = this.currentSong.audio_url
          // backgroundAudioManager 设置 src 后会自动播放
        } else {
          // 对于 backgroundAudioManager，如果已经有src则可以调用play()
          try {
            this.audioContext.play()
          } catch (error) {
            console.error('恢复播放失败，重新设置音频源:', error)
            // 如果播放失败，重新设置音频源
            this.playSong(this.currentIndex)
          }
        }
      }
    },

    playSong(index) {
      if (index < 0 || index >= this.playlist.length) return

      // 播放前先停止其他音频
      const audioPlayerStore = useAudioPlayerStore()
      audioPlayerStore.stopAllAudio()

      this.currentIndex = index
      this.currentSong = this.getCurrentSong

      if (this.audioContext && this.currentSong) {
        // 设置背景音乐管理器的必要属性
        this.audioContext.title = this.currentSong.title || '不芒一点'
        this.audioContext.epname = this.currentSong.desc || '校园节目'
        this.audioContext.singer = this.currentSong.artist || ''
        this.audioContext.coverImgUrl =
          this.currentSong.cover ||
          'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg'

        this.audioContext.src = this.currentSong.audio_url
        // backgroundAudioManager 设置 src 后会自动播放，不需要手动调用 play()
      }
    },

    next() {
      const nextIndex = (this.currentIndex + 1) % this.playlist.length
      this.playSong(nextIndex)
    },

    prev() {
      const prevIndex =
        this.currentIndex === 0
          ? this.playlist.length - 1
          : this.currentIndex - 1
      this.playSong(prevIndex)
    },

    // 新增：专门用于开始播放的方法，确保停止其他音频
    startPlay() {
      if (!this.audioContext || !this.currentSong) return

      // 停止其他音频
      const audioPlayerStore = useAudioPlayerStore()
      audioPlayerStore.stopAllAudio()

      // 开始播放当前音乐
      this.audioContext.play()
    },

    // 新增：暂停播放（不影响其他音频）
    pausePlay() {
      if (this.audioContext && this.isPlaying) {
        this.audioContext.pause()
      }
    },

    // 新增：停止播放并清理
    stopPlay() {
      if (this.audioContext) {
        this.audioContext.stop()
        this.isPlaying = false
      }
    },

    destroyAudio() {
      if (this.audioContext) {
        // backgroundAudioManager 不需要调用 destroy()，只需要停止即可
        this.audioContext.stop()
        this.audioContext = null
      }
    },
  },
})
