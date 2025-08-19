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
        // 新闻列表不包含主新闻，从第二条开始显示
        newsList.value = allNews.value.slice(1)

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

    // 如果播放列表为空，从后端获取节目列表并随机选择一首
    if (musicStore.playlist.length <= 0) {
      await loadRandomSongToPlaylist()
    }

    await loadAllNews()
  })

  // 从后端获取节目列表并随机选择一首歌曲添加到播放列表（不播放）
  const loadRandomSongToPlaylist = async () => {
    try {
      console.log('播放列表为空，从后端获取节目列表...')

      // 先获取所有分类
      const categoriesResponse = await request(
        `${baseUrl}/school_music/categories`,
        'GET'
      )

      if (
        categoriesResponse.code !== 0 ||
        !categoriesResponse.data ||
        categoriesResponse.data.length === 0
      ) {
        console.log('获取分类失败或无分类数据')
        return
      }

      const categories = [...categoriesResponse.data] // 复制数组，避免修改原数组
      let randomSong = null

      // 循环尝试不同的分类，直到找到有节目的分类或所有分类都尝试过
      while (categories.length > 0 && !randomSong) {
        // 随机选择一个分类索引
        const randomIndex = Math.floor(Math.random() * categories.length)
        const randomCategory = categories[randomIndex]

        // 从数组中移除已尝试的分类，避免重复尝试
        categories.splice(randomIndex, 1)

        console.log(
          `尝试分类: ${randomCategory} (剩余未尝试: ${categories.length})`
        )

        try {
          // 获取该分类下的节目列表
          const programResponse = await request(
            `${baseUrl}/school_music/list?category=${randomCategory}`,
            'GET'
          )

          if (
            programResponse.code === 0 &&
            programResponse.data &&
            programResponse.data.length > 0
          ) {
            const programs = programResponse.data
            // 随机选择一首歌曲
            const randomSongIndex = Math.floor(Math.random() * programs.length)
            randomSong = programs[randomSongIndex]

            console.log(
              `在分类 "${randomCategory}" 中找到 ${programs.length} 首节目`
            )
            console.log('随机选择的歌曲:', randomSong)
            break
          } else {
            console.log(
              `分类 "${randomCategory}" 下没有节目或获取失败，尝试其他分类...`
            )
          }
        } catch (categoryError) {
          console.error(`获取分类 "${randomCategory}" 节目失败:`, categoryError)
          // 继续尝试下一个分类
        }
      }

      if (randomSong) {
        // 使用不会自动播放的方法设置播放列表
        musicStore.setPlaylistWithoutPlay([randomSong], 0)
        console.log('随机歌曲已添加到播放列表（未播放）')
      } else {
        console.log('所有分类都没有找到可用的节目')
        // 可以在这里设置一个默认的音乐或显示提示
        uni.showToast({
          title: '暂无可播放的节目',
          icon: 'none',
          duration: 2000,
        })
      }
    } catch (error) {
      console.error('加载随机歌曲失败:', error)
      uni.showToast({
        title: '获取节目失败',
        icon: 'none',
        duration: 2000,
      })
    }
  }

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
