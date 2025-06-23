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
    common_vendor.onMounted(() => {
      getUserCount();
    });
    const getUserCount = async () => {
      try {
        userCount.value = 8888;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/enrollment/enrollment.vue:89", "获取用户数量失败:", error);
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
    const onImageChange = (e) => {
      imageX.value = e.detail.x;
      imageY.value = e.detail.y;
    };
    const onImageScale = (e) => {
      imageScale.value = e.detail.scale;
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
            imageX.value,
            imageY.value + 100,
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
        g: imageWidth.value + "px",
        h: imageHeight.value + "px",
        i: imageX.value,
        j: imageY.value,
        k: common_vendor.o(onImageChange),
        l: common_vendor.o(onImageScale)
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
