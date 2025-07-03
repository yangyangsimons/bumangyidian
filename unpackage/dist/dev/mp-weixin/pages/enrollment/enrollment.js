"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Math) {
  EnrollFont();
}
const EnrollFont = () => "../../components/enrollFont/enrollFont.js";
const _sfc_main = {
  __name: "enrollment",
  setup(__props) {
    const FRAME_POSITION = {
      x: 125,
      y: 275,
      width: 500,
      height: 525
    };
    const TEXT_POSITION = {
      x: 750 * 0.9,
      // 675
      y: 1270 * 0.98
      // 1244.6
    };
    common_vendor.ref("../../");
    const qrCodeImage = common_vendor.ref("../../static/enrollment/qrcode.jpg");
    const userCount = common_vendor.ref(8888);
    const userImage = common_vendor.ref("");
    const imageX = common_vendor.ref(0);
    const imageY = common_vendor.ref(0);
    const imageWidth = common_vendor.ref(200);
    const imageHeight = common_vendor.ref(200);
    const imageScale = common_vendor.ref(1);
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
    common_vendor.onMounted(() => {
      getUserCount();
      getFrameBounds();
    });
    const getFrameBounds = () => {
      const query = common_vendor.index.createSelectorQuery();
      query.select(".upload-area").boundingClientRect((uploadRect) => {
        if (uploadRect) {
          frameBounds.value = {
            width: uploadRect.width,
            height: uploadRect.height,
            frameWidth: uploadRect.width * 0.75,
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
      if (imgLeft < frameLeft) {
        constrainedX = frameLeft + scaledWidth / 2;
      } else if (imgRight > frameRight) {
        constrainedX = frameRight - scaledWidth / 2;
      }
      if (imgTop < frameTop) {
        constrainedY = frameTop + scaledHeight / 2;
      } else if (imgBottom > frameBottom) {
        constrainedY = frameBottom - scaledHeight / 2;
      }
      return { x: constrainedX, y: constrainedY };
    };
    const getMaxScale = () => {
      if (!frameBounds.value.width)
        return 3;
      const frameWidth = frameBounds.value.frameWidth;
      const frameHeight = frameBounds.value.frameHeight;
      const maxScaleX = frameWidth / imageWidth.value;
      const maxScaleY = frameHeight / imageHeight.value;
      const maxScale = Math.min(maxScaleX, maxScaleY);
      return Math.min(3, maxScale);
    };
    const chooseImage = () => {
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
    const getUserCount = async () => {
      try {
        userCount.value = 8888;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/enrollment/enrollment.vue:400", "获取用户数量失败:", error);
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
      const canvasWidth = 750;
      const canvasHeight = 1270;
      const ctx = common_vendor.index.createCanvasContext("downloadCanvas");
      ctx.drawImage(
        "../../static/enrollment/1/entire-bg.png",
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
            FRAME_POSITION.y,
            FRAME_POSITION.width,
            FRAME_POSITION.height
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
      ctx.setFillStyle("#333333");
      ctx.setFontSize(28);
      ctx.setTextAlign("right");
      ctx.setTextBaseline("bottom");
      const countText = `我是第${userCount.value}位签到的新生`;
      ctx.fillText(countText, TEXT_POSITION.x, TEXT_POSITION.y);
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
            common_vendor.index.__f__("error", "at pages/enrollment/enrollment.vue:538", "生成图片失败:", error);
            common_vendor.index.showToast({
              title: "生成图片失败",
              icon: "none"
            });
          }
        });
      });
    };
    const handleLongPress = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "是否保存当前页面为图片？",
        success: (res) => {
          if (res.confirm) {
            downloadImage();
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_assets._imports_1,
        c: qrCodeImage.value,
        d: common_assets._imports_2,
        e: common_assets._imports_3,
        f: userImage.value
      }, userImage.value ? {
        g: userImage.value,
        h: `translate(${imageX.value}px, ${imageY.value}px) scale(${imageScale.value})`,
        i: imageWidth.value + "px",
        j: imageHeight.value + "px",
        k: common_vendor.o(onTouchStart),
        l: common_vendor.o(onTouchMove),
        m: common_vendor.o(onTouchEnd)
      } : {}, {
        n: common_vendor.o(chooseImage),
        o: common_assets._imports_4,
        p: common_vendor.t(userCount.value),
        q: common_vendor.o(handleLongPress)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3cdd96a5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/enrollment/enrollment.js.map
