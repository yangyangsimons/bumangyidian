"use strict";
const common_vendor = require("../common/vendor.js");
const stores_messageProcessor = require("./messageProcessor.js");
const useBarrageStore = common_vendor.defineStore("barrage", {
  state: () => ({
    messages: [],
    // 用户跟踪当前流式消息的ID
    currentStreamingMessageId: null
  }),
  actions: {
    addMessage(payload) {
      const messageId = payload.id || Date.now();
      if (payload.isStreaming) {
        this.currentStreamingMessageId = messageId;
      }
      this.messages.push({
        ...payload,
        id: messageId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      common_vendor.index.__f__("log", "at stores/barrage.js:25", "所有消息", this.messages);
      return messageId;
    },
    appendToStreamingMessage(text) {
      if (!this.currentStreamingMessageId) {
        this.startNewStreamingMessage();
      }
      const msgIndex = this.messages.findIndex(
        (msg) => msg.id === this.currentStreamingMessageId
      );
      if (msgIndex !== -1) {
        this.messages[msgIndex].content += text;
      } else {
        this.currentStreamingMessageId = this.addMessage({
          type: "ai",
          content: text,
          isStreaming: true
        });
      }
    },
    // 完成流式消息
    finishStreamingMessage(fullText) {
      if (this.currentStreamingMessageId) {
        const msgIndex = this.messages.findIndex(
          (msg) => msg.id === this.currentStreamingMessageId
        );
        if (msgIndex !== -1 && fullText) {
          this.messages[msgIndex].content = fullText;
        }
        if (msgIndex !== -1) {
          this.messages[msgIndex].isStreaming = false;
        }
      }
      this.currentStreamingMessageId = null;
    },
    startNewStreamingMessage() {
      this.currentStreamingMessageId = this.addMessage({
        type: "ai",
        content: "",
        isStreaming: true
      });
      return this.currentStreamingMessageId;
    },
    // 清除所有消息
    clearMessages() {
      this.messages = [];
      this.currentStreamingMessageId = null;
      const messageProcessorStore = stores_messageProcessor.useMessageProcessorStore();
      messageProcessorStore.resetProcessor();
    },
    // 更新特定消息内容
    updateMessageContent(messageId, content) {
      const msgIndex = this.messages.findIndex((msg) => msg.id === messageId);
      if (msgIndex !== -1) {
        this.messages[msgIndex].content = content;
      }
    },
    // 查找特定类型的消息
    findMessageByType(type) {
      return this.messages.find((msg) => msg.type === type);
    }
  }
});
exports.useBarrageStore = useBarrageStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/barrage.js.map
