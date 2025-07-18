<template>
  <view class="container">
    <uni-nav-bar
      :fixed="true"
      :status-bar="true"
      :shadow="false"
      background-color="rgba(255, 255, 255, 0)"
      color="#333"
      :border="false"
      style="position: relative"
      leftWidth="0"
    >
      <view class="nav-right">
        <uni-icons
          type="left"
          size="22"
          class="nav-icon"
          @click="goBack"
        ></uni-icons>
        <uni-icons
          type="home"
          size="22"
          class="nav-icon"
          @click="goHome"
        ></uni-icons>
      </view>
    </uni-nav-bar>
    <image class="global-title" src="../../static/global-title.png"></image>

    <!-- 用户分享指引图片 -->
    <image
      v-if="isGuideVisible"
      src="../../static/enrollment/guide.png"
      mode="scaleToFill"
      class="guide-image"
    />
    <!-- 背景图 -->
    <image
      src="https://mang.5gradio.com.cn/static/enrollment/bg.jpg"
      alt=""
      class="bg-img"
      aspectFill
    />
    <!-- 宣言 -->
    <view class="slogon">
      <enroll-font class="slogon-text" ref="enrollFontRef" />
    </view>

    <!-- 用户图片上传区域 -->
    <view class="upload-area">
      <view class="stick-container">
        <image
          src="https://mang.5gradio.com.cn/static/enrollment/photo.png"
          mode="scaleToFill"
          class="upload-bg"
        />
        <image
          :key="currentStickerIndex"
          :src="currentStickerSrc"
          mode="aspectFit"
          class="uopload-stick"
        />

        <view class="school">
          <text class="verify-time">电子认证时间: {{ currentTime }}</text>
          <text class="school-name">{{ schoolName }}</text>
        </view>
      </view>
      <view class="tips" @tap="chooseImage" v-if="!userImage">
        点击上传照片</view
      >

      <!-- 用户图片显示区域 -->
      <view class="image-container">
        <view
          class="image-wrapper"
          :style="{
            transform: `translate(${imageX}px, ${imageY}px) scale(${imageScale})`,
          }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <image :src="userImage" mode="aspectFill" class="user-image"></image>
        </view>
      </view>
    </view>
    <!-- 贴画切换控制区域 -->
    <view
      class="stick-control"
      @touchstart="onStickerTouchStart"
      @touchmove="onStickerTouchMove"
      @touchend="onStickerTouchEnd"
    >
      <!-- tip区域 -->
      <view class="tip-stick" v-if="isTipVisible">
        <image
          src="../../static/enrollment/tip-stick.png"
          mode="scaleToFill"
          class="tip-stick-image"
        />
      </view>
    </view>

    <!-- 立即生成的图标 -->
    <view class="download-btn" @tap="handleLongPress">
      <image
        src="../../static/enrollment/download.png"
        mode="aspectToFill"
        class="download-icon"
      />
    </view>
    <!-- 重新上传照片的功能按钮 -->
    <view class="reupload-btn" @tap="reupload">
      <image
        src="../../static/enrollment/reupload.png"
        mode="aspectToFill"
        class="reupload-icon"
      />
    </view>
    <!-- 临时测试 -->
    <!-- <button
      @tap="measureFrame"
      style="
        position: fixed;
        top: 50px;
        right: 20px;
        z-index: 9999;
        background: red;
        color: white;
      "
    >
      测量相框
    </button> -->

    <!-- 隐藏的canvas -->
    <canvas canvas-id="downloadCanvas" class="hidden-canvas"></canvas>
  </view>
</template>

<script setup>
  import { ref, onMounted, computed, onUnmounted } from 'vue'
  import { onShow, onHide } from '@dcloudio/uni-app'
  import EnrollFont from '@/components/enrollFont/enrollFont.vue'
  import { baseUrl } from '@/utils/config'
  import request from '@/utils/request.js'
  import { useAudioPlayerStore } from '../../stores/audioPlayer'

  const localQrCodePath = ref('')

  // 下载二维码图片的函数
  const downloadQrCode = () => {
    return new Promise((resolve, reject) => {
      uni.downloadFile({
        url: 'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E6%A0%A1%E5%9B%AD%E6%B4%BB%E5%8A%A8.png',
        success: (res) => {
          if (res.statusCode === 200) {
            localQrCodePath.value = res.tempFilePath
            console.log('二维码下载成功:', res.tempFilePath)
            resolve(res.tempFilePath)
          } else {
            console.error('二维码下载失败:', res.statusCode)
            reject(new Error('下载失败'))
          }
        },
        fail: (error) => {
          console.error('二维码下载失败:', error)
          reject(error)
        },
      })
    })
  }

  // 引入音频播放器状态管理
  const audioPlayerStore = useAudioPlayerStore()
  let enrollAudio
  const isTransitioning = ref(false)
  const isGuideVisible = ref(false)
  //控制tip-stick的显示
  const isTipVisible = ref(true)
  // 添加组件引用和slogan图片地址
  const enrollFontRef = ref(null)
  const slogonImageUrl = ref('')
  // 跳转上一页的方法
  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      goHome()
    }
  }
  //页面显示的时候
  onShow(async () => {
    // isGuideVisible.value = true
    await downloadQrCode()
    console.log('Enrollment2025 页面显示')
    // 如果音频播放器正在播放，暂停它
    audioPlayerStore.stopAllAudio()
    // 延迟1.5秒后创建新的音频播放器并且初始化
    setTimeout(() => {
      enrollAudio = uni.createInnerAudioContext()
      enrollAudio.autoplay = true
      enrollAudio.src =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/bg_music/Glow%20Loop.mp3'
      enrollAudio.loop = true
      enrollAudio.play()
      enrollAudio.onPlay(() => {
        console.log('音频开始播放')
      })
      console.log('音频已开始播放', enrollAudio)
    }, 1500)
  })

  // 页面隐藏时
  onHide(() => {
    console.log('Enrollment2025 页面隐藏')
    // 停止音频播放
    if (enrollAudio) {
      enrollAudio.pause()
      enrollAudio.destroy()
      enrollAudio = null
      console.log('音频已停止播放', enrollAudio)
    }
  })
  // 页面卸载时
  onUnmounted(() => {
    console.log('Enrollment2025 页面卸载')
    // 停止音频播放
    if (enrollAudio) {
      enrollAudio.pause()
      enrollAudio.destroy()
      enrollAudio = null
      console.log('音频已停止播放', enrollAudio)
    }
  })
  //返回首页的方法
  const goHome = () => {
    uni.reLaunch({
      url: '/pages/index/index',
    })
  }
  // 获取slogan图片地址的方法
  const getSlogonImageUrl = () => {
    if (enrollFontRef.value) {
      return enrollFontRef.value.getCurrentSloganImage()
    }
    return ''
  }
  // 装饰图片位置常量
  const DECORATION_POSITION = {
    x: 0,
    y: 190,
    width: 745,
    height: 800,
  }

  // 相框位置常量（用户照片区域，保持不变）
  const FRAME_POSITION = {
    x: 115,
    y: 260,
    width: 540,
    height: 610,
  }

  // 贴纸相关数据
  const currentStickerIndex = ref(0)
  const stickerList = ref([
    'https://mang.5gradio.com.cn/static/enrollment/stick-1.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-2.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-3.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-4.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-5.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-6.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-7.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-8.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-9.png',
    'https://mang.5gradio.com.cn/static/enrollment/stick-10.png',
  ])

  // 计算当前贴纸路径
  const currentStickerSrc = computed(() => {
    return `${stickerList.value[currentStickerIndex.value]}`
  })
  // const currentStickerSrc = computed(() => {
  //   return `../../static/enrollment/decoration/decoration-${[
  //     currentStickerIndex.value + 1,
  //   ]}.png`
  // })

  // 贴纸滑动相关数据
  const stickerTouchData = ref({
    startX: 0,
    startY: 0,
    touching: false,
    threshold: 50, // 滑动阈值
  })

  // 响应式数据
  const qrCodeImage = ref(
    'https://mang.5gradio.com.cn/static/enrollment/qrcode.jpg'
  )
  const userCount = ref(8888)
  const userImage = ref('')
  const imageX = ref(0)
  const imageY = ref(0)
  const imageWidth = ref(200)
  const imageHeight = ref(200)
  const imageScale = ref(1)
  const schoolName = ref('xx大学')
  const currentTime = ref('')
  const ableDownload = ref(true)
  // 计算图片的边界框
  const frameBounds = ref({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  // 相框在屏幕上的位置信息
  const frameScreenRect = ref({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  // 文字位置常量
  const TEXT_POSITION = {
    x: 445,
    y: 1210,
  }

  // 学校位置常量
  const SCHOOL_POSITION = {
    x: 350,
    y: 840,
  }
  // 时间位置常量
  const TIME_POSITION = {
    x: 350,
    y: 800,
  }

  // 触摸相关数据
  const touchData = ref({
    startX: 0,
    startY: 0,
    startDistance: 0,
    startScale: 1,
    startImageX: 0,
    startImageY: 0,
    touching: false,
    multiTouch: false,
    lastTouchTime: 0,
  })

  // 贴纸滑动事件处理
  const onStickerTouchStart = (e) => {
    //tip-stick 不展示
    isTipVisible.value = false

    // 如果有用户图片，让图片的触摸事件优先
    if (
      userImage.value &&
      e.target.className &&
      e.target.className.includes('image-wrapper')
    ) {
      return
    }

    stickerTouchData.value.touching = true
    stickerTouchData.value.startX = e.touches[0].clientX
    stickerTouchData.value.startY = e.touches[0].clientY
  }

  const onStickerTouchMove = (e) => {
    if (!stickerTouchData.value.touching) return

    // 如果有用户图片且正在操作图片，不处理贴纸滑动
    if (userImage.value && touchData.value.touching) {
      return
    }

    e.preventDefault()
  }

  const onStickerTouchEnd = (e) => {
    if (!stickerTouchData.value.touching) return

    // 如果有用户图片且正在操作图片，不处理贴纸滑动
    if (userImage.value && touchData.value.touching) {
      stickerTouchData.value.touching = false
      return
    }

    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = endX - stickerTouchData.value.startX
    const deltaY = endY - stickerTouchData.value.startY

    // 确保是水平滑动（水平距离大于垂直距离）
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > stickerTouchData.value.threshold
    ) {
      if (deltaX > 0) {
        // 向右滑动，切换到上一个贴纸
        switchSticker('prev')
      } else {
        // 向左滑动，切换到下一个贴纸
        switchSticker('next')
      }
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      // 如果移动距离很小，认为是点击事件，执行选择图片
    }

    stickerTouchData.value.touching = false
  }

  // 切换贴纸函数
  // 修改切换贴纸函数
  const switchSticker = (direction) => {
    // 开始动画
    isTransitioning.value = true

    const maxIndex = stickerList.value.length - 1

    if (direction === 'next') {
      currentStickerIndex.value =
        currentStickerIndex.value >= maxIndex
          ? 0
          : currentStickerIndex.value + 1
    } else if (direction === 'prev') {
      currentStickerIndex.value =
        currentStickerIndex.value <= 0
          ? maxIndex
          : currentStickerIndex.value - 1
    }
  }

  // 生命周期
  onShow(async () => {
    console.log('Enrollment2025 页面已加载')
    //当前用户的学校和报道位置
    const userInfo = await request(`${baseUrl}/user/user_info`, 'GET')
    if (userInfo.code !== 0) {
      uni.showToast({
        title: '获取用户信息失败',
        icon: 'none',
      })
      return
    } else {
      // schoolName.value = userInfo.data.school_name
      if (!userInfo.data.school_name || schoolName.value === '公开版') {
        schoolName.value = ''
      } else {
        schoolName.value = userInfo.data.school_name
      }
    }
    console.log('当前用户信息:', userInfo)
    const rest = await request(`${baseUrl}/user/count_new_term_activity`, 'get')
    if (rest.code === 0) {
      userCount.value = rest.data.count
      console.log('当前参与人数:', userCount.value)
    } else {
      uni.showToast({
        title: '获取参与人数失败',
        icon: 'none',
      })
    }
    // 获取当前时间
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')

    currentTime.value = `${year}年${month}月${day}日 ${hour}:${minute}`
    getFrameBounds()
  })

  // 获取准确的边界信息
  const getFrameBounds = () => {
    const query = uni.createSelectorQuery()

    // 获取上传区域的尺寸
    query
      .select('.upload-area')
      .boundingClientRect((uploadRect) => {
        if (uploadRect) {
          // 相框是70%的宽和68%的高，居中显示
          frameBounds.value = {
            width: uploadRect.width,
            height: uploadRect.height,
            frameWidth: uploadRect.width * 0.76,
            frameHeight: uploadRect.height * 0.68,
          }

          // 保存屏幕位置信息
          frameScreenRect.value = {
            left: uploadRect.left,
            top: uploadRect.top,
            width: uploadRect.width,
            height: uploadRect.height,
          }
        }
      })
      .exec()
  }

  // 获取相框在屏幕上的实际位置
  const getFrameScreenPosition = () => {
    return new Promise((resolve) => {
      const query = uni.createSelectorQuery()
      query
        .select('.upload-area')
        .boundingClientRect((rect) => {
          if (rect) {
            frameScreenRect.value = rect
            resolve(rect)
          }
        })
        .exec()
    })
  }

  // 修改触摸移动逻辑中的缩放部分
  const onTouchMove = (e) => {
    //操作过程不能下载
    ableDownload.value = false

    if (!touchData.value.touching) return

    e.preventDefault()
    const touches = e.touches

    if (touches.length === 1 && !touchData.value.multiTouch) {
      // 单指拖拽
      const deltaX = touches[0].clientX - touchData.value.startX
      const deltaY = touches[0].clientY - touchData.value.startY

      let newX = touchData.value.startImageX + deltaX
      let newY = touchData.value.startImageY + deltaY

      // 应用边界限制
      const constrainedPos = constrainToFrame(newX, newY, imageScale.value)
      imageX.value = constrainedPos.x
      imageY.value = constrainedPos.y
    } else if (touches.length === 2) {
      // 双指缩放
      if (!touchData.value.multiTouch) {
        // 刚开始双指操作，重新记录初始状态
        touchData.value.multiTouch = true
        touchData.value.startDistance = getDistance(touches[0], touches[1])
        touchData.value.startScale = imageScale.value
        touchData.value.startImageX = imageX.value
        touchData.value.startImageY = imageY.value
        return
      }

      const currentDistance = getDistance(touches[0], touches[1])
      const scaleRatio = currentDistance / touchData.value.startDistance
      let newScale = touchData.value.startScale * scaleRatio

      // 限制缩放范围 - 使用动态计算的最大缩放
      const maxScale = getMaxScale()
      newScale = Math.max(0.5, Math.min(maxScale, newScale))

      // 计算缩放中心点（两个手指的中心）
      const centerX = (touches[0].clientX + touches[1].clientX) / 2
      const centerY = (touches[0].clientY + touches[1].clientY) / 2

      // 计算缩放中心相对于相框中心的位置
      const frameCenterX =
        frameScreenRect.value.left + frameScreenRect.value.width / 2
      const frameCenterY =
        frameScreenRect.value.top + frameScreenRect.value.height / 2

      const relativeCenterX = centerX - frameCenterX
      const relativeCenterY = centerY - frameCenterY

      // 计算缩放引起的位置偏移
      const scaleDelta = newScale / touchData.value.startScale
      const currentImageX = touchData.value.startImageX
      const currentImageY = touchData.value.startImageY

      // 基于缩放中心计算新位置
      let newX =
        relativeCenterX + (currentImageX - relativeCenterX) * scaleDelta
      let newY =
        relativeCenterY + (currentImageY - relativeCenterY) * scaleDelta

      imageScale.value = newScale

      // 缩放后重新约束位置
      const constrainedPos = constrainToFrame(newX, newY, newScale)
      imageX.value = constrainedPos.x
      imageY.value = constrainedPos.y
    }
  }

  // 修改约束函数，增加更精确的边界计算
  const constrainToFrame = (x, y, scale) => {
    if (!frameBounds.value.width) return { x, y }

    // 使用总缩放比例
    const totalScale = initialScale.value * scale
    const scaledWidth = imageWidth.value * totalScale
    const scaledHeight = imageHeight.value * totalScale

    // 其余计算保持不变...
    const clipTop = 0.13
    const clipRight = 0.125
    const clipBottom = 0.15
    const clipLeft = 0.105

    const containerWidth = frameBounds.value.width
    const containerHeight = frameBounds.value.height

    const frameWidth = containerWidth * (1 - clipLeft - clipRight)
    const frameHeight = containerHeight * (1 - clipTop - clipBottom)

    const frameCenterOffsetX = (containerWidth * (clipLeft - clipRight)) / 2
    const frameCenterOffsetY = (containerHeight * (clipTop - clipBottom)) / 2

    const frameLeft = frameCenterOffsetX - frameWidth / 2
    const frameRight = frameCenterOffsetX + frameWidth / 2
    const frameTop = frameCenterOffsetY - frameHeight / 2
    const frameBottom = frameCenterOffsetY + frameHeight / 2

    const imgLeft = x - scaledWidth / 2
    const imgRight = x + scaledWidth / 2
    const imgTop = y - scaledHeight / 2
    const imgBottom = y + scaledHeight / 2

    let constrainedX = x
    let constrainedY = y

    // 约束逻辑保持不变...
    if (scaledWidth <= frameWidth) {
      if (imgLeft < frameLeft) {
        constrainedX = frameLeft + scaledWidth / 2
      } else if (imgRight > frameRight) {
        constrainedX = frameRight - scaledWidth / 2
      }
    } else {
      if (imgLeft > frameLeft) {
        constrainedX = frameLeft + scaledWidth / 2
      } else if (imgRight < frameRight) {
        constrainedX = frameRight - scaledWidth / 2
      }
    }

    if (scaledHeight <= frameHeight) {
      if (imgTop < frameTop) {
        constrainedY = frameTop + scaledHeight / 2
      } else if (imgBottom > frameBottom) {
        constrainedY = frameBottom - scaledHeight / 2
      }
    } else {
      if (imgTop > frameTop) {
        constrainedY = frameTop + scaledHeight / 2
      } else if (imgBottom < frameBottom) {
        constrainedY = frameBottom - scaledHeight / 2
      }
    }

    return { x: constrainedX, y: constrainedY }
  }

  // 修改缩放约束，防止缩放时超出相框
  const getMaxScale = () => {
    if (!frameBounds.value.width) return 2.5

    const frameWidth = frameBounds.value.frameWidth
    const frameHeight = frameBounds.value.frameHeight

    // 考虑初始缩放的最大缩放计算
    const maxScaleX = (frameWidth * 2) / (imageWidth.value * initialScale.value)
    const maxScaleY =
      (frameHeight * 2) / (imageHeight.value * initialScale.value)

    const maxScale = Math.max(maxScaleX, maxScaleY)
    return Math.max(1.5, Math.min(3, maxScale))
  }
  // 修改选择图片函数
  // 添加新的响应式数据
  const initialScale = ref(1) // 记录初始的 aspectFill 缩放
  const chooseImage = () => {
    //鉴权登录
    if (!uni.getStorageSync('token')) {
      uni.showModal({
        title: '',
        content: '登录后体验完整功能',
        success: async (res) => {
          if (res.confirm) {
            console.log('用户点击确定')
            // 1秒钟之后跳转登录
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/login',
              })
            }, 300)
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        },
      })
      return
    }
    if (userImage.value) {
      console.log('已经选择过图片，无法再次选择', userImage.value)
      return
    }
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        userImage.value = res.tempFilePaths[0]

        // 获取图片真实尺寸
        uni.getImageInfo({
          src: res.tempFilePaths[0],
          success: (imageInfo) => {
            imageWidth.value = imageInfo.width
            imageHeight.value = imageInfo.height

            // 计算初始缩放比例（aspectFill 的效果）
            setTimeout(() => {
              calculateInitialScale(imageInfo.width, imageInfo.height)
            }, 200) // 等待DOM更新

            // 重置图片位置和用户缩放
            imageX.value = 0
            imageY.value = 0
            imageScale.value = 1 // 这里是用户的缩放，不包含初始缩放

            // 获取边界信息
            setTimeout(() => {
              getFrameBounds()
            }, 100)
          },
        })
      },
      fail: (error) => {
        uni.showToast({
          title: '选择图片失败',
          icon: 'none',
        })
      },
    })
  }
  // 计算初始缩放比例的函数
  const calculateInitialScale = (imgWidth, imgHeight) => {
    const query = uni.createSelectorQuery()
    query
      .select('.user-image')
      .boundingClientRect((rect) => {
        if (rect) {
          // 容器尺寸（.image-wrapper 的尺寸）
          const containerWidth = rect.width
          const containerHeight = rect.height

          // 计算 aspectFill 的缩放比例
          const scaleX = containerWidth / imgWidth
          const scaleY = containerHeight / imgHeight

          // aspectFill 使用较大的缩放比例（确保填满容器）
          initialScale.value = Math.max(scaleX, scaleY)

          console.log('初始缩放计算:', {
            containerSize: [containerWidth, containerHeight],
            imageSize: [imgWidth, imgHeight],
            initialScale: initialScale.value,
          })
        }
      })
      .exec()
  }

  // 计算两点间距离
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 修改触摸开始事件
  const onTouchStart = (e) => {
    // 如果有用户图片，优先处理用户图片的触摸事件
    ableDownload.value = false // 禁止下载，直到触摸结束

    const touches = e.touches
    touchData.value.touching = true
    touchData.value.lastTouchTime = Date.now()

    // 更新相框位置信息
    getFrameScreenPosition()

    if (touches.length === 1) {
      // 单指拖拽
      touchData.value.multiTouch = false
      touchData.value.startX = touches[0].clientX
      touchData.value.startY = touches[0].clientY
      touchData.value.startImageX = imageX.value
      touchData.value.startImageY = imageY.value
    } else if (touches.length === 2) {
      // 双指缩放 - 在touchmove中处理初始化
      touchData.value.multiTouch = false // 先设为false，在touchmove中检测到两指时再设为true
    }
  }

  // 触摸结束
  const onTouchEnd = (e) => {
    // 如果所有手指都离开了屏幕
    //可以下载
    ableDownload.value = true
    if (e.touches.length === 0) {
      touchData.value.touching = false
      touchData.value.multiTouch = false
    } else if (e.touches.length === 1 && touchData.value.multiTouch) {
      // 从双指变为单指，重新初始化单指拖拽
      touchData.value.multiTouch = false
      touchData.value.startX = e.touches[0].clientX
      touchData.value.startY = e.touches[0].clientY
      touchData.value.startImageX = imageX.value
      touchData.value.startImageY = imageY.value
    }
  }

  // 计算图片在canvas中的位置
  const calculateImagePosition = () => {
    if (!frameBounds.value.width || !userImage.value) {
      return null
    }

    // 获取实际的相框区域
    const clipTop = 0.15
    const clipRight = 0.135
    const clipBottom = 0.17
    const clipLeft = 0.125

    const screenContainerWidth = frameBounds.value.width
    const screenContainerHeight = frameBounds.value.height

    const screenFrameWidth = screenContainerWidth * (1 - clipLeft - clipRight)
    const screenFrameHeight = screenContainerHeight * (1 - clipTop - clipBottom)

    const canvasFrameX = FRAME_POSITION.x
    const canvasFrameY = FRAME_POSITION.y
    const canvasFrameWidth = FRAME_POSITION.width
    const canvasFrameHeight = FRAME_POSITION.height

    const scaleX = canvasFrameWidth / screenFrameWidth
    const scaleY = canvasFrameHeight / screenFrameHeight

    // 关键修改：计算总的缩放比例（初始缩放 × 用户缩放）
    const totalScale = initialScale.value * imageScale.value

    // 用户图片在屏幕上的实际尺寸
    const screenImageWidth = imageWidth.value * totalScale
    const screenImageHeight = imageHeight.value * totalScale

    // 转换为canvas尺寸
    const canvasImageWidth = screenImageWidth * scaleX
    const canvasImageHeight = screenImageHeight * scaleY

    // 位置偏移计算保持不变
    const screenOffsetX = imageX.value
    const screenOffsetY = imageY.value
    const canvasOffsetX = screenOffsetX * scaleX
    const canvasOffsetY = screenOffsetY * scaleY

    const canvasImageX =
      canvasFrameX + canvasFrameWidth / 2 + canvasOffsetX - canvasImageWidth / 2
    const canvasImageY =
      canvasFrameY +
      canvasFrameHeight / 2 +
      canvasOffsetY -
      canvasImageHeight / 2

    return {
      x: canvasImageX,
      y: canvasImageY,
      width: canvasImageWidth,
      height: canvasImageHeight,
    }
  }

  // 新的下载图片函数
  const downloadImage = () => {
    if (userImage.value === '') {
      uni.showToast({
        title: '请选择照片',
        icon: 'none',
      })
      return
    }
    if (!ableDownload.value) {
      return
    }
    // 获取当前的slogan图片地址
    const currentSlogonUrl = getSlogonImageUrl()
    const canvasWidth = 750
    const canvasHeight = 1270

    const ctx = uni.createCanvasContext('downloadCanvas')

    // 1. 绘制底图（背景、logo、slogan、二维码等）
    ctx.drawImage(
      '../../static/enrollment/base-bg.png',
      0,
      0,
      canvasWidth,
      canvasHeight
    )

    // 2. 绘制用户照片（在原来的相框位置）
    if (userImage.value) {
      const canvasImagePosition = calculateImagePosition()

      if (canvasImagePosition) {
        // 裁剪区域仍然使用原来的相框位置
        ctx.save()
        ctx.beginPath()
        ctx.rect(
          FRAME_POSITION.x, // 125
          FRAME_POSITION.y, // 275
          FRAME_POSITION.width, // 500
          FRAME_POSITION.height // 525
        )
        ctx.clip()

        // 绘制用户图片
        ctx.drawImage(
          userImage.value,
          canvasImagePosition.x,
          canvasImagePosition.y,
          canvasImagePosition.width,
          canvasImagePosition.height
        )

        ctx.restore()
      }
    }

    // 3. 绘制装饰图片（覆盖更大区域）
    const decorationIndex = currentStickerIndex.value + 1 // 因为decoration是从1开始的
    ctx.drawImage(
      `../../static/enrollment/decoration/decoration-${decorationIndex}.png`,
      DECORATION_POSITION.x, // 35
      DECORATION_POSITION.y, // 215
      DECORATION_POSITION.width, // 690
      DECORATION_POSITION.height // 735
    )
    // 3. 绘制slogan图片（新添加的部分）
    if (currentSlogonUrl) {
      ctx.drawImage(
        currentSlogonUrl,
        35, // x坐标
        50, // y坐标
        355, // 宽度
        120 // 高度
      )
    }
    // 5. 绘制二维码
    if (localQrCodePath.value) {
      const qrSize = 120 // 二维码大小
      ctx.drawImage(localQrCodePath.value, 45, 1040, qrSize, qrSize)
      console.log('绘制二维码:', localQrCodePath.value, 'at position: 75, 1075')
    } else {
      console.warn('二维码图片未下载，跳过绘制')
    }

    // 4. 绘制用户数量文字
    ctx.setTextAlign('left')
    ctx.setTextBaseline('middle')

    const beforeText = '我是2025级第'
    const countValueText = userCount.value.toString()
    const afterText = '位签到新生'

    // 分别测量不同字体大小的文字宽度
    ctx.setFontSize(20)
    const beforeWidth = ctx.measureText(beforeText).width

    ctx.setFontSize(30)
    const countWidth = ctx.measureText(countValueText).width

    // 绘制前半部分（白色，字体20）
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(20)
    ctx.fillText(beforeText, TEXT_POSITION.x, TEXT_POSITION.y)

    // 绘制数字部分（绿色，字体30）
    ctx.setFillStyle('#cdf91d')
    ctx.setFontSize(30)
    ctx.fillText(countValueText, TEXT_POSITION.x + beforeWidth, TEXT_POSITION.y)

    // 绘制后半部分（白色，字体20）
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(20)
    ctx.fillText(
      afterText,
      TEXT_POSITION.x + beforeWidth + countWidth,
      TEXT_POSITION.y
    )

    // . 绘制时间文字
    ctx.save() // 保存当前状态
    ctx.translate(TIME_POSITION.x, TIME_POSITION.y) // 移动到文字位置
    ctx.rotate((5 * Math.PI) / 180) // 旋转5度（弧度 = 角度 * π / 180）
    ctx.setFillStyle('#aaa')
    ctx.setFontSize(16) // 设置字体大小
    ctx.setTextAlign('left') // 改为左对齐，因为给的是左上角坐标
    ctx.setTextBaseline('middle') // 设置文本基线为中间

    const currentTImeText = `电子认证时间：${currentTime.value}`
    ctx.fillText(currentTImeText, 0, 0)
    ctx.restore() // 恢复状态，避免影响后续绘制

    //  绘制学校文字（带5度旋转）
    ctx.save() // 保存当前状态
    ctx.translate(SCHOOL_POSITION.x, SCHOOL_POSITION.y) // 移动到文字位置
    ctx.rotate((5 * Math.PI) / 180) // 旋转5度（弧度 = 角度 * π / 180）
    ctx.setFillStyle('#8AE0E8')
    ctx.setFontSize(28)
    ctx.setTextAlign('left')
    ctx.setTextBaseline('middle')

    const schoolText = `${schoolName.value}`
    console.log('开始画学校了学校名称:', schoolText)
    ctx.fillText(schoolText, 0, 0) // 在原点绘制，因为已经translate了
    ctx.restore() // 恢复状态，避免影响后续绘制

    // 5. 执行绘制并保存
    ctx.draw(false, () => {
      uni.canvasToTempFilePath({
        canvasId: 'downloadCanvas',
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        destWidth: canvasWidth,
        destHeight: canvasHeight,
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.showToast({
                title: '保存成功',
                icon: 'success',
              })
              // 提示用户去做分享,同时展示指引，点击之后关闭指引图片
              isGuideVisible.value = true

              uni.showModal({
                title: '提示',
                content: '已保存到相册，快去分享给你的朋友吧！',
                showCancel: false,
                confirmText: '知道了',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    isGuideVisible.value = false // 关闭指引图片
                  }
                },
              })
            },
            fail: () => {
              uni.showToast({
                title: '保存失败，请检查相册权限',
                icon: 'none',
              })
            },
          })
        },
        fail: (error) => {
          console.error('生成图片失败:', error)
          uni.showToast({
            title: '生成图片失败',
            icon: 'none',
          })
        },
      })
    })
  }

  // 长按事件处理
  const handleLongPress = () => {
    //如果没有上传图片就提示上传图片
    if (!userImage.value) {
      uni.showToast({
        title: '请先上传照片',
        icon: 'none',
      })
      return
    }
    uni.showModal({
      title: '提示',
      content: '是否立即保存你的青春高光时刻？',
      success: (res) => {
        if (res.confirm) {
          downloadImage() // 使用新的downloadImage函数
          // 生成入学通知书发送请求给后端后端录入
          request(`${baseUrl}/user/update_new_term_activity`, 'POST', {})
            .then((response) => {
              if (response.code === 0) {
                console.log('入学通知书生成记录成功')
                // 订阅消息
                wx.requestSubscribeMessage({
                  tmplIds: ['HWBLfUmzWZB_UqhQ8gKd25fK67OyJfp2Iw8qQvLhp3s'], // 需要下发的订阅消息模板id数组
                  success(res) {
                    if (
                      res['HWBLfUmzWZB_UqhQ8gKd25fK67OyJfp2Iw8qQvLhp3s'] ===
                      'accept'
                    ) {
                      console.log('用户同意订阅', res)
                      // 将用户的 openid 发送给后端，以便后续发送服务通知
                      const openid =
                        res['HWBLfUmzWZB_UqhQ8gKd25fK67OyJfp2Iw8qQvLhp3s']
                      console.log('用户的 openid:', openid)
                      // 这里可以将 openid 保存到数据库或者直接发送给后端
                    } else {
                      console.log('用户拒绝订阅')
                    }
                  },
                  fail(err) {
                    console.error(err)
                  },
                })
              } else {
                console.error('入学通知书生成记录失败:', response.message)
              }
            })
            .catch((error) => {
              console.error('请求失败:', error)
            })
        }
      },
    })
  }

  // 重新上传照片的功能
  const reupload = () => {
    //  如果没有上传图片，直接选择图片
    if (!userImage.value) {
      chooseImage()
      return
    }

    uni.showModal({
      title: '提示',
      content: '是否重新上传照片？',
      success: (res) => {
        if (res.confirm) {
          userImage.value = '' // 清空当前图片
          imageX.value = 0 // 重置位置
          imageY.value = 0 // 重置位置
          imageScale.value = 1 // 重置缩放
          chooseImage() // 重新选择图片
        }
      },
    })
  }
</script>

<style lang="scss" scoped>
  @import './index.scss';

  .hidden-canvas {
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 750px;
    height: 1270px;
  }
</style>
