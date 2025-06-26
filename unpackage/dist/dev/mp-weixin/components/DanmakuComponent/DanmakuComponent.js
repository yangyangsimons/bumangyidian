"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "DanmakuComponent",
  setup(__props, { expose: __expose }) {
    common_vendor.ref(true);
    const fetchDataTime = common_vendor.ref(0);
    const isRequesting = common_vendor.ref(false);
    const mockDanmakuData = common_vendor.ref(["还没有弹幕数据，快来发一条弹幕吧！"]);
    const getTimeMinusMinutes = (minutesToSubtract = 1) => {
      const date = new Date(Date.now() - minutesToSubtract * 60 * 1e3);
      return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + " " + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0");
    };
    const divideIntoGroups = (array, groupCount = 4) => {
      const groups = Array.from({ length: groupCount }, () => []);
      array.forEach((item, index) => {
        const groupIndex = index % groupCount;
        groups[groupIndex].push(item);
      });
      return groups;
    };
    const tracks = common_vendor.ref([[], [], [], []]);
    const danmakuQueue = common_vendor.ref([]);
    const currentBatchIndex = common_vendor.ref(0);
    const containerWidth = common_vendor.ref(750);
    const isLastDanmakuShown = common_vendor.ref(false);
    let danmakuId = 0;
    const createDanmaku = (content) => {
      const id = ++danmakuId;
      return {
        id,
        content,
        x: containerWidth.value,
        // 从右侧开始
        isMoving: false,
        startTime: Date.now()
      };
    };
    const getDanmakuStyle = (danmaku) => {
      return {
        transform: `translateX(${danmaku.x}rpx)`,
        transition: danmaku.isMoving ? "transform 6s linear" : "none"
      };
    };
    const fetchDanmakuData = async () => {
      if (isRequesting.value) {
        common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:106", "正在请求中，跳过重复请求");
        return;
      }
      isRequesting.value = true;
      common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:111", "正在获取新的弹幕数据...");
      try {
        const response = await utils_request.request(
          `${utils_config.baseUrl}/bullet_comment/query?start_time=${fetchDataTime.value}`,
          {},
          {},
          "GET"
        );
        if (response.code == 0) {
          common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:123", "获取弹幕数据成功:", response.data);
          const data = response.data;
          if (data && data.length > 0) {
            const comments = data.map((item) => item.comment);
            mockDanmakuData.value = comments;
            const maxCreatedAt = data.filter((item) => item.performance_id === 0).reduce(
              (max, current) => current.created_at > max ? current.created_at : max,
              ""
            );
            fetchDataTime.value = maxCreatedAt || getTimeMinusMinutes(1);
            common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:142", "最新的请求时间:", maxCreatedAt || "没有找到数据");
            currentBatchIndex.value = 0;
            const groups = divideIntoGroups(mockDanmakuData.value);
            const newData = groups[0];
            common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:151", `获取新的弹幕数据，第1批:`, newData);
            newData.forEach((content) => {
              danmakuQueue.value.push(createDanmaku(content));
            });
            currentBatchIndex.value++;
            isLastDanmakuShown.value = false;
            common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:161", "弹幕队列更新后长度:", danmakuQueue.value.length);
          } else {
            common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:164", "没有新的弹幕数据，等待中...");
            setTimeout(async () => {
              isRequesting.value = false;
              await fetchDanmakuData();
            }, 5e3);
            return;
          }
        } else {
          common_vendor.index.__f__("error", "at components/DanmakuComponent/DanmakuComponent.vue:172", "获取弹幕数据失败:", response);
          setTimeout(async () => {
            isRequesting.value = false;
            await fetchDanmakuData();
          }, 5e3);
          return;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/DanmakuComponent/DanmakuComponent.vue:181", "请求弹幕数据异常:", error);
        setTimeout(async () => {
          isRequesting.value = false;
          await fetchDanmakuData();
        }, 5e3);
        return;
      } finally {
        isRequesting.value = false;
      }
    };
    const findAvailableTrack = () => {
      for (let i = 0; i < tracks.value.length; i++) {
        if (tracks.value[i].length === 0) {
          return i;
        }
      }
      let minTrack = 0;
      let minCount = tracks.value[0].length;
      for (let i = 1; i < tracks.value.length; i++) {
        if (tracks.value[i].length < minCount) {
          minCount = tracks.value[i].length;
          minTrack = i;
        }
      }
      return minTrack;
    };
    const showDanmaku = () => {
      if (danmakuQueue.value.length === 0) {
        common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:219", "弹幕队列为空");
        const groups = divideIntoGroups(mockDanmakuData.value);
        if (currentBatchIndex.value < groups.length) {
          const batchIndex = currentBatchIndex.value;
          const newData = groups[batchIndex];
          common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:228", `使用本地数据第${currentBatchIndex.value + 1}批:`, newData);
          newData.forEach((content) => {
            danmakuQueue.value.push(createDanmaku(content));
          });
          currentBatchIndex.value++;
          common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:235", "本地批次弹幕队列更新后长度:", danmakuQueue.value.length);
        } else if (!isLastDanmakuShown.value && !isRequesting.value) {
          isLastDanmakuShown.value = true;
          common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:239", "本地数据已用完，准备获取新数据");
          setTimeout(async () => {
            await fetchDanmakuData();
          }, 1e3);
        }
        return;
      }
      const trackIndex = findAvailableTrack();
      const danmaku = danmakuQueue.value.shift();
      common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:250", "显示弹幕:", danmaku.content, "轨道:", trackIndex);
      tracks.value[trackIndex].push(danmaku);
      common_vendor.nextTick$1(async () => {
        setTimeout(() => {
          danmaku.isMoving = true;
          danmaku.x = -800;
        }, 50);
      });
      setTimeout(() => {
        const track = tracks.value[trackIndex];
        const index = track.findIndex((item) => item.id === danmaku.id);
        if (index !== -1) {
          track.splice(index, 1);
        }
      }, 8e3);
    };
    let showTimer = null;
    const startDanmaku = () => {
      common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:280", "启动弹幕展示");
      if (showTimer) {
        clearInterval(showTimer);
      }
      showTimer = setInterval(() => {
        showDanmaku();
      }, 1e3);
    };
    const stopDanmaku = () => {
      common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:291", "停止弹幕展示");
      if (showTimer) {
        clearInterval(showTimer);
        showTimer = null;
      }
    };
    const init = async () => {
      common_vendor.index.__f__("log", "at components/DanmakuComponent/DanmakuComponent.vue:300", "弹幕组件初始化");
      fetchDataTime.value = getTimeMinusMinutes(1);
      await fetchDanmakuData();
      await common_vendor.nextTick$1();
      startDanmaku();
      setTimeout(() => {
        showDanmaku();
      }, 500);
    };
    common_vendor.onMounted(() => {
      init();
    });
    common_vendor.onUnmounted(() => {
      stopDanmaku();
    });
    __expose({
      startDanmaku,
      stopDanmaku,
      fetchDanmakuData
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(tracks.value, (track, trackIndex, i0) => {
          return {
            a: common_vendor.f(track, (danmaku, k1, i1) => {
              return {
                a: common_vendor.t(danmaku.content),
                b: danmaku.id,
                c: common_vendor.s(getDanmakuStyle(danmaku))
              };
            }),
            b: trackIndex
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9c727690"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/DanmakuComponent/DanmakuComponent.js.map
