<template>
  <view class="container" :style="{ paddingTop: menuButtonRect.top + 'px' }">
    <musicbar
      class="music-bar"
      style="position: fixed; top: 35%; left: 0; right: 0; z-index: 99999"
    />
    <div
      :style="{ height: menuButtonRect.height + 'px' }"
      class="logo-container"
    >
      <image src="/static/global-title.png" class="logo" mode="widthFix" />
    </div>
    <image src="/static/banner.png" class="banner" mode="aspectFill" />
    <div class="content">
      <!-- <div class="player">
        <div class="disc">
          <image src="/static/disc.png" mode="aspectFill" />
        </div>
        <div class="text">
          <text>校园之声</text>
          <text>杨思思-校园广播电台情感电台</text>
        </div>
        <div class="icons">
          <image src="/static/player.png" mode="widthFix" />
          <image src="/static/more.png" mode="widthFix" />
        </div>
      </div> -->

      <!-- 可滚动的新闻容器 -->
      <view class="news-scroll-container">
        <div class="title">热点资讯</div>
        <view class="news-container">
          <!-- 主要新闻卡片 -->
          <view class="main-news-card" v-if="mainNews">
            <image
              class="main-news-image"
              :src="mainNews.pic"
              mode="aspectFill"
              @click="handleNewsClick(mainNews)"
            />
            <view class="main-news-overlay">
              <view class="main-news-content" @click="viewNewsDetail(mainNews)">
                <text class="main-news-title">{{ mainNews.title }}</text>
                <view class="main-news-meta">
                  <text class="news-source">校园资讯</text>
                  <text class="news-time">{{
                    formatDate(mainNews.created_at)
                  }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 新闻列表 -->
          <view class="news-list">
            <view
              class="news-item"
              v-for="(item, index) in newsList"
              :key="item.id"
              @click="viewNewsDetail(item)"
            >
              <view class="news-text-content">
                <text class="news-title">{{ item.title }}</text>
                <view class="news-meta">
                  <text class="news-source">校园资讯</text>
                  <text class="news-time">{{
                    formatDate(item.created_at)
                  }}</text>
                </view>
              </view>
              <image
                class="news-item-image"
                :src="item.pic"
                mode="aspectFill"
              />
            </view>
          </view>

          <!-- 加载状态 -->
          <view class="loading" v-if="loading">
            <text>加载中...</text>
          </view>

          <!-- 加载完成提示 -->
          <view class="load-complete" v-if="!loading && allNews.length > 0">
            <text>共 {{ allNews.length }} 条资讯</text>
          </view>

          <!-- 空状态 -->
          <view class="empty-state" v-if="!loading && allNews.length === 0">
            <text>暂无资讯</text>
          </view>
        </view>
      </view>
    </div>
    <tabbar />
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { onShow, onHide } from '@dcloudio/uni-app'
  import request from '@/utils/request.js'
  import { baseUrl } from '../../utils/config'
  import tabbar from '@/components/tabbar/tabbar.vue'
  import { useMusicStore } from '@/stores/music'
  import musicbar from '@/components/musicbar/musicbar.vue'

  const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
  const menuButtonRect = uni.getMenuButtonBoundingClientRect()
  const musicStore = useMusicStore()
  // 数据相关
  const mainNews = ref(null)
  const newsList = ref([])
  const allNews = ref([])
  const loading = ref(false)
  const refreshing = ref(false)
  const pageSize = 20 // 每页加载数量，可以适当调大

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return ''

    // 提取日期部分（去掉时间）
    const datePart = dateStr.split(' ')[0]
    return datePart
  }

  // 一次性加载所有新闻数据
  const loadAllNews = async () => {
    try {
      loading.value = true
      allNews.value = []

      let page = 1
      let hasMore = true

      console.log('开始加载所有新闻数据...')

      while (hasMore) {
        console.log(`正在加载第 ${page} 页...`)

        const response = await request(
          `${baseUrl}/school_news/get_school_news_list?page=${page}&size=${pageSize}`,
          'GET'
        )

        if (response.code === 0) {
          const { data: newsData, total } = response.data

          if (newsData && newsData.length > 0) {
            allNews.value = [...allNews.value, ...newsData]

            // 检查是否还有更多数据
            if (allNews.value.length >= total || newsData.length < pageSize) {
              hasMore = false
              console.log(`数据加载完成，总共 ${allNews.value.length} 条`)
            } else {
              page++
            }
          } else {
            hasMore = false
            console.log('没有更多数据')
          }
        } else {
          console.error('获取新闻失败:', response.message)
          uni.showToast({
            title: response.message || '加载失败',
            icon: 'none',
          })
          hasMore = false
          break
        }
      }

      // 设置主新闻和新闻列表
      if (allNews.value.length > 0) {
        mainNews.value = allNews.value[0]
        // 显示所有数据（包括主新闻，这样第一个新闻会显示两次）
        newsList.value = allNews.value

        console.log('主新闻设置完成')
        console.log('allNews总数:', allNews.value.length)
        console.log('newsList数量:', newsList.value.length)
        console.log('显示总数:', 1 + newsList.value.length)
      } else {
        console.log('没有获取到任何新闻数据')
      }
    } catch (error) {
      console.error('加载新闻数据失败:', error)
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
      })
    } finally {
      loading.value = false
    }
  }

  onShow(async () => {
    console.log('页面显示，开始加载数据')
    // 初始化音频
    // musicStore.initAudio()

    // 设置播放列表（示例）
    const playlist = [
      {
        id: 1,
        title: '歌曲1',
        desc: '艺术家1',
        audio_url:
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/school_music/%E7%9F%A5%E8%AF%86%E7%B1%BB/%E9%99%86%E8%A8%80.mp3',
        cover:
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/news/1753428336_thumb.jpg',
      },
      // ... 更多歌曲
    ]
    //如果有歌曲了我就直接添加，如果没有我就设置一个 list
    if (!musicStore.playlist.length > 0) {
      musicStore.setPlaylist(playlist)
    }
    await loadAllNews()
  })

  // 点击新闻处理函数
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
      url:
        '/pages/newsdetails/newsdetails?id=' +
        newsItem.id +
        '&liked=' +
        (newsItem.liked ? 1 : 0),
    })
  }
</script>

<style scoped lang="scss">
  @import './index.scss';
</style>
