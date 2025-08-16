<template>
  <div class="container">
    <div class="card">
      <view class="audio-player">
        <!-- 分类选择器 -->
        <view class="category-selector">
          <view class="category-tabs">
            <text
              v-for="(category, index) in categories"
              :key="index"
              class="category-tab"
              :class="{ active: activeCategory === index }"
              @click="selectCategory(index)"
            >
              {{ category }}
            </text>
          </view>
          <view class="indicator-wrapper">
            <view
              class="indicator"
              :style="{ left: indicatorLeft + 'rpx' }"
            ></view>
            <view class="indicator-arrow"></view>
          </view>
        </view>

        <!-- 音频信息卡片 -->
        <view class="audio-card">
          <view class="audio-cover">
            <image
              class="cover-image"
              :src="audioInfo.cover"
              mode="aspectFill"
            />
          </view>

          <view class="audio-info">
            <text class="audio-title">{{ audioInfo.title }}</text>
            <text class="audio-desc">{{ audioInfo.description }}</text>
            <text class="audio-time">{{ audioInfo.duration }}</text>
          </view>
        </view>

        <!-- 控制按钮 -->
        <view class="control-buttons">
          <view class="row">
            <view class="control-btn" @click="toggleFavorite">
              <image
                class="btn-icon"
                :src="
                  isFavorite ? '/static/star-filled.png' : '/static/star.png'
                "
              />
            </view>

            <view class="control-btn" @click="shareAudio">
              <image class="btn-icon" src="/static/share-cirle.png" />
            </view>

            <view class="control-btn" @click="showHistory">
              <image class="btn-icon" src="/static/history.png" />
            </view>
          </view>

          <view class="play-btn" @click="togglePlay">
            <image
              class="play-icon"
              :src="isPlaying ? '/static/pause.png' : '/static/triangle.png'"
            />
          </view>
        </view>
      </view>
    </div>
    <div class="list">
      <div class="list-title">
        <div>节目列表</div>
      </div>
      <div class="item" v-for="item in list" :key="item.id">
        <div>
          <div class="title">{{ item.title }}</div>
          <div class="info">{{ item.desc }}</div>
        </div>
        <div class="row">
          <div class="star" @click="toggleFavorite(item.id)">
            <image :src="getLikeImageSrc(item)" mode="widthFix" />
          </div>
          <div class="play">
            <image src="/static/triangle.png" mode="widthFix" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import {
    ref,
    computed,
    onUnmounted,
    getCurrentInstance,
    onMounted,
  } from 'vue'
  import request from '@/utils/request'
  import { baseUrl } from '@/utils/config'

  const list = ref([])

  // 获取组件实例用于emit
  const { emit } = getCurrentInstance()

  // 响应式数据
  const categories = ref([])
  const activeCategory = ref(1) // 默认选中"知识类"
  const audioInfo = ref({
    title: '校园之声',
    description: '杨思思 校园内发生的点滴趣事',
    duration: '08:00-08:55',
    cover: 'https://img.js.design/assets/img/6837d23d6ef735a4735723a0.png',
  })
  const isPlaying = ref(false)
  const isFavorite = ref(false)
  const audioContext = ref(null)

  // 根据收藏状态返回对应的图片地址
  const getLikeImageSrc = (item) => {
    console.log('是不是被收藏了', item.liked)
    return item.liked ? '/static/my/music-collect.png' : '/static/my/star.png'
  }
  // 计算属性
  const indicatorLeft = computed(() => {
    // 计算指示器位置，每个标签约150rpx宽度
    return activeCategory.value * 150 + 75 - 15 // 减去指示器宽度的一半
  })

  // 加载节目列表的方法
  const loadProgramList = async (categoryIndex = null) => {
    try {
      // 如果没有传入分类索引，使用当前激活的分类
      const targetCategoryIndex =
        categoryIndex !== null ? categoryIndex : activeCategory.value

      // 获取对应分类名称
      const categoryName = categories.value[targetCategoryIndex]

      if (!categoryName) {
        console.error('分类不存在')
        return
      }

      // 调用API获取指定分类下的节目数据
      const response = await request(
        `${baseUrl}/school_music/list?category=${categoryName}`,
        'GET'
      )
      console.log('节目数据:', response)

      if (response.code === 0 && response.data) {
        list.value = response.data
      }
    } catch (error) {
      console.error('获取节目列表失败:', error)
    }
  }

  // 生命周期钩子
  onMounted(async () => {
    try {
      //获取所有分类
      const responseCategories = await request(
        `${baseUrl}/school_music/categories`,
        'GET'
      )
      console.log('节目组件加载', responseCategories)
      if (responseCategories.code === 0 && responseCategories.data) {
        categories.value = responseCategories.data
      }
      console.log('categories', categories.value)

      //获取分类下面的节目列表
      const responsePrograms = await request(
        `${baseUrl}/school_music/list?category=${
          categories.value[activeCategory.value]
        }`,
        'GET'
      )
      console.log('节目列表', responsePrograms)
      if (responsePrograms.code === 0 && responsePrograms.data) {
        list.value = responsePrograms.data
      }
    } catch (error) {
      console.error('初始化数据失败:', error)
    }
  })

  // 方法定义
  const selectCategory = (index) => {
    activeCategory.value = index
    // 切换分类时加载对应的节目列表
    loadProgramList(index)
    // 这里可以添加切换分类的逻辑
    emit('categoryChange', index)
  }

  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
      // 开始播放音频
      startAudio()
    } else {
      // 暂停音频
      pauseAudio()
    }
  }

  const startAudio = () => {
    // 创建音频上下文
    audioContext.value = uni.createInnerAudioContext()
    audioContext.value.src = audioInfo.value.src
    audioContext.value.play()

    audioContext.value.onEnded(() => {
      isPlaying.value = false
    })
  }

  const pauseAudio = () => {
    if (audioContext.value) {
      audioContext.value.pause()
    }
  }

  const toggleFavorite = async (id) => {
    try {
      const response = await request(`${baseUrl}/school_music/like`, 'POST', {
        shcool_music_id: id,
      })
      console.log('取消收藏节目:', response)
      if (response.data.liked) {
        uni.showToast({
          title: '收藏成功',
          icon: 'success',
        })
      } else {
        uni.showToast({
          title: '已取消收藏',
          icon: 'none',
        })
      }
      // 重新加载节目列表
      loadProgramList()
    } catch (error) {
      console.error('取消收藏节目失败:', error)
      uni.showToast({
        title: '取消收藏失败',
        icon: 'none',
      })
    }
  }

  const shareAudio = () => {
    // 分享功能
    uni.share({
      provider: 'weixin',
      scene: 'WXSceneSession',
      type: 0,
      href: 'https://example.com/audio/' + audioInfo.value.id,
      title: audioInfo.value.title,
      summary: audioInfo.value.description,
      imageUrl: audioInfo.value.cover,
      success: function (res) {
        console.log('分享成功')
      },
    })
  }

  const showHistory = () => {
    // 显示播放历史
    uni.navigateTo({
      url: '/pages/history/history',
    })
  }

  // 组件卸载时销毁音频
  onUnmounted(() => {
    console.log('组件卸载,节目组件写在')
    if (audioContext.value) {
      audioContext.value.destroy()
    }
  })
</script>
<style scoped lang="scss">
  // 这里可以添加其他脚本逻辑
  @import './index.scss';
</style>
