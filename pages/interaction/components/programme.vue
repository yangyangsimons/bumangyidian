<template>
  <div class="container">
    <div class="card">
      <view class="audio-player">
        <!-- 分类选择器 - 改为滑动式 -->
        <view class="category-selector">
          <view
            class="category-ruler-wrapper ruler-wrapper-unique"
            id="ruler-wrapper"
          >
            <image src="/static/ruler-bg.png" mode="scaleToFill" />
            <scroll-view
              class="category-ruler"
              scroll-x
              :scroll-left="scrollLeft"
              :scroll-with-animation="scrollWithAnimation"
              @scroll="onScroll"
              @scrollend="onScrollEnd"
            >
              <view
                class="ruler-content"
                :style="{ width: rulerWidth + 'rpx' }"
              >
                <view
                  v-for="(category, index) in rulerItems"
                  :key="index"
                  class="ruler-item"
                  :class="{
                    active: category.isActive,
                    valid: category.isValid,
                  }"
                  :style="{ left: index * ITEM_WIDTH + 'rpx' }"
                >
                  <text v-if="category.showText" class="ruler-text">
                    {{ category.text }}
                  </text>
                </view>
              </view>
            </scroll-view>

            <!-- 中心指示线 -->
            <view class="center-indicator">
              <view class="indicator-line"></view>
              <view class="indicator-arrow"></view>
            </view>
          </view>
        </view>

        <!-- 音频信息卡片 -->
        <view class="audio-card">
          <view class="audio-cover">
            <image
              class="cover-image"
              :src="currentCategoryCover"
              mode="aspectFill"
            />
          </view>

          <view class="audio-info">
            <text class="audio-title">{{ recommendInfo.title }}</text>
            <text class="audio-desc">{{ recommendInfo.desc }}</text>
            <text class="audio-time">{{ recommendInfo.effective_time }}</text>
          </view>
        </view>

        <!-- 控制按钮 -->
        <view class="control-buttons">
          <view class="row">
            <view class="control-btn" @click="toggleFavorite(recommendInfo.id)">
              <image
                class="btn-icon"
                :src="
                  recommendInfo.liked
                    ? '/static/star-filled.png'
                    : '/static/star.png'
                "
              />
            </view>

            <button class="control-btn" open-type="share">
              <image class="btn-icon" src="/static/share-cirle.png" />
            </button>
          </view>

          <view class="play-btn" @click="togglePlay(recommendInfo)">
            <image
              class="play-icon"
              :src="
                musicStore.isPlaying &&
                musicStore.currentSong &&
                musicStore.currentSong.id === recommendInfo.id
                  ? '/static/pause.png'
                  : '/static/triangle.png'
              "
            />
          </view>
        </view>
      </view>
    </div>
    <!-- 节目列表标题 -->
    <div class="list-title">
      <div>节目列表</div>
    </div>
    <!-- 可滚动的节目列表容器 -->
    <div class="list">
      <div class="item" v-for="item in list" :key="item.id">
        <div>
          <div class="title">{{ item.title }}</div>
          <div class="info">{{ item.desc }}</div>
        </div>
        <div class="row">
          <div class="star" @click="toggleFavorite(item.id)">
            <image :src="getLikeImageSrc(item)" mode="widthFix" />
          </div>
          <div class="play" @click="togglePlay(item)">
            <image
              :src="
                musicStore.isPlaying &&
                musicStore.currentSong &&
                musicStore.currentSong.id === item.id
                  ? '/static/pause.png'
                  : '/static/triangle.png'
              "
              mode="widthFix"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import {
    ref,
    computed,
    onUnmounted,
    getCurrentInstance,
    onMounted,
    nextTick,
    watch,
  } from 'vue'
  import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import { baseUrl } from '@/utils/config'
  import { useMusicStore } from '@/stores/music'
  import { checkTokenAndNavigate } from '@/utils/auth'

  const musicStore = useMusicStore()

  const togglePlay = (item) => {
    console.log('切换播放状态:', item)

    // 检查当前是否正在播放这首歌
    if (musicStore.currentSong && musicStore.currentSong.id === item.id) {
      // 如果是同一首歌，就切换播放/暂停状态
      musicStore.togglePlay()
    } else {
      // 如果是不同的歌，就播放新歌，传递当前分类信息
      const currentCategory = categories.value[activeCategory.value]
      musicStore.addAndPlaySong(item, true, currentCategory)
    }
  }
  const list = ref([])
  // 在 setup 顶部获取实例
  // 获取组件实例用于emit
  const { emit } = getCurrentInstance()

  // 响应式数据
  const categories = ref([])
  const activeCategory = ref(1) // 默认选中"知识类"
  const recommendInfo = ref({})
  const isFavorite = ref(false)
  const audioContext = ref(null)

  // 刻度尺相关常量和变量 - 统一使用rpx
  const ITEM_WIDTH = 145 // 每个刻度项的宽度(rpx) - 与CSS保持一致
  const scrollLeft = ref(0)
  const actualScrollLeft = ref(0)
  const centerOffset = ref(0) // 容器中心偏移量(rpx)
  const containerWidth = ref(0) // 容器宽度(rpx)
  const rulerWidth = ref(0)
  const isScrolling = ref(false)
  const scrollWithAnimation = ref(true)
  const isInitialized = ref(false)
  const isUserScrolling = ref(false) // 区分用户滚动还是程序滚动
  const scrollEndTimer = ref(null) // 滚动结束计时器

  // 根据收藏状态返回对应的图片地址
  const getLikeImageSrc = (item) => {
    return item.liked ? '/static/my/music-collect.png' : '/static/my/star.png'
  }

  // 获取当前激活分类的封面图片
  const currentCategoryCover = computed(() => {
    if (categories.value.length > 0 && categories.value[activeCategory.value]) {
      return (
        categories.value[activeCategory.value].cover_url ||
        '/static/recommend.png'
      )
    }
    return '/static/recommend.png'
  })

  // 生成刻度尺项目数组（两端添加空白滑块）
  const rulerItems = computed(() => {
    if (!categories.value.length || !containerWidth.value) return []

    // 计算需要在两端添加的空白项数量
    const emptyItemsCount = Math.ceil(centerOffset.value / ITEM_WIDTH)
    console.log(
      '空白项数量:',
      emptyItemsCount,
      'centerOffset:',
      centerOffset.value
    )
    const totalItems = categories.value.length + emptyItemsCount * 2

    return Array.from(Array(totalItems)).map((_, index) => {
      const categoryIndex = index - emptyItemsCount
      const isValidIndex =
        categoryIndex >= 0 && categoryIndex < categories.value.length

      const isActive = isValidIndex && categoryIndex === activeCategory.value

      return {
        originalIndex: categoryIndex,
        isValid: isValidIndex,
        isActive,
        showText: isValidIndex,
        text: isValidIndex ? categories.value[categoryIndex].name : '',
      }
    })
  })

  // 获取容器宽度 - 统一使用rpx
  const getContainerWidth = () => {
    return new Promise((resolve) => {
      uni.getSystemInfo({
        success: (res) => {
          const screenWidthRpx = 750 // 屏幕宽度固定为750rpx
          // 左右两侧各有64rpx padding，总共128rpx
          const totalPaddingRpx = 128
          const containerWidthValue = screenWidthRpx - totalPaddingRpx // 622rpx

          containerWidth.value = containerWidthValue
          centerOffset.value = containerWidthValue / 2 - ITEM_WIDTH / 2 // 311rpx

          console.log('屏幕宽度(rpx):', screenWidthRpx)
          console.log('总padding(rpx):', totalPaddingRpx)
          console.log('计算后的容器宽度(rpx):', containerWidthValue)
          console.log('中心偏移(rpx):', centerOffset.value)

          resolve(containerWidthValue)
        },
        fail: () => {
          // 默认值
          const screenWidthRpx = 750
          const totalPaddingRpx = 128
          const containerWidthValue = screenWidthRpx - totalPaddingRpx

          containerWidth.value = containerWidthValue
          centerOffset.value = containerWidthValue / 2

          console.log('使用默认宽度计算(rpx):', containerWidthValue)
          resolve(containerWidthValue)
        },
      })
    })
  }

  // 监听categories变化，初始化刻度尺
  watch(categories, () => {
    if (categories.value.length > 0) {
      nextTick(async () => {
        // 增加延时，确保DOM完全渲染
        await new Promise((resolve) => setTimeout(resolve, 500))
        await getContainerWidth()
        initRuler()
      })
    }
  })

  // 初始化刻度尺
  const initRuler = () => {
    if (!containerWidth.value) {
      console.error('容器宽度未获取到')
      return
    }

    const emptyItemsCount = Math.ceil(centerOffset.value / ITEM_WIDTH)

    console.log('初始化参数:', {
      containerWidth: containerWidth.value,
      centerOffset: centerOffset.value,
      emptyItemsCount,
      activeCategory: activeCategory.value,
      ITEM_WIDTH,
    })

    // 计算总宽度（分类数据 + 两端空白项）- 使用rpx
    rulerWidth.value =
      (categories.value.length + emptyItemsCount * 2) * ITEM_WIDTH

    console.log('计算后的rulerWidth(rpx):', rulerWidth.value)

    // 设置初始位置到对应的分类位置
    scrollToCategoryIndex(activeCategory.value, false)

    setTimeout(() => {
      scrollWithAnimation.value = true
      isInitialized.value = true
      console.log('初始化完成')
    }, 50)
  }

  // rpx转px的函数
  const rpxToPx = (rpx) => {
    return new Promise((resolve) => {
      uni.getSystemInfo({
        success: (res) => {
          const px = (rpx * res.windowWidth) / 750
          resolve(px)
        },
        fail: () => {
          // 默认按375px屏幕计算
          const px = (rpx * 375) / 750
          resolve(px)
        },
      })
    })
  }

  // 滚动到指定分类索引
  const scrollToCategoryIndex = async (categoryIndex, withAnimation = true) => {
    if (!containerWidth.value) return

    const emptyItemsCount = Math.ceil(centerOffset.value / ITEM_WIDTH)
    const targetPositionRpx =
      (emptyItemsCount + categoryIndex) * ITEM_WIDTH - centerOffset.value

    // scroll-view的scroll-left需要px值
    const targetPositionPx = await rpxToPx(targetPositionRpx)

    console.log('滚动到分类:', {
      categoryIndex,
      emptyItemsCount,
      targetPositionRpx,
      targetPositionPx,
      withAnimation,
    })

    if (withAnimation) {
      scrollWithAnimation.value = true
    } else {
      scrollWithAnimation.value = false
    }

    scrollLeft.value = targetPositionPx
    actualScrollLeft.value = targetPositionPx
  }

  // px转rpx的函数
  const pxToRpx = (px) => {
    return new Promise((resolve) => {
      uni.getSystemInfo({
        success: (res) => {
          const rpx = (px * 750) / res.windowWidth
          resolve(rpx)
        },
        fail: () => {
          // 默认按375px屏幕计算
          const rpx = (px * 750) / 375
          resolve(rpx)
        },
      })
    })
  }

  // 滚动事件处理
  const onScroll = async (e) => {
    actualScrollLeft.value = e.detail.scrollLeft
    isUserScrolling.value = true

    if (!isInitialized.value || !containerWidth.value) return

    // 清除之前的计时器
    if (scrollEndTimer.value) {
      clearTimeout(scrollEndTimer.value)
    }

    // 将px转换为rpx进行计算
    const scrollLeftRpx = await pxToRpx(actualScrollLeft.value)
    const centerPositionRpx = scrollLeftRpx + centerOffset.value
    const currentItemIndex = Math.round(centerPositionRpx / ITEM_WIDTH)

    // 找到对应的分类项
    const currentItem = rulerItems.value[currentItemIndex]
    if (
      currentItem &&
      currentItem.isValid &&
      currentItem.originalIndex !== activeCategory.value
    ) {
      console.log('滚动中切换分类到:', currentItem.originalIndex)
      activeCategory.value = currentItem.originalIndex
      // 切换分类时加载对应的节目列表
      loadProgramList(currentItem.originalIndex)
      emit('categoryChange', currentItem.originalIndex)
    }

    // 设置一个计时器，在滚动停止后触发居中
    scrollEndTimer.value = setTimeout(() => {
      if (isUserScrolling.value) {
        console.log('滚动停止，触发自动居中')
        centerActiveCategory()
      }
    }, 100) // 100ms 后如果没有新的滚动事件就认为滚动结束
  }

  // 滚动结束事件处理 - 简化
  const onScrollEnd = () => {
    console.log('onScrollEnd 触发')
    setTimeout(() => {
      isScrolling.value = false
      if (isUserScrolling.value) {
        console.log('scrollend 事件触发自动居中')
        centerActiveCategory()
      }
      isUserScrolling.value = false
    }, 50)
  }

  // 让当前激活的分类居中
  const centerActiveCategory = () => {
    if (!isInitialized.value || !containerWidth.value) {
      console.log('未初始化，跳过居中')
      return
    }

    console.log('执行自动居中，分类:', activeCategory.value)

    // 防止用户滚动标记影响程序滚动
    isUserScrolling.value = false

    // 延时执行，确保滚动动画完成
    setTimeout(() => {
      scrollToCategoryIndex(activeCategory.value, true)
    }, 50)
  }

  // 加载节目列表的方法
  const loadProgramList = async (categoryIndex = null) => {
    try {
      // 如果没有传入分类索引，使用当前激活的分类
      const targetCategoryIndex =
        categoryIndex !== null ? categoryIndex : activeCategory.value

      // 获取对应分类名称
      const categoryName = categories.value[targetCategoryIndex]?.name

      if (!categoryName) {
        console.error('分类不存在')
        return
      }

      console.log(categoryName, targetCategoryIndex, '<category>')
      // 调用API获取指定分类下的节目数据
      const response = await request(
        `${baseUrl}/school_music/list?category=${categoryName}`,
        'GET'
      )
      console.log('节目数据:', response)

      if (response.code === 0 && response.data && response.data.length > 0) {
        list.value = response.data
        //选择第一个作为推荐
        recommendInfo.value = { ...response.data[0] }
      }
    } catch (error) {
      console.error('获取节目列表失败:', error)
    }
  }

  // 生命周期钩子
  onMounted(async () => {
    try {
      //获取所有分类
      const responseCategories = await request(
        `${baseUrl}/school_music/categories`,
        'GET'
      )
      console.log('节目组件加载', responseCategories)
      if (responseCategories.code === 0 && responseCategories.data) {
        categories.value = responseCategories.data
      }
      console.log('categories', categories.value)

      //获取分类下面的节目列表
      await loadProgramList()
      //如果没有歌曲的话，就把第一个歌曲设置进去（但不自动播放）
      if (
        musicStore.playlist.length <= 0 &&
        list.value.length > 0 &&
        list.value[0]
      ) {
        console.log(list.value[0])
        const currentCategory = categories.value[activeCategory.value]
        musicStore.setPlaylistWithoutPlay([list.value[0]], 0, currentCategory)
      }
    } catch (error) {
      console.error('初始化数据失败:', error)
    }
  })

  const toggleFavorite = async (id) => {
    //先判断是不是登录了
    checkTokenAndNavigate(async (token) => {
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
    })
  }

  const shareAudio = (recommendInfo) => {
    console.log('分享音频:', recommendInfo)
    // 分享功能
    uni.share({
      provider: 'weixin',
      scene: 'WXSceneSession',
      type: 1,
      title: recommendInfo.title,
      summary: recommendInfo.desc,
      href: 'http://uniapp.dcloud.io/',
      imageUrl: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png',
      success: function (res) {
        console.log('分享成功', res)
      },
    })
  }

  // 组件卸载时销毁音频
  onUnmounted(() => {
    console.log('组件卸载,节目组件写在')
    if (audioContext.value) {
      audioContext.value.destroy()
    }
    // 清除计时器
    if (scrollEndTimer.value) {
      clearTimeout(scrollEndTimer.value)
    }
  })
  onShareAppMessage(() => {
    console.log('onShareAppMessage......')
    return {
      title: `不芒一点，陪你世界加一点`,
      imageUrl:
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com:443/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E5%88%86%E4%BA%AB%E5%9B%BE.png',
      path: '/pages/interaction/interaction',
    }
  })
  onShareTimeline(() => {
    console.log('onShareTimeline......')
    return {
      title: `不芒一点，陪你世界加一点`,
    }
  })
</script>

<style scoped lang="scss">
  // 这里可以添加其他脚本逻辑
  @import './index.scss';

  /* 新增的刻度尺样式 */
  .category-ruler-wrapper {
    position: relative;
    height: 240rpx; // 统一使用rpx
    overflow: hidden;
    image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .category-ruler {
    height: 100%;
    width: 100%;
    position: relative;
  }

  .ruler-content {
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ruler-item {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    width: 145rpx; // 与ITEM_WIDTH保持一致
    height: 100%;
    display: flex;
    padding: 0 20rpx;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .ruler-text {
    font-size: 28rpx;
    color: rgba(152, 153, 153, 1);
    text-align: center;
    line-height: 1;
    transform: scale(0.9);
    font-weight: 400;
  }

  .ruler-item.active .ruler-text {
    font-size: 32rpx;
    font-weight: 500;
    color: rgba(16, 18, 19, 1);
    transform: scale(1);
  }

  .center-indicator {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .indicator-line {
    width: 8rpx;
    height: 80%;
    background: linear-gradient(
      180deg,
      rgba(255, 52, 52, 1) 0%,
      rgba(255, 52, 52, 0) 48.77%,
      rgba(255, 52, 52, 0) 61.2%,
      rgba(255, 52, 52, 1) 100%
    );
  }
  .indicator-arrow {
    width: 0;
    height: 0;
    border-left: 15rpx solid transparent;
    border-right: 15rpx solid transparent;
    border-bottom: 20rpx solid rgba(255, 62, 62, 1);
    margin-top: 10rpx;
    border-radius: 2rpx;
  }
</style>
