<template>
  <view class="container" :style="{ paddingTop: menuButtonRect.top + 'px' }">
    <div :style="{ height: menuButtonRect.height + 'px' }" class="logo-container">
      <image src="/static/back.png" class="back" mode="widthFix" />
      <text>资讯详情</text>
      <text></text>
    </div>
    <div class="content">
      <div class="section">
        <!-- <web-view src="https://mp.weixin.qq.com/s/Ho8rgWpUUz-MGPJghH2dLA"></web-view> -->
      </div>
      <div class="footer">
        <div class="footer-item">
          <div class="row">
            <image src="/static/share-cirle.png" mode="widthFix"></image>
            <text>分享</text>
          </div>
        </div>
        <div class="line"></div>
        <div class="footer-item">
          <div class="row">
            <image src="/static/star.png" mode="widthFix"></image>
            <text>收藏</text>
          </div>
        </div>
      </div>
    </div>
    <div class="player">
      <div class="disc">
        <image src="/static/disc.png" mode="scaleToFill" />
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
  background-image: url("/static/hello-bg.png");
  background-size: 100% 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .logo-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 32rpx;
    box-sizing: border-box;

    .back {
      width: 21rpx;
    }
  }

  .content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .section {
      flex: 1;
      margin-top: 14rpx;
      background-color: #ba3434;
      border-top-left-radius: 27.5rpx;
      border-top-right-radius: 27.5rpx;
      overflow: hidden;
    }

    .footer {
      height: 112rpx;
      display: flex;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0rpx -2rpx 0rpx rgba(219, 219, 219, 1);
      margin-bottom: 10rpx;

      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;

        .row {
          display: flex;
          align-items: center;
          gap: 10rpx;
        }

        image {
          width: 48rpx;
          height: 48rpx;
        }

        text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }

  .player {
    position: fixed;
    bottom: calc(112rpx + 28rpx);
    width: calc(100% - 70rpx);
    display: flex;
    margin-inline: 35rpx;
    background: rgba(255, 255, 255, 0.71);
    border-bottom-right-radius: 50rpx;
    border-top-right-radius: 50rpx;
    border: 2rpx solid rgba(255, 255, 255, 1);
    box-shadow: 0rpx 4rpx 8rpx rgba(43, 58, 17, 0.19);
    backdrop-filter: blur(10px);

    .disc {
      width: 136rpx;
      height: 100rpx;
      margin-right: 20rpx;
      image {
        width: 100%;
        height: 100%;
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
        font-size: (12rpx * 2);
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
        width: (24rpx * 2);
        height: (24rpx * 2);
      }
    }
  }
}
</style>
