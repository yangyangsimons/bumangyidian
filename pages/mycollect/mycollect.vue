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
        <view v-else class="content-list">
          <!-- 节目列表内容 -->
          <view v-for="item in programList" :key="item.id" class="program-item">
            <view class="content"
              ><view class="title">{{ item.title }}</view>
              <view class="desc">{{ item.desc }}</view>
            </view>
            <view class="actions">
              <image
                src="../../static/my/music-collect.png"
                @click="removeFromFavorites(item.id)"
              ></image>
              <image
                src="../../static/my/play.png"
                @click="playAudio(item.audio_url)"
              ></image>
            </view>
          </view>
        </view>
      </view>

      <!-- 资讯内容 -->
      <view v-show="activeTab === 'news'" class="main-box">
        <view v-if="newsList.length === 0" class="empty">
          <image
            class="empty-message"
            src="../../static/my/empty-message.png"
          />
        </view>
        <view v-else class="content-list">
          <!-- 资讯列表内容 -->
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
  const activeTab = ref('program')
  const programList = ref([]) // 节目收藏数据
  const newsList = ref([]) // 资讯收藏数据

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
</style>
