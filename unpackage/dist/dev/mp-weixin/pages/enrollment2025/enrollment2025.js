"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_config = require("../../utils/config.js");
const utils_request = require("../../utils/request.js");
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
    const isTransitioning = common_vendor.ref(false);
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
      x: 35,
      y: 215,
      width: 690,
      height: 735
    };
    const FRAME_POSITION = {
      x: 140,
      y: 280,
      width: 505,
      height: 500
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
      x: 552,
      y: 1215
    };
    const SCHOOL_POSITION = {
      x: 325,
      y: 805
    };
    const TIME_POSITION = {
      x: 325,
      y: 775
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
    common_vendor.onMounted(async () => {
      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:362", "Enrollment2025 页面已加载");
      const userInfo = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "GET");
      if (userInfo.code !== 0) {
        common_vendor.index.showToast({
          title: "获取用户信息失败",
          icon: "none"
        });
        return;
      } else {
        userCount.value = userInfo.data.report_idx;
        if (!userInfo.data.school_name || schoolName.value === "公开版") {
          schoolName.value = "注册登录选择大学";
        } else {
          schoolName.value = userInfo.data.school_name;
        }
      }
      common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:380", "当前用户信息:", userInfo);
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
      const scaledWidth = imageWidth.value * scale;
      const scaledHeight = imageHeight.value * scale;
      const frameWidth = frameBounds.value.frameWidth;
      const frameHeight = frameBounds.value.frameHeight;
      const frameLeft = -frameWidth / 2;
      const frameRight = frameWidth / 2;
      const frameTop = -frameHeight / 2;
      const frameBottom = frameHeight / 2;
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
      const maxScaleX = frameWidth * 2 / imageWidth.value;
      const maxScaleY = frameHeight * 2 / imageHeight.value;
      const maxScale = Math.max(maxScaleX, maxScaleY);
      return Math.max(1.5, Math.min(3, maxScale));
    };
    const chooseImage = () => {
      if (!common_vendor.index.getStorageSync("token")) {
        common_vendor.index.showModal({
          title: "",
          content: "登录后体验完整功能",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:602", "用户点击确定");
              setTimeout(() => {
                common_vendor.index.reLaunch({
                  url: "/pages/login/login"
                });
              }, 300);
            } else if (res.cancel) {
              common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:610", "用户点击取消");
            }
          }
        });
        return;
      }
      if (userImage.value) {
        common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:618", "已经选择过图片，无法再次选择", userImage.value);
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          userImage.value = res.tempFilePaths[0];
          imageX.value = 0;
          imageY.value = 0;
          imageScale.value = 1;
          setTimeout(() => {
            getFrameBounds();
          }, 100);
        },
        fail: (error) => {
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
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
      const screenFrameWidth = frameBounds.value.frameWidth;
      const screenFrameHeight = frameBounds.value.frameHeight;
      const scaleX = FRAME_POSITION.width / screenFrameWidth;
      const scaleY = FRAME_POSITION.height / screenFrameHeight;
      const screenImageWidth = imageWidth.value * imageScale.value;
      const screenImageHeight = imageHeight.value * imageScale.value;
      const canvasImageWidth = screenImageWidth * scaleX;
      const canvasImageHeight = screenImageHeight * scaleY;
      const screenOffsetX = imageX.value;
      const screenOffsetY = imageY.value;
      const canvasOffsetX = screenOffsetX * scaleX;
      const canvasOffsetY = screenOffsetY * scaleY;
      const canvasImageX = FRAME_POSITION.x + FRAME_POSITION.width / 2 + canvasOffsetX - canvasImageWidth / 2;
      const canvasImageY = FRAME_POSITION.y + FRAME_POSITION.height / 2 + canvasOffsetY - canvasImageHeight / 2;
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
      ctx.setFillStyle("#cdf91d");
      ctx.setFontSize(28);
      ctx.setTextAlign("left");
      ctx.setTextBaseline("middle");
      const countText = `${userCount.value}`;
      ctx.fillText(countText, TEXT_POSITION.x, TEXT_POSITION.y);
      ctx.save();
      ctx.translate(TIME_POSITION.x, TIME_POSITION.y);
      ctx.rotate(5 * Math.PI / 180);
      ctx.setFillStyle("#aaa");
      ctx.setFontSize(16);
      ctx.setTextAlign("left");
      ctx.setTextBaseline("middle");
      const currentTImeText = `电子认证时间：${currentTime.value}`;
      ctx.fillText(currentTImeText, 0, 0);
      ctx.save();
      ctx.translate(SCHOOL_POSITION.x, SCHOOL_POSITION.y);
      ctx.rotate(5 * Math.PI / 180);
      ctx.setFillStyle("#aaa");
      ctx.setFontSize(28);
      ctx.setTextAlign("left");
      ctx.setTextBaseline("middle");
      const schoolText = `${schoolName.value}`;
      ctx.fillText(schoolText, 0, 0);
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
            common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:885", "生成图片失败:", error);
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
        content: "是否立即保存入学通知书？",
        success: (res) => {
          if (res.confirm) {
            downloadImage();
            utils_request.request(`${utils_config.baseUrl}/user/update_new_term_activity`, "POST", {}).then((response) => {
              if (response.code === 0) {
                common_vendor.index.__f__("log", "at pages/enrollment2025/enrollment2025.vue:915", "入学通知书生成记录成功");
              } else {
                common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:917", "入学通知书生成记录失败:", response.message);
              }
            }).catch((error) => {
              common_vendor.index.__f__("error", "at pages/enrollment2025/enrollment2025.vue:921", "请求失败:", error);
            });
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
        g: common_vendor.sr(enrollFontRef, "13dd3b1c-3", {
          "k": "enrollFontRef"
        }),
        h: currentStickerIndex.value,
        i: currentStickerSrc.value,
        j: common_vendor.t(currentTime.value),
        k: common_vendor.t(schoolName.value),
        l: !userImage.value
      }, !userImage.value ? {
        m: common_vendor.o(chooseImage)
      } : {}, {
        n: userImage.value
      }, userImage.value ? {
        o: userImage.value,
        p: `translate(${imageX.value}px, ${imageY.value}px) scale(${imageScale.value})`,
        q: imageWidth.value + "px",
        r: imageHeight.value + "px",
        s: common_vendor.o(onTouchStart),
        t: common_vendor.o(onTouchMove),
        v: common_vendor.o(onTouchEnd)
      } : {}, {
        w: common_vendor.o(onStickerTouchStart),
        x: common_vendor.o(onStickerTouchMove),
        y: common_vendor.o(onStickerTouchEnd),
        z: common_assets._imports_1$1,
        A: common_vendor.o(handleLongPress)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-13dd3b1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/enrollment2025/enrollment2025.js.map
