<template>
  <view class="container" @longpress="handleLongPress">
    <image class="global-title" src="../../static/global-title.png"></image>
    <!-- 背景图 -->
    <image
      src="../../static/enrollment/bg.jpg"
      alt=""
      class="bg-img"
      aspectFill
    />
    <!-- 宣言 -->
    <view class="slogon">
      <enroll-font class="slogon-text" />
    </view>
    <!-- 二维码 -->
    <div class="qrcode-container">
      <image class="qrcode" :src="qrCodeImage" mode="aspectFit"></image>
      <text class="qrcode-text">扫一扫生成入学通知书</text>
    </div>

    <!-- 用户图片上传区域 -->
    <view class="upload-area" @tap="chooseImage">
      <view class="stick-container">
        <image
          src="../../static/enrollment/photo.png"
          mode="scaleToFill"
          class="upload-bg"
        />
        <image
          src="../../static/enrollment/stick.png"
          mode="aspectFit"
          class="uopload-stick"
        />
      </view>

      <!-- 用户图片显示区域 -->
      <view class="image-container" v-if="userImage">
        <view
          class="image-wrapper"
          :style="{
            transform: `translate(${imageX}px, ${imageY}px) scale(${imageScale})`,
            width: imageWidth + 'px',
            height: imageHeight + 'px',
          }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <image :src="userImage" mode="aspectFill" class="user-image"></image>
        </view>
      </view>
    </view>

    <!-- 注册用户数文字 -->
    <view class="count-container">
      <image
        src="../../static/enrollment/count-bg.png"
        mode="aspectFill"
        class="count-bg"
      />
      <text class="user-count-text"
        >我是第<text class="number">{{ userCount }}</text
        >位签到的新生</text
      >
    </view>

    <!-- 隐藏的canvas -->
    <canvas canvas-id="downloadCanvas" class="hidden-canvas"></canvas>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import EnrollFont from '@/components/enrollFont/enrollFont.vue'

  // 相框坐标常量
  const FRAME_POSITION = {
    x: 125,
    y: 275,
    width: 500,
    height: 525,
  }

  // 用户数量文字位置常量（右下角）
  const TEXT_POSITION = {
    x: 750 * 0.9, // 675
    y: 1270 * 0.98, // 1244.6
  }

  // 响应式数据
  const backgroundImage = ref('../../') // 替换为你的背景图片路径
  const qrCodeImage = ref('../../static/enrollment/qrcode.jpg') // 替换为你的二维码图片路径
  const userCount = ref(8888)
  const userImage = ref('')
  const imageX = ref(0)
  const imageY = ref(0)
  const imageWidth = ref(200)
  const imageHeight = ref(200)
  const imageScale = ref(1)

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

  // 生命周期
  onMounted(() => {
    getUserCount()
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
          // 相框是75%的宽和68%的高，居中显示
          frameBounds.value = {
            width: uploadRect.width,
            height: uploadRect.height,
            frameWidth: uploadRect.width * 0.75,
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
  // 修改约束函数，确保图片永远不超出相框
  const constrainToFrame = (x, y, scale) => {
    if (!frameBounds.value.width) return { x, y }

    const scaledWidth = imageWidth.value * scale
    const scaledHeight = imageHeight.value * scale

    // 相框的实际显示区域
    const frameWidth = frameBounds.value.frameWidth
    const frameHeight = frameBounds.value.frameHeight

    // 相框边界（相对于upload-area中心）
    const frameLeft = -frameWidth / 2
    const frameRight = frameWidth / 2
    const frameTop = -frameHeight / 2
    const frameBottom = frameHeight / 2

    // 图片边界
    const imgLeft = x - scaledWidth / 2
    const imgRight = x + scaledWidth / 2
    const imgTop = y - scaledHeight / 2
    const imgBottom = y + scaledHeight / 2

    let constrainedX = x
    let constrainedY = y

    // 水平约束 - 图片不能超出相框
    if (imgLeft < frameLeft) {
      constrainedX = frameLeft + scaledWidth / 2
    } else if (imgRight > frameRight) {
      constrainedX = frameRight - scaledWidth / 2
    }

    // 垂直约束 - 图片不能超出相框
    if (imgTop < frameTop) {
      constrainedY = frameTop + scaledHeight / 2
    } else if (imgBottom > frameBottom) {
      constrainedY = frameBottom - scaledHeight / 2
    }

    return { x: constrainedX, y: constrainedY }
  }

  // 修改缩放约束，防止缩放时超出相框
  const getMaxScale = () => {
    if (!frameBounds.value.width) return 3

    const frameWidth = frameBounds.value.frameWidth
    const frameHeight = frameBounds.value.frameHeight

    // 计算不超出相框的最大缩放比例
    const maxScaleX = frameWidth / imageWidth.value
    const maxScaleY = frameHeight / imageHeight.value

    // 取较小值，确保图片在任何方向都不超出相框
    const maxScale = Math.min(maxScaleX, maxScaleY)

    // 限制最大缩放不超过3倍，但也不超过相框限制
    return Math.min(3, maxScale)
  }

  // 修改选择图片函数
  const chooseImage = () => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        userImage.value = res.tempFilePaths[0]
        // 重置图片位置和缩放
        imageX.value = 0
        imageY.value = 0
        imageScale.value = 1

        // 获取边界信息
        setTimeout(() => {
          getFrameBounds()
        }, 100)
      },
      fail: (error) => {
        uni.showToast({
          title: '选择图片失败',
          icon: 'none',
        })
      },
    })
  }

  // 计算两点间距离
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 修改触摸开始事件
  const onTouchStart = (e) => {
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

  // 获取用户注册数量
  const getUserCount = async () => {
    try {
      // 这里调用你的后端接口
      // const res = await uni.request({
      //   url: 'your-api-endpoint',
      //   method: 'GET'
      // })
      // userCount.value = res.data.count

      // 暂时使用固定值
      userCount.value = 8888
    } catch (error) {
      console.error('获取用户数量失败:', error)
    }
  }

  // 计算图片在canvas中的位置
  const calculateImagePosition = () => {
    if (!frameBounds.value.width || !userImage.value) {
      return null
    }

    // 屏幕上相框的实际尺寸
    const screenFrameWidth = frameBounds.value.frameWidth
    const screenFrameHeight = frameBounds.value.frameHeight

    // 计算屏幕坐标到canvas坐标的缩放比例
    const scaleX = FRAME_POSITION.width / screenFrameWidth
    const scaleY = FRAME_POSITION.height / screenFrameHeight

    // 用户图片在屏幕上的实际尺寸和位置
    const screenImageWidth = imageWidth.value * imageScale.value
    const screenImageHeight = imageHeight.value * imageScale.value

    // 转换为canvas尺寸
    const canvasImageWidth = screenImageWidth * scaleX
    const canvasImageHeight = screenImageHeight * scaleY

    // 用户图片中心在屏幕相框中的偏移量
    const screenOffsetX = imageX.value
    const screenOffsetY = imageY.value

    // 转换为canvas中的偏移量
    const canvasOffsetX = screenOffsetX * scaleX
    const canvasOffsetY = screenOffsetY * scaleY

    // 计算图片在canvas中的最终位置（左上角）
    const canvasImageX =
      FRAME_POSITION.x +
      FRAME_POSITION.width / 2 +
      canvasOffsetX -
      canvasImageWidth / 2
    const canvasImageY =
      FRAME_POSITION.y +
      FRAME_POSITION.height / 2 +
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
    const canvasWidth = 750
    const canvasHeight = 1270

    const ctx = uni.createCanvasContext('downloadCanvas')

    // 1. 绘制底图（包含logo、slogan、相框、二维码等所有固定元素）
    ctx.drawImage(
      '../../static/enrollment/1/entire-bg.png',
      0,
      0,
      canvasWidth,
      canvasHeight
    )

    // 2. 绘制用户照片（如果存在）
    if (userImage.value) {
      // 计算用户图片在canvas中的位置
      const canvasImagePosition = calculateImagePosition()

      if (canvasImagePosition) {
        // 设置裁剪区域为相框
        ctx.save()
        ctx.beginPath()
        ctx.rect(
          FRAME_POSITION.x,
          FRAME_POSITION.y,
          FRAME_POSITION.width,
          FRAME_POSITION.height
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

    // 3. 绘制用户数量文字（右下角）
    ctx.setFillStyle('#333333') // 根据你的设计调整颜色
    ctx.setFontSize(28) // 根据需要调整字体大小
    ctx.setTextAlign('right')
    ctx.setTextBaseline('bottom')

    const countText = `我是第${userCount.value}位签到的新生`
    ctx.fillText(countText, TEXT_POSITION.x, TEXT_POSITION.y)

    // 4. 执行绘制并保存
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
          // 保存到相册
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.showToast({
                title: '保存成功',
                icon: 'success',
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
    uni.showModal({
      title: '提示',
      content: '是否保存当前页面为图片？',
      success: (res) => {
        if (res.confirm) {
          downloadImage() // 使用新的downloadImage函数
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
