<template>
  <view class="player" v-if="musicStore.currentSong">
    <view class="disc">
      <image :src="getCurrentDiscImage" mode="aspectFill" />
    </view>

    <view class="text" @click="showPlaylist = false">
      <text>{{ musicStore.currentSong.title }}</text>
      <text>{{ musicStore.currentSong.desc }}</text>
      <!-- <text
        >这是一段非常长的文字，我用来测试是不是会换行，或者样式混乱的情况出现呢</text
      >

      <text
        >这是一段非常长的文字，我用来测试是不是会换行，或者样式混乱的情况出现呢</text
      > -->
    </view>

    <view class="icons">
      <view class="music-controls" @click="musicStore.togglePlay()">
        <!-- 播放/暂停按钮 -->
        <image
          :src="
            musicStore.currentSong &&
            musicStore.isPlayingAudio(musicStore.currentSong.id)
              ? '/static/pause.png'
              : '/static/triangle.png'
          "
          mode="widthFix"
        />
      </view>
      <!-- 更多按钮 -->
      <view class="more">
        <image src="/static/more.png" mode="widthFix" @click="goToProgramPage"
      /></view>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useMusicStore } from '@/stores/music'

  const musicStore = useMusicStore()
  const showPlaylist = ref(false)

  // 获取当前disc图片，优先使用分类封面
  const getCurrentDiscImage = computed(() => {
    // 1) 优先使用当前歌曲封面（兼容 cover_url / cover 字段）
    if (musicStore.currentSong) {
      const song = musicStore.currentSong
      if (song.cover_url) return song.cover_url
      if (song.cover) return song.cover
    }
    // 2) 兼容原有：使用当前分类封面
    if (musicStore.currentCategory && musicStore.currentCategory.cover_url) {
      return musicStore.currentCategory.cover_url
    }
    // 3) 默认图片
    return '/static/recommend.png'
  })

  // 播放指定歌曲
  const playSong = (index) => {
    musicStore.playSong(index)
    showPlaylist.value = false
  }

  // 处理播放/暂停切换
  const handleTogglePlay = () => {
    console.log('musicbar 切换播放状态')
    musicStore.togglePlay()
  }

  // 跳转到节目页面
  const goToProgramPage = () => {
    uni.switchTab({
      url: '/pages/interaction/interaction',
    })
  }
</script>
<style scoped lang="scss">
  @import './index.scss';
</style>
