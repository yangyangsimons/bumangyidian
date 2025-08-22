<template>
  <view class="player" v-if="musicStore.currentSong">
    <view class="disc">
      <image :src="getCurrentDiscImage" mode="aspectFill" />
    </view>

    <view class="text" @click="showPlaylist = true">
      <text>{{ musicStore.currentSong.title }}</text>
      <text>{{ musicStore.currentSong.desc }}</text>
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

    <!-- 歌曲列表弹窗 -->
    <view
      class="playlist-modal"
      v-if="showPlaylist"
      @click="showPlaylist = false"
    >
      <view class="playlist-content" @click.stop>
        <view class="playlist-header">
          <text class="title">播放列表</text>
          <view class="close-btn" @click="showPlaylist = false">
            <text>×</text>
          </view>
        </view>

        <scroll-view class="playlist-list" scroll-y>
          <view
            class="playlist-item"
            :class="{ active: index === musicStore.currentIndex }"
            v-for="(song, index) in musicStore.playlist"
            :key="song.id"
            @click="playSong(index)"
          >
            <view class="song-info">
              <text class="song-title">{{ song.title }}</text>
              <text class="song-artist">{{ song.artist }}</text>
            </view>
            <view class="song-status" v-if="index === musicStore.currentIndex">
              <text class="playing-icon">♪</text>
            </view>
          </view>
        </scroll-view>

        <view class="playlist-footer">
          <view class="control-buttons">
            <view class="control-btn" @click="musicStore.prev()">
              <text>上一首</text>
            </view>
            <view class="control-btn" @click="musicStore.next()">
              <text>下一首</text>
            </view>
          </view>
        </view>
      </view>
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
    if (musicStore.currentCategory && musicStore.currentCategory.cover_url) {
      return musicStore.currentCategory.cover_url
    }
    return '/static/recommend.png' // 默认图片
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
