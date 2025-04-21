"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("../utils/config.js");
const stores_barrage = require("./barrage.js");
const stores_messageProcessor = require("./messageProcessor.js");
const useWebSocketStore = common_vendor.defineStore("websocket", () => {
  const messages = common_vendor.ref([]);
  let socketTask = null;
  const isConnected = common_vendor.ref(false);
  const isConnecting = common_vendor.ref(false);
  const messageQueue = common_vendor.ref([]);
  const lastCloseTime = common_vendor.ref(0);
  stores_barrage.useBarrageStore();
  const messageProcessor = stores_messageProcessor.useMessageProcessorStore();
  const ensureSocketClosed = () => {
    return new Promise((resolve) => {
      if (!socketTask) {
        resolve();
        return;
      }
      if (isConnected.value) {
        socketTask.close({
          success: () => {
            common_vendor.index.__f__("log", "at stores/websocket.js:33", "WebSocket正常关闭");
            socketTask = null;
            isConnected.value = false;
            lastCloseTime.value = Date.now();
            resolve();
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at stores/websocket.js:40", "WebSocket关闭失败", err);
            socketTask = null;
            isConnected.value = false;
            lastCloseTime.value = Date.now();
            resolve();
          }
        });
      } else {
        socketTask = null;
        isConnected.value = false;
        lastCloseTime.value = Date.now();
        resolve();
      }
    });
  };
  const connect = async () => {
    if (isConnected.value && socketTask) {
      common_vendor.index.__f__("log", "at stores/websocket.js:61", "WebSocket已经连接，无需重连");
      return;
    }
    if (isConnecting.value) {
      common_vendor.index.__f__("log", "at stores/websocket.js:67", "WebSocket正在连接中，请稍候");
      throw new Error("连接正在进行中，请勿重复连接");
    }
    const now = Date.now();
    if (now - lastCloseTime.value < 1e3) {
      common_vendor.index.__f__("log", "at stores/websocket.js:74", "连接过于频繁，请稍后再试");
      throw new Error("连接过于频繁，请稍后再试");
    }
    try {
      isConnecting.value = true;
      await ensureSocketClosed();
      return new Promise((resolve, reject) => {
        const token = common_vendor.index.getStorageSync("token");
        common_vendor.index.getNetworkType({
          success: function(res) {
            common_vendor.index.__f__("log", "at stores/websocket.js:90", "当前网络类型:", res.networkType);
            if (res.networkType === "none") {
              isConnecting.value = false;
              reject(new Error("当前无网络连接"));
              return;
            }
            try {
              socketTask = common_vendor.index.connectSocket({
                url: `${utils_config.wsUrl}/content/ws`,
                header: { Authorization: `bearer ${token}` },
                success: () => {
                  common_vendor.index.__f__("log", "at stores/websocket.js:103", "WebSocket连接请求已发送");
                },
                fail: (err) => {
                  common_vendor.index.__f__("error", "at stores/websocket.js:106", "WebSocket连接请求失败", err);
                  isConnecting.value = false;
                  reject(err);
                }
              });
              const connectTimeout = setTimeout(() => {
                if (!isConnected.value && isConnecting.value) {
                  common_vendor.index.__f__("error", "at stores/websocket.js:115", "WebSocket连接超时");
                  if (socketTask) {
                    socketTask.close();
                    socketTask = null;
                  }
                  isConnecting.value = false;
                  reject(new Error("WebSocket连接超时"));
                }
              }, 1e4);
              socketTask.onOpen(() => {
                common_vendor.index.__f__("log", "at stores/websocket.js:126", "WebSocket连接已打开");
                clearTimeout(connectTimeout);
                isConnected.value = true;
                isConnecting.value = false;
                setTimeout(() => {
                  while (messageQueue.value.length > 0) {
                    _doSendMessage(messageQueue.value.shift());
                  }
                  resolve();
                }, 300);
              });
              socketTask.onMessage((res2) => {
                common_vendor.index.__f__("log", "at stores/websocket.js:142", "WebSocket收到消息:", res2.data);
                messageProcessor.processMessage(res2.data);
              });
              socketTask.onError((err) => {
                common_vendor.index.__f__("error", "at stores/websocket.js:148", "WebSocket发生错误:", err);
                clearTimeout(connectTimeout);
                isConnected.value = false;
                isConnecting.value = false;
                socketTask = null;
                reject(err);
              });
              socketTask.onClose(() => {
                common_vendor.index.__f__("log", "at stores/websocket.js:157", "WebSocket连接已关闭");
                isConnected.value = false;
                isConnecting.value = false;
                socketTask = null;
              });
            } catch (error) {
              common_vendor.index.__f__("error", "at stores/websocket.js:163", "创建WebSocket连接出错:", error);
              isConnecting.value = false;
              reject(error);
            }
          },
          fail: function(err) {
            common_vendor.index.__f__("error", "at stores/websocket.js:169", "获取网络类型失败:", err);
            isConnecting.value = false;
            reject(new Error("无法获取网络类型"));
          }
        });
      });
    } catch (error) {
      isConnecting.value = false;
      throw error;
    }
  };
  const _doSendMessage = (message) => {
    return new Promise((resolve, reject) => {
      if (!socketTask || !isConnected.value) {
        reject(new Error("WebSocket未连接"));
        return;
      }
      socketTask.send({
        data: JSON.stringify(message),
        success: () => {
          common_vendor.index.__f__("log", "at stores/websocket.js:191", "WebSocket消息发送成功");
          resolve();
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at stores/websocket.js:195", "WebSocket消息发送失败", err);
          reject(err);
        }
      });
    });
  };
  const sendMessage = async (message) => {
    if (!isConnected.value || !socketTask) {
      common_vendor.index.__f__("log", "at stores/websocket.js:205", "WebSocket未连接，消息加入队列");
      messageQueue.value.push(message);
      return Promise.reject(new Error("WebSocket未连接，消息加入队列"));
    }
    return _doSendMessage(message);
  };
  const close = async () => {
    common_vendor.index.__f__("log", "at stores/websocket.js:214", "关闭WebSocket连接");
    return ensureSocketClosed();
  };
  return { messages, connect, sendMessage, close, isConnected, isConnecting };
});
exports.useWebSocketStore = useWebSocketStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/websocket.js.map
