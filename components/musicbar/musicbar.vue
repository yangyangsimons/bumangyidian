<template>
  <view class="player" v-if="musicStore.currentSong">
    <view class="disc">
      <image src="/static/disc.png" mode="aspectFill" />
    </view>

    <view class="text" @click="showPlaylist = true">
      <text>{{ musicStore.currentSong.title }}</text>
      <text>{{ musicStore.currentSong.desc }}</text>
    </view>

    <view class="icons">
      <view class="music-controls">
        <!-- 播放/暂停按钮 -->
        <image
          :src="
            musicStore.isPlaying ? '/static/pause.png' : '/static/triangle.png'
          "
          mode="widthFix"
          @click="musicStore.togglePlay()"
        />
      </view>
      <!-- 更多按钮 -->
      <image
        src="/static/more.png"
        mode="widthFix"
        @click="showPlaylist = true"
      />
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
  import { ref } from 'vue'
  import { useMusicStore } from '@/stores/music'

  const musicStore = useMusicStore()
  const showPlaylist = ref(false)

  // 播放指定歌曲
  const playSong = (index) => {
    musicStore.playSong(index)
    showPlaylist.value = false
  }
</script>
<style scoped lang="scss">
  @import './index.scss';
</style>
