<template>
  <view class="news-detail">
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
        <text class="title-text">资讯详情</text>
      </view>
    </uni-nav-bar>
    <image class="bg" src="../../static/my/bg.png" mode="scaleToFill"></image>
    <scroll-view scroll-y class="content-scroll">
      <view class="content-wrapper">
        <view class="article-title">{{ newsTitle }}</view>
        <view class="article-time">{{ newsTime }}</view>
        <view class="article-content">
          <rich-text :nodes="cleanHtml"></rich-text>
        </view>
      </view>
    </scroll-view>
    <view class="button-icons">
      <button class="share" @click="shareNews" open-type="share">
        <image src="../../static/my/share.png" mode="scaleToFill" />
        <text>分享</text>
      </button>
      <button class="collect" @click="collectNews">
        <image src="../../static/my/news-collect.png" mode="scaleToFill" />
        <text v-if="!isCollected">收藏</text>
        <text v-else>已收藏</text>
      </button>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import request from '@/utils/request.js'
  import { baseUrl } from '../../utils/config'
  import { useMusicStore } from '@/stores/music'
  import { checkTokenAndNavigate } from '@/utils/auth'
  import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

  const isCollected = ref(false)
  const newsid = ref('')

  onShareAppMessage(() => {
    console.log('onShareAppMessage......')
    return {
      title: `不芒一点，陪你世界加一点`,
      imageUrl:
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com:443/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E5%88%86%E4%BA%AB%E5%9B%BE.png',
      path: '/pages/home/home',
    }
  })
  onShareTimeline(() => {
    console.log('onShareTimeline......')
    return {
      title: `不芒一点，陪你世界加一点`,
    }
  })
  const collectNews = async () => {
    //先判断是不是登录了
    checkTokenAndNavigate(async (token) => {
      try {
        const response = await request(`${baseUrl}/school_news/like`, 'POST', {
          school_new_id: newsid.value,
        })
        console.log('收藏资讯:', response)
        if (response.data.liked) {
          uni.showToast({
            title: '收藏成功',
            icon: 'success',
          })
          isCollected.value = true
        } else {
          uni.showToast({
            title: '已取消收藏',
            icon: 'none',
          })
          isCollected.value = false
        }
      } catch (error) {
        console.error('收藏资讯失败:', error)
        uni.showToast({
          title: '收藏失败',
          icon: 'none',
        })
      }
    })
  }

  const newsTitle = ref('')
  const newsTime = ref('')
  const originalHtml = ref('')

  const goBack = () => {
    uni.navigateBack()
  }

  // 清理HTML内容
  const cleanHtml = computed(() => {
    if (!originalHtml.value) return ''

    let html = originalHtml.value

    // 移除所有背景色样式
    html = html.replace(/background-color:\s*[^;]+;?/gi, '')

    // 移除所有颜色样式，让文字使用默认黑色
    html = html.replace(/color:\s*[^;]+;?/gi, '')

    // 移除style属性中的所有样式，但保留img标签的其他属性
    html = html.replace(/(<(?!img)[^>]+)style\s*=\s*["'][^"']*["']/gi, '$1')

    // 为img标签添加统一的class，方便样式控制
    html = html.replace(/<img([^>]*?)>/gi, '<img$1 class="content-image">')

    console.log('清理后的HTML:', html)
    return html
  })

  onLoad((info) => {
    const newsDetail = uni.getStorageSync('currentNewsDetail')
    console.log('加载资讯详情:', info)
    newsid.value = info.id
    //info.liked是0 就是没收藏，为1就是收藏了
    isCollected.value = info.liked == 1
    if (newsDetail) {
      newsTitle.value = newsDetail.title || '资讯详情'
      newsTime.value = newsDetail.created_at || ''
      originalHtml.value = newsDetail.html || ''

      console.log('原始HTML:', newsDetail.html)

      uni.removeStorageSync('currentNewsDetail')
    } else {
      uni.showToast({
        title: '数据加载失败',
        icon: 'none',
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  })
</script>

<style lang="scss" scoped>
  .news-detail {
    position: fixed;
    height: 100%;
    width: 100%;

    ::v-deep .uni-navbar__header-container {
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    ::v-deep .nav-icon {
      margin-left: 0;
    }

    ::v-deep .nav-title {
      width: 100%;
      white-space: nowrap;
      margin-left: 220rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34rpx !important;
      font-weight: 700 !important;
      color: rgba(0, 0, 0, 1);
      font-family: AlibabaPuHuiTi !important;
    }

    .bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background-size: cover;
    }
    .button-icons {
      position: fixed;
      bottom: 20rpx;
      left: 0;
      width: 100%;
      display: flex;
      height: 100rpx;
      wx-button:after {
        border-radius: 0 !important;
        border: none;
      }
      .share,
      .collect {
        display: flex;
        flex: 1;
        width: 50%;
        background-color: #fff;
        border: none;
        align-items: center;
        justify-content: center;

        image {
          width: 48rpx;
          height: 48rpx;
        }

        text {
          margin-left: 10rpx;
          height: 48rpx;
          line-height: 48rpx;
          font-size: 28rpx;
          color: #333;
        }
      }

      .share {
        border-right: 1rpx solid #eee;
      }
    }
  }

  .content-scroll {
    height: calc(100vh - 144px);
  }

  .content-wrapper {
    margin: 0;
    padding: 20px;
    min-height: calc(100vh - 44px);
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 25rpx 25rpx 0 0;
  }

  .article-title {
    font-size: 22px;
    font-weight: bold;
    color: #000 !important;
    line-height: 1.4;
    margin-bottom: 15px;
  }

  .article-time {
    font-size: 14px;
    color: #666;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }

  .article-content {
    // 强制所有文本元素使用黑色

    :deep(p) {
      margin: 15px 0;
      line-height: 1.8;
      color: #000 !important;
      background-color: transparent !important;
      font-size: 16px;
      text-align: justify;
    }

    :deep(span) {
      color: #000 !important;
      background-color: transparent !important;
      font-size: 16px;
      line-height: 1.8;
    }

    :deep(div) {
      color: #000 !important;
      background-color: transparent !important;
    }

    :deep(text) {
      color: #000 !important;
      background-color: transparent !important;
    }

    :deep(strong) {
      color: #000 !important;
      background-color: transparent !important;
    }

    :deep(em) {
      color: #000 !important;
      background-color: transparent !important;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      color: #000 !important;
      background-color: transparent !important;
    }

    // 图片样式：宽度80%，高度自动计算保持4:3比例，居中显示
    :deep(img) {
      width: 80% !important;
      max-width: 80% !important;
      height: auto !important;
      display: block !important;
      margin: 20px auto !important;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    // 如果需要强制4:3比例，可以用这个方法
    :deep(.content-image) {
      width: 80% !important;
      max-width: 80% !important;
      height: auto !important;
      display: block !important;
      margin: 20px auto !important;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
</style>
