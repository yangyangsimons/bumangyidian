<template>
  <view class="container">
    <!-- 背景图 -->
    <view
      class="background-area"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    >
      <!-- 二维码 -->
      <image class="qr-code" :src="qrCodeImage" mode="aspectFit"></image>

      <!-- 注册用户数文字 -->
      <text class="user-count-text">你是第{{ userCount }}个注册的用户</text>

      <!-- 用户图片上传区域 -->
      <view class="upload-area" @tap="chooseImage" v-if="!userImage">
        <text class="upload-text">点击上传图片</text>
      </view>

      <!-- 用户图片显示区域 -->
      <movable-area class="movable-area" v-if="userImage">
        <movable-view
          class="movable-view"
          :style="{
            width: imageWidth + 'px',
            height: imageHeight + 'px',
          }"
          direction="all"
          :x="imageX"
          :y="imageY"
          :scale="true"
          :scale-min="0.5"
          :scale-max="3"
          @change="onImageChange"
          @scale="onImageScale"
        >
          <image :src="userImage" mode="aspectFit" class="user-image"></image>
        </movable-view>
      </movable-area>

      <!-- 操作提示和重新选择按钮 -->
      <view class="controls" v-if="userImage">
        <view class="tip-text">
          <text>双指缩放 · 拖动调整位置</text>
        </view>
        <button class="reselect-btn" @tap="chooseImage">重新选择图片</button>
      </view>
    </view>

    <!-- 下载按钮 -->
    <button class="download-btn" @tap="downloadImage">下载图片</button>

    <!-- 隐藏的canvas -->
    <canvas canvas-id="downloadCanvas" class="hidden-canvas"></canvas>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  // 响应式数据
  const backgroundImage = ref('/static/background.jpg') // 替换为你的背景图片路径
  const qrCodeImage = ref('/static/qrcode.png') // 替换为你的二维码图片路径
  const userCount = ref(8888)
  const userImage = ref('')
  const imageX = ref(0)
  const imageY = ref(0)
  const imageWidth = ref(200)
  const imageHeight = ref(200)
  const imageScale = ref(1)

  // 生命周期
  onMounted(() => {
    getUserCount()
  })

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

  // 选择图片
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
      },
      fail: (error) => {
        uni.showToast({
          title: '选择图片失败',
          icon: 'none',
        })
      },
    })
  }

  // 图片移动和缩放事件（统一处理）
  const onImageChange = (e) => {
    imageX.value = e.detail.x
    imageY.value = e.detail.y
  }

  // 图片缩放事件
  const onImageScale = (e) => {
    imageScale.value = e.detail.scale
  }

  // 下载图片
  const downloadImage = () => {
    if (!userImage.value) {
      uni.showToast({
        title: '请先上传图片',
        icon: 'none',
      })
      return
    }

    createCanvas()
  }

  // 创建canvas并合成图片
  const createCanvas = () => {
    const query = uni.createSelectorQuery()
    query.select('.background-area').boundingClientRect()
    query.exec((res) => {
      const rect = res[0]
      const canvasWidth = rect.width
      const canvasHeight = rect.height

      // 创建canvas上下文
      const ctx = uni.createCanvasContext('downloadCanvas')

      // 绘制背景图
      ctx.drawImage(backgroundImage.value, 0, 0, canvasWidth, canvasHeight)

      // 绘制二维码
      const qrSize = 80
      ctx.drawImage(
        qrCodeImage.value,
        canvasWidth - qrSize - 20,
        20,
        qrSize,
        qrSize
      )

      // 绘制文字
      ctx.setFontSize(16)
      ctx.setFillStyle('#333')
      ctx.fillText(`你是第${userCount.value}个注册的用户`, 20, 50)

      // 绘制用户图片
      if (userImage.value) {
        const userImgWidth = imageWidth.value * imageScale.value
        const userImgHeight = imageHeight.value * imageScale.value
        ctx.drawImage(
          userImage.value,
          imageX.value,
          imageY.value + 100, // 考虑上方内容的偏移
          userImgWidth,
          userImgHeight
        )
      }

      ctx.draw(false, () => {
        // 导出图片
        uni.canvasToTempFilePath({
          canvasId: 'downloadCanvas',
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
                  title: '保存失败',
                  icon: 'none',
                })
              },
            })
          },
        })
      })
    })
  }
</script>

<style lang="scss" scoped>
  .container {
    width: 100vw;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .background-area {
    width: 100%;
    height: 80vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    .qr-code {
      width: 80px;
      height: 80px;
      position: absolute;
      top: 20px;
      right: 20px;
    }

    .user-count-text {
      color: #333;
      font-size: 16px;
      font-weight: bold;
      margin-top: 20px;
      text-align: center;
    }

    .upload-area {
      width: 200px;
      height: 200px;
      border: 2px dashed #ccc;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 50px;
      background-color: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;

      &:active {
        background-color: rgba(255, 255, 255, 0.9);
        transform: scale(0.98);
      }

      .upload-text {
        color: #666;
        font-size: 14px;
      }
    }

    .movable-area {
      width: 100%;
      height: 400px;
      margin-top: 50px;

      .movable-view {
        position: relative;

        .user-image {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }

    .controls {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;

      .tip-text {
        text {
          color: #666;
          font-size: 12px;
          text-align: center;
        }
      }

      .reselect-btn {
        padding: 8px 20px;
        background-color: rgba(255, 255, 255, 0.9);
        color: #007aff;
        border: 1px solid #007aff;
        border-radius: 20px;
        font-size: 14px;
        transition: all 0.3s ease;

        &:active {
          background-color: #007aff;
          color: white;
          transform: scale(0.95);
        }
      }
    }
  }

  .download-btn {
    width: 80%;
    height: 50px;
    background: linear-gradient(135deg, #007aff, #0056d3);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 500;
    margin: 20px auto;
    display: block;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
    transition: all 0.3s ease;

    &:active {
      transform: translateY(2px);
      box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  .hidden-canvas {
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 375px;
    height: 600px;
  }
</style>
