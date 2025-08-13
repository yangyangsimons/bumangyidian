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
          <view v-for="item in newsList" :key="item.id" class="news-item">
            {{ item.title }}
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
  const programList = ref([
    {
      id: 1,
      audio_url:
        'http://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/school_music%2FNone%2F20250611161733051175.mp3',
      title: '校园之声标题名称2',
      desc: '李潇潇 校园内发生的点滴趣事',
      effective_time: '2025-06-12 16:58:00',
    },
    {
      id: 2,
      audio_url:
        'http://oss-5gradio-school-public.oss-cn-shenzhen.aliyuncs.com/school_music%2FNone%2F20250611161733051175.mp3',
      title: '校园之声标题名称2',
      desc: '李潇潇 校园内发生的点滴趣事',
      effective_time: '2025-06-12 16:58:00',
    },
  ]) // 节目收藏数据
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
    } catch (error) {
      console.error('获取资讯收藏失败:', error)
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
