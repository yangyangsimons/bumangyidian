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
          <div class="info">{{ item.info }}</div>
        </div>
        <div class="row">
          <div class="star">
            <image src="/static/star.png" mode="widthFix" />
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
import { ref, computed, onUnmounted, getCurrentInstance } from "vue";

const list = ref([
  {
    id: 1,
    title: "校园之声标题名称",
    info: "节目信息介绍",
  },
  {
    id: 2,
    title: "校园之声标题名称",
    info: "节目信息介绍",
  },
  {
    id: 3,
    title: "校园之声标题名称",
    info: "节目信息介绍",
  },
  {
    id: 4,
    title: "校园之声标题名称",
    info: "节目信息介绍",
  },
]);

// 获取组件实例用于emit
const { emit } = getCurrentInstance();

// 响应式数据
const categories = ref(["娱乐", "知识类", "音乐类", "访谈类", "新闻"]);
const activeCategory = ref(1); // 默认选中"知识类"
const audioInfo = ref({
  title: "校园之声",
  description: "杨思思 校园内发生的点滴趣事",
  duration: "08:00-08:55",
  cover: "https://img.js.design/assets/img/6837d23d6ef735a4735723a0.png",
});
const isPlaying = ref(false);
const isFavorite = ref(false);
const audioContext = ref(null);

// 计算属性
const indicatorLeft = computed(() => {
  // 计算指示器位置，每个标签约150rpx宽度
  return activeCategory.value * 150 + 75 - 15; // 减去指示器宽度的一半
});

// 方法定义
const selectCategory = (index) => {
  activeCategory.value = index;
  // 这里可以添加切换分类的逻辑
  emit("categoryChange", index);
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    // 开始播放音频
    startAudio();
  } else {
    // 暂停音频
    pauseAudio();
  }
};

const startAudio = () => {
  // 创建音频上下文
  audioContext.value = uni.createInnerAudioContext();
  audioContext.value.src = audioInfo.value.src;
  audioContext.value.play();

  audioContext.value.onEnded(() => {
    isPlaying.value = false;
  });
};

const pauseAudio = () => {
  if (audioContext.value) {
    audioContext.value.pause();
  }
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // 添加到收藏或取消收藏
  emit("favoriteChange", isFavorite.value);
};

const shareAudio = () => {
  // 分享功能
  uni.share({
    provider: "weixin",
    scene: "WXSceneSession",
    type: 0,
    href: "https://example.com/audio/" + audioInfo.value.id,
    title: audioInfo.value.title,
    summary: audioInfo.value.description,
    imageUrl: audioInfo.value.cover,
    success: function (res) {
      console.log("分享成功");
    },
  });
};

const showHistory = () => {
  // 显示播放历史
  uni.navigateTo({
    url: "/pages/history/history",
  });
};

// 组件卸载时销毁音频
onUnmounted(() => {
  if (audioContext.value) {
    audioContext.value.destroy();
  }
});
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .card {
    width: calc(100% - 64rpx);
    height: 716rpx;
    margin: 32rpx;
    overflow: hidden;
    border-radius: 32rpx;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10rpx);
    box-shadow: inset 0rpx 0rpx 18rpx rgba(255, 255, 255, 1),
      0rpx 8rpx 20rpx rgba(112, 125, 88, 0.27);
    .audio-player {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      height: 100%;
      padding: 40rpx 32rpx;
    }

    .category-selector {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 25rpx;
      padding: 20rpx 0;
      margin-bottom: 40rpx;
      backdrop-filter: blur(10rpx);
      position: relative;
    }

    .category-tabs {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .category-tab {
      font-size: 28rpx;
      color: #666;
      padding: 10rpx 20rpx;
    }

    .indicator-wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .indicator {
      width: 30rpx;
      height: 6rpx;
      background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
      border-radius: 3rpx;
      transition: left 0.3s ease;
      position: absolute;
      top: -10rpx;
    }

    .indicator-arrow {
      width: 0;
      height: 0;
      border-left: 15rpx solid transparent;
      border-right: 15rpx solid transparent;
      border-top: 20rpx solid #ff6b6b;
      margin-top: 5rpx;
    }

    .audio-card {
      margin-bottom: 32rpx;
      display: flex;
      align-items: center;
    }

    .audio-cover {
      width: 198rpx;
      height: 198rpx;
      padding: 3rpx;
      box-sizing: border-box;
      border-radius: 20rpx;
      overflow: hidden;
      margin-right: 30rpx;
      border: 6rpx solid rgba(255, 255, 255, 1);
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cover-image {
      width: 100%;
      height: 100%;
      border-radius: 20rpx;
    }

    .audio-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .audio-title {
      font-size: 42rpx;
      font-weight: 700;
      color: rgba(16, 18, 19, 1);
      margin-bottom: 15rpx;
    }

    .audio-desc {
      font-size: 24rpx;
      font-weight: 400;
      letter-spacing: 0rpx;
      line-height: 32.92rpx;
      color: rgba(152, 153, 153, 1);
      margin-bottom: 44rpx;
    }

    .audio-time {
      font-size: 24rpx;
      color: #999;
    }

    .control-buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .row {
      display: flex;
      gap: 32rpx;
    }

    .control-btn {
      width: 80rpx;
      height: 80rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon {
      width: 40rpx;
      height: 40rpx;
    }

    .play-btn {
      width: 120rpx;
      height: 120rpx;
      background: linear-gradient(
        180deg,
        rgba(211, 248, 79, 1) 0%,
        rgba(167, 238, 39, 1) 100%
      );
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .play-icon {
      width: 38rpx;
      height: 46rpx;
    }
  }
  .list {
    border-radius: 24rpx 24rpx, 0rpx, 0rpx;
    background: #fff;
    overflow: hidden;
    &-title {
      width: fit-content;
      position: relative;
      z-index: 5;
      font-size: 32rpx;
      font-weight: 700;
      margin: 32rpx;
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
    .item {
      padding: 24rpx 0;
      margin: 0 24rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2rpx dashed rgba(231, 236, 238, 1);
      .title {
        font-size: 28rpx;
        font-weight: 500;
        margin-bottom: 8rpx;
      }
      .info {
        font-size: 24rpx;
        font-weight: 400;
        color: rgba(152, 153, 153, 1);
      }
      .row {
        display: flex;
        gap: 24rpx;
      }
      .star {
        width: 76rpx;
        height: 56rpx;
        border-radius: 26rpx;
        background: rgba(255, 255, 255, 1);
        border: 2rpx solid rgba(231, 236, 238, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        image {
          width: 27.18rpx;
          height: 26rpx;
        }
      }
      .play {
        width: 76rpx;
        height: 56rpx;
        border-radius: 26rpx;
        background: linear-gradient(
          180deg,
          rgba(211, 248, 79, 1) 0%,
          rgba(167, 238, 39, 1) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        image {
          width: 19.09rpx;
          height: 26rpx;
        }
      }
    }
  }
}
</style>