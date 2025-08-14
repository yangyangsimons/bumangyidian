<template>
  <view class="container" :style="{ paddingTop: menuButtonRect.top + 'px' }">
    <div :style="{ height: menuButtonRect.height + 'px' }" class="logo-container">
      <image src="/static/global-title.png" class="logo" mode="widthFix" />
    </div>
    <image src="/static/banner.png" class="banner" mode="aspectFill" />
    <div class="content">
      <div class="player">
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
      </div>
      <div class="title">热点资讯</div>
      <view class="news-container">
        <!-- 主要新闻卡片 -->
        <view class="main-news-card">
          <image class="main-news-image" :src="mainNews.image" mode="aspectFill" @click="handleNewsClick(mainNews)" />
          <view class="main-news-overlay">
            <view class="main-news-content">
              <text class="main-news-title">{{ mainNews.title }}</text>
              <view class="main-news-meta">
                <text class="news-source">{{ mainNews.source }}</text>
                <text class="news-time">{{ mainNews.star }}点赞</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 新闻列表 -->
        <view class="news-list">
          <view class="news-item" v-for="(item, index) in newsList" :key="index" @click="handleNewsClick(item)">
            <view class="news-text-content">
              <text class="news-title">{{ item.title }}</text>
              <view class="news-meta">
                <text class="news-source">{{ item.source }}</text>
                <text class="news-time">{{ item.star }}点赞</text>
              </view>
            </view>
            <image class="news-item-image" :src="item.image" mode="aspectFill" />
          </view>
        </view>
      </view>
    </div>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
const menuButtonRect = uni.getMenuButtonBoundingClientRect();
console.log("导航栏高度:", statusBarHeight);
console.log("菜单按钮位置:", menuButtonRect);

// 主要新闻数据
const mainNews = ref({
  title: "跟随总书记走进洛阳邮承集团了解先进制造...",
  source: "校园咨询",
  star: "32",
  image: "https://img.js.design/assets/img/6837d23f0f790768ee34ad44.png",
});

// 新闻列表数据
const newsList = ref([
  {
    title: "2025上合组织数字经济论坛将在天津举办",
    source: "校园咨询",
    star: "32",
    image: "https://img.js.design/assets/img/6837d23eae72b5fd97402c32.png",
  },
  {
    title: "2025上合组织数字经济论坛将在天津举办",
    source: "校园咨询",
    star: "32",
    image: "https://img.js.design/assets/img/66a8b1da6e8e19d66544daf8.png",
  },
  {
    title: "2025上合组织数字经济论坛将在天津举办",
    source: "校园咨询",
    star: "32",
    image: "https://img.js.design/assets/img/66a8b1da6e8e19d66544daf8.png",
  },
]);

// 点击新闻处理函数
const handleNewsClick = (newsItem) => {
  console.log("点击新闻:", newsItem);
  // 这里可以跳转到新闻详情页
  uni.navigateTo({
    url: `/pages/news-detail/news-detail?id=${newsItem.id || 0}`,
  });
};

// 页面加载时获取数据
onMounted(() => {
  // 这里可以调用API获取新闻数据
  loadNewsData();
});

// 加载新闻数据
const loadNewsData = async () => {
  try {
    // 模拟API调用
    // const response = await uni.request({
    //   url: 'https://api.example.com/news',
    //   method: 'GET'
    // })
    // mainNews.value = response.data.mainNews
    // newsList.value = response.data.newsList

    console.log("新闻数据加载完成");
  } catch (error) {
    console.error("加载新闻数据失败:", error);
    uni.showToast({
      title: "加载失败，请重试",
      icon: "none",
    });
  }
};

// 下拉刷新
const onPullDownRefresh = () => {
  loadNewsData().finally(() => {
    uni.stopPullDownRefresh();
  });
};

// 上拉加载更多
const onReachBottom = () => {
  // 加载更多新闻
  loadMoreNews();
};

// 加载更多新闻
const loadMoreNews = async () => {
  try {
    // 模拟加载更多数据
    const moreNews = [
      {
        title: "更多新闻标题...",
        source: "校园咨询",
        time: "1小时前",
        image: "/static/images/news4.jpg",
      },
    ];
    newsList.value = [...newsList.value, ...moreNews];
  } catch (error) {
    console.error("加载更多新闻失败:", error);
  }
};

// 导出页面配置
defineExpose({
  onPullDownRefresh,
  onReachBottom,
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  // background-color: #1890ff;
  background-image: url("/static/hello-bg.png");
  background-size: 100% 100%;
  overflow: auto;
  box-sizing: border-box;

  .logo-container {
    display: flex;
    justify-content: start;
    align-items: center;
    padding-inline: 32rpx;

    .logo {
      width: 224rpx;
    }
  }
}

.banner {
  width: 100%;
  height: 400rpx;
}

.content {
  width: 100%;
  height: fit-content;
  background-color: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  position: relative;

  .player {
    width: calc(100% - 70rpx);
    display: flex;
    transform: translateY(-50%);
    margin-inline: 35rpx;
    background-color: #fff;
    border-radius: 0px 17.49rpx 17.49rpx 0px;
    box-shadow: 0px 8.75rpx 15.31rpx rgba(103, 134, 134, 0.18);

    .disc {
      image {
        width: 164rpx;
        height: 120rpx;
      }
    }

    .text {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      text:first-child {
        font-weight: 700;
      }

      text:last-child {
        font-size: 24rpx;
        color: #6e7070;
      }
    }

    .icons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 26rpx;
      margin-right: 17rpx;

      image {
        width: 48rpx;
        height: 48rpx;
      }
    }
  }

  .title {
    width: fit-content;
    margin-top: 30rpx;
    margin-inline: 35rpx;
    font-weight: 700;
    position: relative;
    z-index: 5;

    &::after {
      content: "";
      width: 142rpx;
      height: 13rpx;
      border-radius: 6.56px;
      background: linear-gradient(243.43deg, #cefa1e 0%, #a7ee27 100%);
      position: absolute;
      bottom: 0;
      left: 50%;
      z-index: -1;
      transform: translateX(-50%);
    }
  }

  .news-container {
    padding: 32rpx;
  }

  /* 主要新闻卡片样式 */
  .main-news-card {
    position: relative;
    width: 100%;
    height: 400rpx;
    border-radius: 24rpx;
    overflow: hidden;
    margin-bottom: 32rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  }

  .main-news-image {
    width: 100%;
    height: 100%;
  }

  .main-news-meta {
    font-size: 12px;
  }

  .main-news-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    padding: 48rpx 32rpx 32rpx;
  }

  .main-news-content {
    color: white;
  }

  .main-news-title {
    font-size: 36rpx;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    margin-bottom: 16rpx;
  }

  .main-news-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24rpx;
    color: rgba(255, 255, 255, 0.64);
  }

  /* 新闻列表样式 */
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .news-item {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;
  }

  .news-item:active {
    transform: scale(0.98);
  }

  .news-text-content {
    flex: 1;
    margin-right: 24rpx;
  }

  .news-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    display: block;
    margin-bottom: 16rpx;
    /* 限制显示两行 */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .news-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24rpx;
    color: #989999;

    .news-source {
      font-size: 24rpx;
    }

    .news-time {
      font-size: 24rpx;
    }
  }

  .news-item-image {
    width: 160rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
  }

  /* 加载状态样式 */
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32rpx;
    color: #999;
  }

  /* 空状态样式 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 32rpx;
    color: #999;
  }

  .empty-state text {
    margin-top: 16rpx;
    font-size: 28rpx;
  }
}
</style>
