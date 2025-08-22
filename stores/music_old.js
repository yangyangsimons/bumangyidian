// stores/music.js
import { defineStore } from 'pinia'
import { useAudioPlayerStore } from './audioPlayer'
import { watch, nextTick, computed } from 'vue'

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
      result: bgIsPlaying && bgAudioId === currentId
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
      result: bgIsPlaying && currentAudioId === audioId
    })

    return bgIsPlaying && currentAudioId === audioId
  }

  // 初始化音频
  const initAudio = () => {
    // 设置音乐播放完成的回调，用于自动切换下一首
    audioPlayerStore.setOnMusicEndedCallback(() => {
      console.log('音乐播放完成，切换到下一首')
      next()
    })
  }

    setupAudioEvents() {
      if (!this.audioPlayerStore) return

      // 使用watch监听audioPlayer store的背景音乐状态变化
      watch(
        () => [
          this.audioPlayerStore.bgIsPlaying,
          this.audioPlayerStore.bgAudioId,
        ],
        ([isPlaying, audioId]) => {
          console.log('状态变化监听:', { isPlaying, audioId, currentSong: this.currentSong })
          
          // 只有当播放的音乐是我们管理的音乐时，才同步播放状态
          if (this.currentSong && audioId === this.currentSong.id) {
            console.log('同步播放状态:', isPlaying)
            this.isPlaying = isPlaying
          } else {
            // 如果播放的不是我们的音乐，设置为未播放状态
            if (this.isPlaying) {
              console.log('重置播放状态为false')
              this.isPlaying = false
            }
          }
        },
        { immediate: true }
      )

      // 注意：不再直接设置背景音乐管理器的事件监听
      // 因为这些都由audioPlayer store统一管理
    },

    setPlaylist(list, index = 0, category = null) {
      console.log('设置播放列表:', list, '当前索引:', index, '分类:', category)
      // 过滤掉无效的歌曲数据
      this.playlist = list.filter((item) => item && item.id && item.audio_url)
      this.currentIndex = index
      this.currentSong = this.getCurrentSong
      this.currentCategory = category // 设置当前分类

      if (this.audioPlayerStore && this.currentSong) {
        // 使用audioPlayer store播放背景音乐
        this.audioPlayerStore.playBgMusic(
          this.currentSong.audio_url,
          0, // playTime
          null, // sectionId
          this.currentSong.id, // audioId - 使用歌曲ID作为audioId
          {
            title: this.currentSong.title || '不芒一点',
            epname: this.currentSong.desc || '校园节目',
            singer: this.currentSong.artist || '',
            coverImgUrl:
              this.currentSong.cover ||
              'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
          }
        )

        // 设置为不循环播放（音乐播放完成后可以切换到下一首）
        this.audioPlayerStore.setBgLoop(false)

        // 同步播放状态
        this.isPlaying = this.audioPlayerStore.bgIsPlaying
      }
    },

    // 设置播放列表但不自动播放（仅准备音频源）
    setPlaylistWithoutPlay(list, index = 0, category = null) {
      console.log(
        '设置播放列表（不播放）:',
        list,
        '当前索引:',
        index,
        '分类:',
        category
      )
      // 过滤掉无效的歌曲数据
      this.playlist = list.filter((item) => item && item.id && item.audio_url)
      this.currentIndex = index
      this.currentSong = this.getCurrentSong
      this.currentCategory = category // 设置当前分类

      // 只设置歌曲信息，不播放音频
      console.log('播放列表已设置，但不会自动播放')
    },

    // 添加歌曲到播放列表并立即播放
    addAndPlaySong(song, playImmediately = true, category = null) {
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

      this.currentCategory = category // 设置当前分类

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
    playNewSong(song, category = null) {
      this.setPlaylist([song], 0, category)
      this.playSong(0)
    },

    // 插入歌曲到当前播放位置之后
    insertAndPlayNext(song) {
      const insertIndex = this.currentIndex + 1
      this.playlist.splice(insertIndex, 0, song)
      this.playSong(insertIndex)
    },

    togglePlay() {
      if (!this.audioPlayerStore || !this.currentSong) return

      console.log('togglePlay调用:', {
        isPlaying: this.isPlaying,
        currentSong: this.currentSong.title,
        bgIsPlaying: this.audioPlayerStore.bgIsPlaying,
        bgAudioId: this.audioPlayerStore.bgAudioId
      })

      if (this.isPlaying) {
        // 暂停背景音乐
        console.log('暂停音乐')
        this.audioPlayerStore.pauseBgMusic()
        // 不手动设置状态，让watch处理
      } else {
        // 如果当前歌曲与audioPlayer正在播放的不同，播放新歌曲
        if (
          !this.audioPlayerStore.bgIsPlaying ||
          this.audioPlayerStore.bgAudioId !== this.currentSong.id
        ) {
          console.log('播放新歌曲')
          this.playSong(this.currentIndex)
        } else {
          // 恢复播放
          console.log('恢复播放')
          this.audioPlayerStore.resumeBgMusic()
          // 不手动设置状态，让watch处理
        }
      }
    },

    playSong(index) {
      if (index < 0 || index >= this.playlist.length) return

      this.currentIndex = index
      this.currentSong = this.getCurrentSong

      if (this.audioPlayerStore && this.currentSong) {
        console.log('开始播放歌曲:', this.currentSong.title, 'ID:', this.currentSong.id)
        
        // 使用audioPlayer store播放背景音乐
        this.audioPlayerStore.playBgMusic(
          this.currentSong.audio_url,
          0, // playTime
          null, // sectionId
          this.currentSong.id, // audioId - 使用歌曲ID作为audioId
          {
            title: this.currentSong.title || '不芒一点',
            epname: this.currentSong.desc || '校园节目',
            singer: this.currentSong.artist || '',
            coverImgUrl:
              this.currentSong.cover ||
              'https://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/logo/logo.jpg',
          }
        )

        // 设置为不循环播放（音乐播放完成后可以切换到下一首）
        this.audioPlayerStore.setBgLoop(false)

        // 状态同步由watch处理，不需要手动设置
        console.log('播放后状态:', this.audioPlayerStore.bgIsPlaying, this.audioPlayerStore.bgAudioId)
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
      if (!this.audioPlayerStore || !this.currentSong) return

      // 播放当前音乐
      this.playSong(this.currentIndex)
    },

    // 新增：暂停播放（不影响其他音频）
    pausePlay() {
      if (this.audioPlayerStore && this.isPlaying) {
        this.audioPlayerStore.pauseBgMusic()
        this.isPlaying = false
      }
    },

    // 新增：停止播放并清理
    stopPlay() {
      if (this.audioPlayerStore) {
        this.audioPlayerStore.stopBgMusic()
        this.isPlaying = false
      }
    },

    destroyAudio() {
      // audioPlayer store会统一管理，不需要单独销毁
      console.log('音乐播放器已停止')
    },
  },
})
