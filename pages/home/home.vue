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
    <!-- 轮播图 -->
    <swiper
      class="banner"
      :indicator-dots="false"
      :autoplay="true"
      :circular="true"
      :interval="2000"
    >
      <swiper-item
        v-for="(item, index) in swiperList"
        :key="index"
        class="banner-item"
      >
        <image :src="item.pic_url" mode="aspectFill" />
      </swiper-item>
    </swiper>
    <div class="content">
      <!-- 标题 -->
      <div class="title">热点资讯</div>
      <!-- 可滚动的新闻容器 -->
      <view class="news-scroll-container">
        <view class="news-container">
          <!-- 主要新闻卡片 -->
          <view
            class="main-news-card"
            v-if="mainNews"
            @click="viewNewsDetail(mainNews)"
          >
            <image
              class="main-news-image"
              :src="mainNews.pic"
              mode="aspectFill"
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
  import { onShow, onHide, onLoad } from '@dcloudio/uni-app'
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
  // 后端似乎固定每页 10 条（用户反馈只拿到 10 条），不完全依赖 size 防止提前停止
  const pageSize = 20 // 仍然保留参数（若后端以后支持）
  const totalNews = ref(0) // 保存总条数

  //轮播图
  const swiperList = ref([])
  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const datePart = dateStr.split(' ')[0]
    return datePart
  }

  // 一次性加载所有新闻数据（根据 total 连续翻页）
  const loadAllNews = async () => {
    if (loading.value) return // 并发保护
    try {
      loading.value = true
      allNews.value = []
      mainNews.value = null
      newsList.value = []
      totalNews.value = 0

      let page = 1
      let fetched = 0

      console.log('开始加载所有新闻数据...')

      while (true) {
        console.log(`正在加载第 ${page} 页...`)
        const response = await request(
          `${baseUrl}/school_news/get_school_news_list?page=${page}&size=${pageSize}`,
          'GET'
        )

        if (response.code !== 0) {
          console.error('获取新闻失败:', response.message)
          uni.showToast({ title: response.message || '加载失败', icon: 'none' })
          break
        }

        const { data: newsData, total } = response.data || {}
        if (typeof total === 'number') totalNews.value = total

        if (!newsData || newsData.length === 0) {
          console.log('本页无数据，提前结束。')
          break
        }

        allNews.value.push(...newsData)
        fetched += newsData.length
        console.log(`已累计获取 ${fetched}/${totalNews.value || '?'} 条`)

        // 如果已经达到或超过 total，结束循环
        if (totalNews.value && allNews.value.length >= totalNews.value) {
          console.log(`达到总数 ${totalNews.value}，停止加载。`)
          break
        }

        // 安全阈值：若连续请求但总数未返回，且本页数量与上一页相同且小于声明的 pageSize，有可能后端分页固定；继续翻页直到没有数据
        if (!totalNews.value && newsData.length === 0) {
          break
        }

        page++
      }

      // 设置主新闻和新闻列表
      if (allNews.value.length > 0) {
        mainNews.value = allNews.value[0]
        newsList.value = allNews.value.slice(1)
        console.log('主新闻设置完成, 总共:', allNews.value.length)

        // 自动跳转逻辑
        const autoOpenNewsId = uni.getStorageSync('autoOpenNewsId')
        if (autoOpenNewsId) {
          const targetNews = allNews.value.find((n) => n.id == autoOpenNewsId)
          uni.removeStorageSync('autoOpenNewsId')
          if (targetNews) {
            setTimeout(() => {
              viewNewsDetail(targetNews)
            }, 500)
          } else {
            console.log('未找到对应的资讯: ', autoOpenNewsId)
          }
        }
      } else {
        console.log('没有获取到任何新闻数据')
      }
    } catch (error) {
      console.error('加载新闻数据失败:', error)
      uni.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  onShow(async () => {
    console.log('页面显示，开始加载数据')
    if (musicStore.playlist.length <= 0) {
      await loadRandomSongToPlaylist()
    }
    await loadAllNews()
    await getSwiperList()
  })

  onLoad((options) => {
    console.log('页面加载参数:', options)
    if (options.shareNewsId) {
      console.log('从分享链接进入，资讯ID:', options.shareNewsId)
      uni.setStorageSync('autoOpenNewsId', options.shareNewsId)
    }
  })
  const getSwiperList = async () => {
    try {
      const response = await request(`${baseUrl}/system/get_quick_link`, 'GET')
      if (response.code === 0) {
        swiperList.value = response.data || []
        // const mock = [
        //   {
        //     id: 1,
        //     pic_url:
        //       'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/news/1755745285_1755740570676122.png',
        //   },
        //   {
        //     id: 2,
        //     pic_url:
        //       'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/quick_link/1755604934_%E9%87%91%E5%88%9A%E4%BD%8D.png',
        //   },
        // ]
        // swiperList.value = mock
      } else {
        console.error('获取轮播图失败:', response.message)
      }
    } catch (error) {
      console.error('获取轮播图异常:', error)
    }
  }
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
      let selectedCategory = null // 保存选中的分类对象

      // 循环尝试不同的分类，直到找到有节目的分类或所有分类都尝试过
      while (categories.length > 0 && !randomSong) {
        // 随机选择一个分类索引
        const randomIndex = Math.floor(Math.random() * categories.length)
        const randomCategoryObj = categories[randomIndex]
        const randomCategory = randomCategoryObj.name // 获取分类对象的name属性

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
            selectedCategory = randomCategoryObj // 保存成功找到歌曲的分类对象

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
        // 使用不会自动播放的方法设置播放列表，传递分类信息
        musicStore.setPlaylistWithoutPlay([randomSong], 0, selectedCategory)
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
