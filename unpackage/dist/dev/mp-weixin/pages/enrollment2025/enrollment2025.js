"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_config = require("../../utils/config.js");
const utils_request = require("../../utils/request.js");
const stores_audioPlayer = require("../../stores/audioPlayer.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  (_easycom_uni_icons2 + _easycom_uni_nav_bar2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_nav_bar + EnrollFont)();
}
const EnrollFont = () => "../../components/enrollFont/enrollFont.js";
const _sfc_main = {
  __name: "enrollment2025",
  setup(__props) {
    const localQrCodePath = common_vendor.ref("");
    const downloadQrCode = () => {
      return new Promise((resolve, reject) => {
        common_vendor.index.downloadFile({
          url: "https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E6%A0%A1%E5%9B%AD%E6%B4%BB%E5%8A%A8.png",
          success: (res) => {
            if (res.statusCode === 200) {
              localQrCodePath.value = res.tempFilePath;
              common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:159", "二维码下载成功:", res.tempFilePath);
              resolve(res.tempFilePath);
            } else {
              common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:162", "二维码下载失败:", res.statusCode);
              reject(new Error("下载失败"));
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:167", "二维码下载失败:", error);
            reject(error);
          }
        });
      });
    };
    const audioPlayerStore = stores_audioPlayer.useAudioPlayerStore();
    let enrollAudio;
    const isTransitioning = common_vendor.ref(false);
    const isGuideVisible = common_vendor.ref(false);
    const isTipVisible = common_vendor.ref(true);
    const enrollFontRef = common_vendor.ref(null);
    common_vendor.ref("");
    const goBack = () => {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        goHome();
      }
    };
    common_vendor.onShow(async () => {
      await downloadQrCode();
      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:197", "Enrollment2025 页面显示");
      audioPlayerStore.stopAllAudio();
      setTimeout(() => {
        enrollAudio = common_vendor.index.createInnerAudioContext();
        enrollAudio.autoplay = true;
        enrollAudio.src = "https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/bg_music/Glow%20Loop.mp3";
        enrollAudio.loop = true;
        enrollAudio.play();
        enrollAudio.onPlay(() => {
          common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:209", "音频开始播放");
        });
        common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:211", "音频已开始播放", enrollAudio);
      }, 1500);
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:217", "Enrollment2025 页面隐藏");
      if (enrollAudio) {
        enrollAudio.pause();
        enrollAudio.destroy();
        enrollAudio = null;
        common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:223", "音频已停止播放", enrollAudio);
      }
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:228", "Enrollment2025 页面卸载");
      if (enrollAudio) {
        enrollAudio.pause();
        enrollAudio.destroy();
        enrollAudio = null;
        common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:234", "音频已停止播放", enrollAudio);
      }
    });
    const goHome = () => {
      common_vendor.index.reLaunch({
        url: "/pages/index/index"
      });
    };
    const getSlogonImageUrl = () => {
      if (enrollFontRef.value) {
        return enrollFontRef.value.getCurrentSloganImage();
      }
      return "";
    };
    const DECORATION_POSITION = {
      x: 15,
      y: 215,
      width: 715,
      height: 755
    };
    const FRAME_POSITION = {
      x: 115,
      y: 275,
      width: 543,
      height: 550
    };
    const currentStickerIndex = common_vendor.ref(0);
    const stickerList = common_vendor.ref([
      "https://mang.5gradio.com.cn/static/enrollment/stick-1.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-2.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-3.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-4.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-5.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-6.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-7.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-8.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-9.png",
      "https://mang.5gradio.com.cn/static/enrollment/stick-10.png"
    ]);
    const currentStickerSrc = common_vendor.computed(() => {
      return `${stickerList.value[currentStickerIndex.value]}`;
    });
    const stickerTouchData = common_vendor.ref({
      startX: 0,
      startY: 0,
      touching: false,
      threshold: 50
      // 滑动阈值
    });
    common_vendor.ref(
      "https://mang.5gradio.com.cn/static/enrollment/qrcode.jpg"
    );
    const userCount = common_vendor.ref(8888);
    const userImage = common_vendor.ref("");
    const imageX = common_vendor.ref(0);
    const imageY = common_vendor.ref(0);
    const imageWidth = common_vendor.ref(200);
    const imageHeight = common_vendor.ref(200);
    const imageScale = common_vendor.ref(1);
    const schoolName = common_vendor.ref("xx大学");
    const currentTime = common_vendor.ref("");
    const ableDownload = common_vendor.ref(true);
    const frameBounds = common_vendor.ref({
      left: 0,
      top: 0,
      width: 0,
      height: 0
    });
    const frameScreenRect = common_vendor.ref({
      left: 0,
      top: 0,
      width: 0,
      height: 0
    });
    const TEXT_POSITION = {
      x: 445,
      y: 1210
    };
    const SCHOOL_POSITION = {
      x: 350,
      y: 830
    };
    const TIME_POSITION = {
      x: 350,
      y: 790
    };
    const touchData = common_vendor.ref({
      startX: 0,
      startY: 0,
      startDistance: 0,
      startScale: 1,
      startImageX: 0,
      startImageY: 0,
      touching: false,
      multiTouch: false,
      lastTouchTime: 0
    });
    const onStickerTouchStart = (e) => {
      isTipVisible.value = false;
      if (userImage.value && e.target.className && e.target.className.includes("image-wrapper")) {
        return;
      }
      stickerTouchData.value.touching = true;
      stickerTouchData.value.startX = e.touches[0].clientX;
      stickerTouchData.value.startY = e.touches[0].clientY;
    };
    const onStickerTouchMove = (e) => {
      if (!stickerTouchData.value.touching)
        return;
      if (userImage.value && touchData.value.touching) {
        return;
      }
      e.preventDefault();
    };
    const onStickerTouchEnd = (e) => {
      if (!stickerTouchData.value.touching)
        return;
      if (userImage.value && touchData.value.touching) {
        stickerTouchData.value.touching = false;
        return;
      }
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - stickerTouchData.value.startX;
      const deltaY = endY - stickerTouchData.value.startY;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > stickerTouchData.value.threshold) {
        if (deltaX > 0) {
          switchSticker("prev");
        } else {
          switchSticker("next");
        }
      }
      stickerTouchData.value.touching = false;
    };
    const switchSticker = (direction) => {
      isTransitioning.value = true;
      const maxIndex = stickerList.value.length - 1;
      if (direction === "next") {
        currentStickerIndex.value = currentStickerIndex.value >= maxIndex ? 0 : currentStickerIndex.value + 1;
      } else if (direction === "prev") {
        currentStickerIndex.value = currentStickerIndex.value <= 0 ? maxIndex : currentStickerIndex.value - 1;
      }
    };
    common_vendor.onShow(async () => {
      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:457", "Enrollment2025 页面已加载");
      const userInfo = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "GET");
      if (userInfo.code !== 0) {
        common_vendor.index.showToast({
          title: "获取用户信息失败",
          icon: "none"
        });
        return;
      } else {
        if (!userInfo.data.school_name || schoolName.value === "公开版") {
          schoolName.value = "";
        } else {
          schoolName.value = userInfo.data.school_name;
        }
      }
      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:474", "当前用户信息:", userInfo);
      const rest = await utils_request.request(`${utils_config.baseUrl}/user/count_new_term_activity`, "get");
      if (rest.code === 0) {
        userCount.value = rest.data.count;
        common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:478", "当前参与人数:", userCount.value);
      } else {
        common_vendor.index.showToast({
          title: "获取参与人数失败",
          icon: "none"
        });
      }
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      currentTime.value = `${year}年${month}月${day}日 ${hour}:${minute}`;
      getFrameBounds();
    });
    const getFrameBounds = () => {
      const query = common_vendor.index.createSelectorQuery();
      query.select(".upload-area").boundingClientRect((uploadRect) => {
        if (uploadRect) {
          frameBounds.value = {
            width: uploadRect.width,
            height: uploadRect.height,
            frameWidth: uploadRect.width * 0.76,
            frameHeight: uploadRect.height * 0.68
          };
          frameScreenRect.value = {
            left: uploadRect.left,
            top: uploadRect.top,
            width: uploadRect.width,
            height: uploadRect.height
          };
        }
      }).exec();
    };
    const getFrameScreenPosition = () => {
      return new Promise((resolve) => {
        const query = common_vendor.index.createSelectorQuery();
        query.select(".upload-area").boundingClientRect((rect) => {
          if (rect) {
            frameScreenRect.value = rect;
            resolve(rect);
          }
        }).exec();
      });
    };
    const onTouchMove = (e) => {
      ableDownload.value = false;
      if (!touchData.value.touching)
        return;
      e.preventDefault();
      const touches = e.touches;
      if (touches.length === 1 && !touchData.value.multiTouch) {
        const deltaX = touches[0].clientX - touchData.value.startX;
        const deltaY = touches[0].clientY - touchData.value.startY;
        let newX = touchData.value.startImageX + deltaX;
        let newY = touchData.value.startImageY + deltaY;
        const constrainedPos = constrainToFrame(newX, newY, imageScale.value);
        imageX.value = constrainedPos.x;
        imageY.value = constrainedPos.y;
      } else if (touches.length === 2) {
        if (!touchData.value.multiTouch) {
          touchData.value.multiTouch = true;
          touchData.value.startDistance = getDistance(touches[0], touches[1]);
          touchData.value.startScale = imageScale.value;
          touchData.value.startImageX = imageX.value;
          touchData.value.startImageY = imageY.value;
          return;
        }
        const currentDistance = getDistance(touches[0], touches[1]);
        const scaleRatio = currentDistance / touchData.value.startDistance;
        let newScale = touchData.value.startScale * scaleRatio;
        const maxScale = getMaxScale();
        newScale = Math.max(0.5, Math.min(maxScale, newScale));
        const centerX = (touches[0].clientX + touches[1].clientX) / 2;
        const centerY = (touches[0].clientY + touches[1].clientY) / 2;
        const frameCenterX = frameScreenRect.value.left + frameScreenRect.value.width / 2;
        const frameCenterY = frameScreenRect.value.top + frameScreenRect.value.height / 2;
        const relativeCenterX = centerX - frameCenterX;
        const relativeCenterY = centerY - frameCenterY;
        const scaleDelta = newScale / touchData.value.startScale;
        const currentImageX = touchData.value.startImageX;
        const currentImageY = touchData.value.startImageY;
        let newX = relativeCenterX + (currentImageX - relativeCenterX) * scaleDelta;
        let newY = relativeCenterY + (currentImageY - relativeCenterY) * scaleDelta;
        imageScale.value = newScale;
        const constrainedPos = constrainToFrame(newX, newY, newScale);
        imageX.value = constrainedPos.x;
        imageY.value = constrainedPos.y;
      }
    };
    const constrainToFrame = (x, y, scale) => {
      if (!frameBounds.value.width)
        return { x, y };
      const totalScale = initialScale.value * scale;
      const scaledWidth = imageWidth.value * totalScale;
      const scaledHeight = imageHeight.value * totalScale;
      const clipTop = 0.15;
      const clipRight = 0.125;
      const clipBottom = 0.17;
      const clipLeft = 0.12;
      const containerWidth = frameBounds.value.width;
      const containerHeight = frameBounds.value.height;
      const frameWidth = containerWidth * (1 - clipLeft - clipRight);
      const frameHeight = containerHeight * (1 - clipTop - clipBottom);
      const frameCenterOffsetX = containerWidth * (clipLeft - clipRight) / 2;
      const frameCenterOffsetY = containerHeight * (clipTop - clipBottom) / 2;
      const frameLeft = frameCenterOffsetX - frameWidth / 2;
      const frameRight = frameCenterOffsetX + frameWidth / 2;
      const frameTop = frameCenterOffsetY - frameHeight / 2;
      const frameBottom = frameCenterOffsetY + frameHeight / 2;
      const imgLeft = x - scaledWidth / 2;
      const imgRight = x + scaledWidth / 2;
      const imgTop = y - scaledHeight / 2;
      const imgBottom = y + scaledHeight / 2;
      let constrainedX = x;
      let constrainedY = y;
      if (scaledWidth <= frameWidth) {
        if (imgLeft < frameLeft) {
          constrainedX = frameLeft + scaledWidth / 2;
        } else if (imgRight > frameRight) {
          constrainedX = frameRight - scaledWidth / 2;
        }
      } else {
        if (imgLeft > frameLeft) {
          constrainedX = frameLeft + scaledWidth / 2;
        } else if (imgRight < frameRight) {
          constrainedX = frameRight - scaledWidth / 2;
        }
      }
      if (scaledHeight <= frameHeight) {
        if (imgTop < frameTop) {
          constrainedY = frameTop + scaledHeight / 2;
        } else if (imgBottom > frameBottom) {
          constrainedY = frameBottom - scaledHeight / 2;
        }
      } else {
        if (imgTop > frameTop) {
          constrainedY = frameTop + scaledHeight / 2;
        } else if (imgBottom < frameBottom) {
          constrainedY = frameBottom - scaledHeight / 2;
        }
      }
      return { x: constrainedX, y: constrainedY };
    };
    const getMaxScale = () => {
      if (!frameBounds.value.width)
        return 2.5;
      const frameWidth = frameBounds.value.frameWidth;
      const frameHeight = frameBounds.value.frameHeight;
      const maxScaleX = frameWidth * 2 / (imageWidth.value * initialScale.value);
      const maxScaleY = frameHeight * 2 / (imageHeight.value * initialScale.value);
      const maxScale = Math.max(maxScaleX, maxScaleY);
      return Math.max(1.5, Math.min(3, maxScale));
    };
    const initialScale = common_vendor.ref(1);
    const chooseImage = () => {
      if (!common_vendor.index.getStorageSync("token")) {
        common_vendor.index.showModal({
          title: "",
          content: "登录后体验完整功能",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:712", "用户点击确定");
              setTimeout(() => {
                common_vendor.index.reLaunch({
                  url: "/pages/login/login"
                });
              }, 300);
            } else if (res.cancel) {
              common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:720", "用户点击取消");
            }
          }
        });
        return;
      }
      if (userImage.value) {
        common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:727", "已经选择过图片，无法再次选择", userImage.value);
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          userImage.value = res.tempFilePaths[0];
          common_vendor.index.getImageInfo({
            src: res.tempFilePaths[0],
            success: (imageInfo) => {
              imageWidth.value = imageInfo.width;
              imageHeight.value = imageInfo.height;
              setTimeout(() => {
                calculateInitialScale(imageInfo.width, imageInfo.height);
              }, 200);
              imageX.value = 0;
              imageY.value = 0;
              imageScale.value = 1;
              setTimeout(() => {
                getFrameBounds();
              }, 100);
            }
          });
        },
        fail: (error) => {
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    };
    const calculateInitialScale = (imgWidth, imgHeight) => {
      const query = common_vendor.index.createSelectorQuery();
      query.select(".user-image").boundingClientRect((rect) => {
        if (rect) {
          const containerWidth = rect.width;
          const containerHeight = rect.height;
          const scaleX = containerWidth / imgWidth;
          const scaleY = containerHeight / imgHeight;
          initialScale.value = Math.max(scaleX, scaleY);
          common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:787", "初始缩放计算:", {
            containerSize: [containerWidth, containerHeight],
            imageSize: [imgWidth, imgHeight],
            initialScale: initialScale.value
          });
        }
      }).exec();
    };
    const getDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const onTouchStart = (e) => {
      ableDownload.value = false;
      const touches = e.touches;
      touchData.value.touching = true;
      touchData.value.lastTouchTime = Date.now();
      getFrameScreenPosition();
      if (touches.length === 1) {
        touchData.value.multiTouch = false;
        touchData.value.startX = touches[0].clientX;
        touchData.value.startY = touches[0].clientY;
        touchData.value.startImageX = imageX.value;
        touchData.value.startImageY = imageY.value;
      } else if (touches.length === 2) {
        touchData.value.multiTouch = false;
      }
    };
    const onTouchEnd = (e) => {
      ableDownload.value = true;
      if (e.touches.length === 0) {
        touchData.value.touching = false;
        touchData.value.multiTouch = false;
      } else if (e.touches.length === 1 && touchData.value.multiTouch) {
        touchData.value.multiTouch = false;
        touchData.value.startX = e.touches[0].clientX;
        touchData.value.startY = e.touches[0].clientY;
        touchData.value.startImageX = imageX.value;
        touchData.value.startImageY = imageY.value;
      }
    };
    const calculateImagePosition = () => {
      if (!frameBounds.value.width || !userImage.value) {
        return null;
      }
      const clipTop = 0.15;
      const clipRight = 0.13;
      const clipBottom = 0.17;
      const clipLeft = 0.12;
      const screenContainerWidth = frameBounds.value.width;
      const screenContainerHeight = frameBounds.value.height;
      const screenFrameWidth = screenContainerWidth * (1 - clipLeft - clipRight);
      const screenFrameHeight = screenContainerHeight * (1 - clipTop - clipBottom);
      const canvasFrameX = FRAME_POSITION.x;
      const canvasFrameY = FRAME_POSITION.y;
      const canvasFrameWidth = FRAME_POSITION.width;
      const canvasFrameHeight = FRAME_POSITION.height;
      const scaleX = canvasFrameWidth / screenFrameWidth;
      const scaleY = canvasFrameHeight / screenFrameHeight;
      const totalScale = initialScale.value * imageScale.value;
      const screenImageWidth = imageWidth.value * totalScale;
      const screenImageHeight = imageHeight.value * totalScale;
      const canvasImageWidth = screenImageWidth * scaleX;
      const canvasImageHeight = screenImageHeight * scaleY;
      const screenOffsetX = imageX.value;
      const screenOffsetY = imageY.value;
      const canvasOffsetX = screenOffsetX * scaleX;
      const canvasOffsetY = screenOffsetY * scaleY;
      const canvasImageX = canvasFrameX + canvasFrameWidth / 2 + canvasOffsetX - canvasImageWidth / 2;
      const canvasImageY = canvasFrameY + canvasFrameHeight / 2 + canvasOffsetY - canvasImageHeight / 2;
      return {
        x: canvasImageX,
        y: canvasImageY,
        width: canvasImageWidth,
        height: canvasImageHeight
      };
    };
    const downloadImage = () => {
      if (userImage.value === "") {
        common_vendor.index.showToast({
          title: "请选择照片",
          icon: "none"
        });
        return;
      }
      if (!ableDownload.value) {
        return;
      }
      const currentSlogonUrl = getSlogonImageUrl();
      const canvasWidth = 750;
      const canvasHeight = 1270;
      const ctx = common_vendor.index.createCanvasContext("downloadCanvas");
      ctx.drawImage(
        "../../static/enrollment/base-bg.png",
        0,
        0,
        canvasWidth,
        canvasHeight
      );
      if (userImage.value) {
        const canvasImagePosition = calculateImagePosition();
        if (canvasImagePosition) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(
            FRAME_POSITION.x,
            // 125
            FRAME_POSITION.y,
            // 275
            FRAME_POSITION.width,
            // 500
            FRAME_POSITION.height
            // 525
          );
          ctx.clip();
          ctx.drawImage(
            userImage.value,
            canvasImagePosition.x,
            canvasImagePosition.y,
            canvasImagePosition.width,
            canvasImagePosition.height
          );
          ctx.restore();
        }
      }
      const decorationIndex = currentStickerIndex.value + 1;
      ctx.drawImage(
        `../../static/enrollment/decoration/decoration-${decorationIndex}.png`,
        DECORATION_POSITION.x,
        // 35
        DECORATION_POSITION.y,
        // 215
        DECORATION_POSITION.width,
        // 690
        DECORATION_POSITION.height
        // 735
      );
      if (currentSlogonUrl) {
        ctx.drawImage(
          currentSlogonUrl,
          35,
          // x坐标
          50,
          // y坐标
          355,
          // 宽度
          120
          // 高度
        );
      }
      if (localQrCodePath.value) {
        const qrSize = 120;
        ctx.drawImage(localQrCodePath.value, 46, 1050, qrSize, qrSize);
        common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:986", "绘制二维码:", localQrCodePath.value, "at position: 75, 1075");
      } else {
        common_vendor.index.__f__("warn", "at pages/enrollment2025/enrollment2025.vue:988", "二维码图片未下载，跳过绘制");
      }
      ctx.setTextAlign("left");
      ctx.setTextBaseline("middle");
      const beforeText = "我是2025级第";
      const countValueText = userCount.value.toString();
      const afterText = "位签到新生";
      ctx.setFontSize(20);
      const beforeWidth = ctx.measureText(beforeText).width;
      ctx.setFontSize(30);
      const countWidth = ctx.measureText(countValueText).width;
      ctx.setFillStyle("#ffffff");
      ctx.setFontSize(20);
      ctx.fillText(beforeText, TEXT_POSITION.x, TEXT_POSITION.y);
      ctx.setFillStyle("#cdf91d");
      ctx.setFontSize(30);
      ctx.fillText(countValueText, TEXT_POSITION.x + beforeWidth, TEXT_POSITION.y);
      ctx.setFillStyle("#ffffff");
      ctx.setFontSize(20);
      ctx.fillText(
        afterText,
        TEXT_POSITION.x + beforeWidth + countWidth,
        TEXT_POSITION.y
      );
      ctx.save();
      ctx.translate(TIME_POSITION.x, TIME_POSITION.y);
      ctx.rotate(5 * Math.PI / 180);
      ctx.setFillStyle("#aaa");
      ctx.setFontSize(16);
      ctx.setTextAlign("left");
      ctx.setTextBaseline("middle");
      const currentTImeText = `电子认证时间：${currentTime.value}`;
      ctx.fillText(currentTImeText, 0, 0);
      ctx.restore();
      ctx.save();
      ctx.translate(SCHOOL_POSITION.x, SCHOOL_POSITION.y);
      ctx.rotate(5 * Math.PI / 180);
      ctx.setFillStyle("#8AE0E8");
      ctx.setTextAlign("left");
      ctx.setTextBaseline("middle");
      const schoolText = `${schoolName.value}`;
      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:1047", "开始画学校了学校名称:", schoolText);
      if (schoolText.length > 10) {
        ctx.setFontSize(24);
        const firstLine = schoolText.substring(0, 10);
        const secondLine = schoolText.substring(10);
        ctx.fillText(firstLine, 0, -12);
        if (secondLine.length > 0) {
          ctx.fillText(secondLine, 0, 12);
        }
      } else {
        ctx.setFontSize(28);
        ctx.fillText(schoolText, 0, 0);
      }
      ctx.restore();
      ctx.draw(false, () => {
        common_vendor.index.canvasToTempFilePath({
          canvasId: "downloadCanvas",
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          destWidth: canvasWidth,
          destHeight: canvasHeight,
          success: (res) => {
            common_vendor.index.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                common_vendor.index.showToast({
                  title: "保存成功",
                  icon: "success"
                });
                isGuideVisible.value = true;
                common_vendor.index.showModal({
                  title: "提示",
                  content: "已保存到相册，快去分享给你的朋友吧！",
                  showCancel: false,
                  confirmText: "知道了",
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      isGuideVisible.value = false;
                    }
                  }
                });
              },
              fail: () => {
                common_vendor.index.showToast({
                  title: "保存失败，请检查相册权限",
                  icon: "none"
                });
              }
            });
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:1115", "生成图片失败:", error);
            common_vendor.index.showToast({
              title: "生成图片失败",
              icon: "none"
            });
          }
        });
      });
    };
    const handleLongPress = () => {
      if (!userImage.value) {
        common_vendor.index.showToast({
          title: "请先上传照片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "是否立即保存你的青春高光时刻？",
        success: (res) => {
          if (res.confirm) {
            downloadImage();
            utils_request.request(`${utils_config.baseUrl}/user/update_new_term_activity`, "POST", {}).then((response) => {
              if (response.code === 0) {
                common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:1145", "入学通知书生成记录成功");
                common_vendor.wx$1.requestSubscribeMessage({
                  tmplIds: ["HWBLfUmzWZB_UqhQ8gKd25fK67OyJfp2Iw8qQvLhp3s"],
                  // 需要下发的订阅消息模板id数组
                  success(res2) {
                    if (res2["HWBLfUmzWZB_UqhQ8gKd25fK67OyJfp2Iw8qQvLhp3s"] === "accept") {
                      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:1154", "用户同意订阅", res2);
                      const openid = res2["HWBLfUmzWZB_UqhQ8gKd25fK67OyJfp2Iw8qQvLhp3s"];
                      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:1158", "用户的 openid:", openid);
                    } else {
                      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:1161", "用户拒绝订阅");
                    }
                  },
                  fail(err) {
                    common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:1165", err);
                  }
                });
              } else {
                common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:1169", "入学通知书生成记录失败:", response.message);
              }
            }).catch((error) => {
              common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:1173", "请求失败:", error);
            });
          }
        }
      });
    };
    const reupload = () => {
      if (!userImage.value) {
        chooseImage();
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "是否重新上传照片？",
        success: (res) => {
          if (res.confirm) {
            userImage.value = "";
            imageX.value = 0;
            imageY.value = 0;
            imageScale.value = 1;
            chooseImage();
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          type: "left",
          size: "22"
        }),
        c: common_vendor.o(goHome),
        d: common_vendor.p({
          type: "home",
          size: "22"
        }),
        e: common_vendor.p({
          fixed: true,
          ["status-bar"]: true,
          shadow: false,
          ["background-color"]: "rgba(255, 255, 255, 0)",
          color: "#333",
          border: false,
          leftWidth: "0"
        }),
        f: common_assets._imports_0,
        g: isGuideVisible.value
      }, isGuideVisible.value ? {
        h: common_assets._imports_1$2
      } : {}, {
        i: common_vendor.sr(enrollFontRef, "13dd3b1c-3", {
          "k": "enrollFontRef"
        }),
        j: currentStickerIndex.value,
        k: currentStickerSrc.value,
        l: common_vendor.t(currentTime.value),
        m: common_vendor.t(schoolName.value),
        n: !userImage.value
      }, !userImage.value ? {
        o: common_vendor.o(chooseImage)
      } : {}, {
        p: userImage.value,
        q: `translate(${imageX.value}px, ${imageY.value}px) scale(${imageScale.value})`,
        r: common_vendor.o(onTouchStart),
        s: common_vendor.o(onTouchMove),
        t: common_vendor.o(onTouchEnd),
        v: isTipVisible.value
      }, isTipVisible.value ? {
        w: common_assets._imports_2$1
      } : {}, {
        x: common_vendor.o(onStickerTouchStart),
        y: common_vendor.o(onStickerTouchMove),
        z: common_vendor.o(onStickerTouchEnd),
        A: common_assets._imports_3,
        B: common_vendor.o(handleLongPress),
        C: common_assets._imports_4,
        D: common_vendor.o(reupload)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-13dd3b1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/enrollment2025/enrollment2025.js.map
