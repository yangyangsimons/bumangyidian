<template>
  <view class="mycollect">
    <uni-nav-bar
      :fixed="true"
      :status-bar="true"
      :shadow="false"
      background-color="rgba(255, 255, 255, 0)"
      color="#333"
      :border="false"
      leftWidth="0"
    >
      <uni-icons
        type="left"
        size="22"
        class="nav-icon"
        @click="goBack"
      ></uni-icons>
      <view class="nav-title">
        <text class="title-text">收藏</text>
      </view>
    </uni-nav-bar>
    <image class="bg" src="../../static/my/bg.png" mode="scaleToFill"></image>

    <!-- 标签页头部 -->
    <view class="header">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        @click="selectTab(tab.key)"
      >
        <text :class="{ active: activeTab === tab.key }">{{ tab.label }}</text>
        <image
          v-if="activeTab === tab.key"
          src="../../static/my/collect-header-bg.png"
          mode="scaleToFill"
        />
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="main">
      <!-- 节目内容 -->
      <view v-show="activeTab === 'program'" class="main-box">
        <view v-if="programList.length === 0" class="empty">
          <image
            class="empty-message"
            src="../../static/my/empty-message.png"
          />
        </view>
        <scroll-view
          v-else
          scroll-y="true"
          class="content-list"
          bounces="true"
          @touchstart="onTouchStart"
          @touchmove.stop.prevent="onTouchMove"
          @touchend="onTouchEnd"
          @scroll="onScroll"
          :scroll-top="scrollTop"
        >
          <!-- pull-wrapper 会在顶部下拉时做 translateY 动画，产生回弹效果 -->
          <view
            class="pull-wrapper"
            :class="{ dragging: dragging }"
            :style="{
              transform: `translateY(${translateY}px)`,
            }"
          >
            <!-- 节目列表内容 -->
            <view
              v-for="item in programList"
              :key="item.id"
              class="program-item"
            >
              <view class="content"
                ><view class="title">{{ item.title }}</view>
                <view class="desc">{{ item.desc }}</view>
              </view>
              <view class="actions">
                <image
                  src="../../static/my/music-collect.png"
                  @click="removeFromFavorites(item.id)"
                ></image>
                <view class="play-btn">
                  <image
                    class="play-icon"
                    mode="aspectFill"
                    :src="
                      safeIsPlayingAudio(item.id)
                        ? '/static/pause.png'
                        : '/static/triangle.png'
                    "
                    @click="togglePlay(item)"
                  ></image>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 资讯内容 -->
      <view v-show="activeTab === 'news'" class="main-box">
        <view v-if="newsList.length === 0" class="empty">
          <image
            class="empty-message"
            src="../../static/my/empty-message.png"
          />
        </view>
        <scroll-view
          v-else
          scroll-y="true"
          class="content-list"
          bounces="true"
          @touchstart="onTouchStart"
          @touchmove.stop.prevent="onTouchMove"
          @touchend="onTouchEnd"
          @scroll="onScroll"
          :scroll-top="scrollTop"
        >
          <!-- pull-wrapper 会在顶部下拉时做 translateY 动画，产生回弹效果 -->
          <view
            class="pull-wrapper"
            :class="{ dragging: dragging }"
            :style="{
              transform: `translateY(${translateY}px)`,
            }"
          >
            <!-- 资讯列表内容 -->
            <view
              v-for="item in newsList"
              :key="item.id"
              class="news-item"
              @click="viewNewsDetail(item)"
            >
              <view class="content">
                <view class="title">{{ item.title }}</view>
                <view class="time">{{ item.created_at }}</view>
              </view>
              <view class="cover-img">
                <image :src="item.pic" mode="aspectFill" />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref } from 'vue'
  import { onMounted } from 'vue'
  import { onShow, onHide } from '@dcloudio/uni-app'
  import request from '@/utils/request.js'
  import { baseUrl } from '../../utils/config'
  import { useMusicStore } from '@/stores/music'
  import { useAudioPlayerStore } from '@/stores/audioPlayer'

  const musicStore = useMusicStore()
  const activeTab = ref('program')
  const programList = ref([]) // 节目收藏数据
  const newsList = ref([]) // 资讯收藏数据

  // 下拉回弹相关状态
  const startY = ref(0)
  const translateY = ref(0)
  const dragging = ref(false)
  const maxPull = 200 // 最大可拉距离（像素）
  const scrollTop = ref(0) // 记录滚动位置

  const tabs = [
    { key: 'program', label: '节目' },
    { key: 'news', label: '资讯' },
  ]

  const selectTab = (tab) => {
    activeTab.value = tab
  }

  const goBack = () => {
    uni.navigateBack()
  }

  // 触摸/滚动处理：实现下拉拉伸与回弹
  const onTouchStart = (e) => {
    const touches = e.touches || (e.changedTouches && e.changedTouches)
    if (!touches || !touches[0]) return
    startY.value = touches[0].clientY
    dragging.value = false
  }

  const onTouchMove = (e) => {
    const touches = e.touches || (e.changedTouches && e.changedTouches)
    if (!touches || !touches[0]) return
    const currentY = touches[0].clientY
    const dy = currentY - startY.value

    // 仅在滚动到顶部并且向下拖动时生效
    if (dy > 0 && scrollTop.value <= 5) {
      // 增强阻尼效果：使用三段式阻尼
      let resisted
      if (dy <= 60) {
        // 初始阶段：线性阻尼
        resisted = dy * 0.8
      } else if (dy <= 120) {
        // 中间阶段：二次阻尼
        resisted = 48 + (dy - 60) * 0.5
      } else {
        // 最后阶段：强阻尼
        resisted = 78 + Math.sqrt(dy - 120) * 6
      }

      translateY.value = Math.min(maxPull, resisted)
      dragging.value = true

      // 阻止默认滚动行为
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const onTouchEnd = () => {
    if (!dragging.value) return
    // 直接回弹，不执行任何刷新操作
    animateBack()
  }

  const animateBack = () => {
    // 使用过渡 CSS 控制回弹动画，通过设置 translateY -> 0
    translateY.value = 0
    dragging.value = false
  }

  // 滚动事件处理
  const onScroll = (e) => {
    scrollTop.value = e.detail.scrollTop || 0
  }

  // 添加安全检查函数
  const safeIsPlayingAudio = (audioId) => {
    if (!audioId) {
      console.log('safeIsPlayingAudio 检查失败: audioId为空')
      return false
    }

    if (!musicStore || !musicStore.isPlayingAudio) {
      console.log('safeIsPlayingAudio 检查失败:', {
        hasMusicStore: !!musicStore,
        hasMethod: !!musicStore?.isPlayingAudio,
        hasAudioId: !!audioId,
      })
      return false
    }

    try {
      return musicStore.isPlayingAudio(audioId)
    } catch (error) {
      console.error('safeIsPlayingAudio 调用出错:', error)
      return false
    }
  }

  // 播放控制函数 - 与 programme 组件保持一致
  const togglePlay = (item) => {
    console.log('切换播放状态:', item.title, 'ID:', item.id)
    console.log('当前状态:', {
      currentSong: musicStore.currentSong?.title,
      currentSongId: musicStore.currentSong?.id,
      isPlaying: musicStore.isPlaying,
      isPlayingThisAudio: safeIsPlayingAudio(item.id),
    })

    // 检查当前是否正在播放这首歌
    if (musicStore.currentSong && musicStore.currentSong.id === item.id) {
      // 如果是同一首歌，就切换播放/暂停状态
      console.log('切换播放/暂停状态')
      musicStore.togglePlay()
    } else {
      // 如果是不同的歌，就播放新歌
      console.log('播放新歌曲')

      // 重新设置音乐播放完成回调
      const audioPlayerStore = useAudioPlayerStore()
      if (audioPlayerStore) {
        audioPlayerStore.setOnMusicEndedCallback(() => {
          console.log('音乐播放完成，切换到下一首')
          musicStore.next()
        })
      }

      // 对于收藏列表，我们可以传递一个默认的分类信息
      const defaultCategory = { name: '收藏', id: 'favorites' }
      musicStore.addAndPlaySong(item, true, defaultCategory)
    }

    // 添加一个延迟检查，看看状态是否已经更新
    setTimeout(() => {
      const audioPlayerStore = useAudioPlayerStore()
      console.log('延迟检查状态:', {
        isPlaying: musicStore.isPlaying,
        isPlayingThisAudio: safeIsPlayingAudio(item.id),
        bgIsPlaying: audioPlayerStore?.bgIsPlaying,
        bgAudioId: audioPlayerStore?.bgAudioId,
      })
    }, 1000)
  }

  // 查看资讯详情
  const viewNewsDetail = (newsItem) => {
    // 将数据存储到本地存储
    uni.setStorageSync('currentNewsDetail', {
      title: newsItem.title,
      html: newsItem.html,
      created_at: newsItem.created_at,
    })

    // 跳转到详情页 LIKED直接设置为true
    uni.navigateTo({
      url: '/pages/newsdetails/newsdetails?id=' + newsItem.id + '&liked=1',
    })
  }

  // 如果需要加载数据的方法
  const loadProgramList = async () => {
    try {
      // 调用API获取节目收藏数据
      const response = await request(
        `${baseUrl}/school_music/query_my_like_music`,
        'GET'
      )
      console.log('节目收藏数据:', response)

      programList.value =
        response.data.length > 0 ? response.data : programList.value
    } catch (error) {
      console.error('获取节目收藏失败:', error)
    }
  }

  const loadNewsList = async () => {
    try {
      // 调用API获取资讯收藏数据
      const response = await request(
        `${baseUrl}/school_news/query_my_like_news`,
        'GET'
      )
      console.log('资讯收藏数据:', response)
      newsList.value = response.data.length > 0 ? response.data : newsList.value
    } catch (error) {
      console.error('获取资讯收藏失败:', error)
    }
  }

  //取消收藏
  const removeFromFavorites = async (id) => {
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
  //   页面加载时获取数据
  onShow(async () => {
    loadProgramList()
    loadNewsList()
  })
</script>

<style lang="scss" scoped>
  @import './index.scss';

  .pull-wrapper {
    transition: transform 400ms cubic-bezier(0.22, 0.8, 0.2, 1);
    will-change: transform;
  }

  /* 当正在拖动时，去除 transition，让位移跟随手势更灵敏 */
  .pull-wrapper.dragging {
    transition: none;
  }

  /* 可选：在拖动时给列表顶部留白，避免图片被拉出圆角 */
  .program-item:first-child,
  .news-item:first-child {
    border-top-left-radius: 16rpx;
    border-top-right-radius: 16rpx;
  }

  /* 增强列表项的交互效果 */
  .program-item,
  .news-item {
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    }
  }
</style>
