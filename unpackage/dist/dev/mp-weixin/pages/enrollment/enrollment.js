"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "enrollment",
  setup(__props) {
    const backgroundImage = common_vendor.ref("/static/background.jpg");
    const qrCodeImage = common_vendor.ref("/static/qrcode.png");
    const userCount = common_vendor.ref(8888);
    const userImage = common_vendor.ref("");
    const imageX = common_vendor.ref(0);
    const imageY = common_vendor.ref(0);
    const imageWidth = common_vendor.ref(200);
    const imageHeight = common_vendor.ref(200);
    const imageScale = common_vendor.ref(1);
    const touchData = common_vendor.ref({
      startX: 0,
      startY: 0,
      startDistance: 0,
      startScale: 1,
      startImageX: 0,
      startImageY: 0,
      touching: false,
      multiTouch: false
    });
    common_vendor.onMounted(() => {
      getUserCount();
    });
    const getUserCount = async () => {
      try {
        userCount.value = 8888;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/enrollment/enrollment.vue:97", "获取用户数量失败:", error);
      }
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
      if (touches.length === 1) {
        touchData.value.multiTouch = false;
        touchData.value.startX = touches[0].clientX;
        touchData.value.startY = touches[0].clientY;
        touchData.value.startImageX = imageX.value;
        touchData.value.startImageY = imageY.value;
      } else if (touches.length === 2) {
        touchData.value.multiTouch = true;
        touchData.value.startDistance = getDistance(touches[0], touches[1]);
        touchData.value.startScale = imageScale.value;
      }
    };
    const onTouchMove = (e) => {
      if (!touchData.value.touching)
        return;
      e.preventDefault();
      const touches = e.touches;
      if (touches.length === 1 && !touchData.value.multiTouch) {
        const deltaX = touches[0].clientX - touchData.value.startX;
        const deltaY = touches[0].clientY - touchData.value.startY;
        imageX.value = touchData.value.startImageX + deltaX;
        imageY.value = touchData.value.startImageY + deltaY;
      } else if (touches.length === 2) {
        const currentDistance = getDistance(touches[0], touches[1]);
        const scaleRatio = currentDistance / touchData.value.startDistance;
        let newScale = touchData.value.startScale * scaleRatio;
        newScale = Math.max(0.5, Math.min(3, newScale));
        imageScale.value = newScale;
      }
    };
    const onTouchEnd = (e) => {
      touchData.value.touching = false;
      touchData.value.multiTouch = false;
    };
    const downloadImage = () => {
      if (!userImage.value) {
        common_vendor.index.showToast({
          title: "请先上传图片",
          icon: "none"
        });
        return;
      }
      createCanvas();
    };
    const createCanvas = () => {
      const query = common_vendor.index.createSelectorQuery();
      query.select(".background-area").boundingClientRect();
      query.exec((res) => {
        const rect = res[0];
        const canvasWidth = rect.width;
        const canvasHeight = rect.height;
        const ctx = common_vendor.index.createCanvasContext("downloadCanvas");
        ctx.drawImage(backgroundImage.value, 0, 0, canvasWidth, canvasHeight);
        const qrSize = 80;
        ctx.drawImage(
          qrCodeImage.value,
          canvasWidth - qrSize - 20,
          20,
          qrSize,
          qrSize
        );
        ctx.setFontSize(16);
        ctx.setFillStyle("#333");
        ctx.fillText(`你是第${userCount.value}个注册的用户`, 20, 50);
        if (userImage.value) {
          const userImgWidth = imageWidth.value * imageScale.value;
          const userImgHeight = imageHeight.value * imageScale.value;
          ctx.drawImage(
            userImage.value,
            imageX.value + (canvasWidth - imageWidth.value) / 2,
            // 考虑居中偏移
            imageY.value + 150,
            // 考虑上方内容的偏移
            userImgWidth,
            userImgHeight
          );
        }
        ctx.draw(false, () => {
          common_vendor.index.canvasToTempFilePath({
            canvasId: "downloadCanvas",
            success: (res2) => {
              common_vendor.index.saveImageToPhotosAlbum({
                filePath: res2.tempFilePath,
                success: () => {
                  common_vendor.index.showToast({
                    title: "保存成功",
                    icon: "success"
                  });
                },
                fail: () => {
                  common_vendor.index.showToast({
                    title: "保存失败",
                    icon: "none"
                  });
                }
              });
            }
          });
        });
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: qrCodeImage.value,
        b: common_vendor.t(userCount.value),
        c: !userImage.value
      }, !userImage.value ? {
        d: common_vendor.o(chooseImage)
      } : {}, {
        e: userImage.value
      }, userImage.value ? {
        f: userImage.value,
        g: `translate(${imageX.value}px, ${imageY.value}px) scale(${imageScale.value})`,
        h: imageWidth.value + "px",
        i: imageHeight.value + "px",
        j: common_vendor.o(onTouchStart),
        k: common_vendor.o(onTouchMove),
        l: common_vendor.o(onTouchEnd)
      } : {}, {
        m: userImage.value
      }, userImage.value ? {
        n: common_vendor.o(chooseImage)
      } : {}, {
        o: `url(${backgroundImage.value})`,
        p: common_vendor.o(downloadImage)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3cdd96a5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/enrollment/enrollment.js.map
