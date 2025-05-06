// stores/barrage.js
import { defineStore } from 'pinia'
import { useMessageProcessorStore } from './messageProcessor'

export const useBarrageStore = defineStore('barrage', {
  state: () => ({
    messages: [],

    // 用户跟踪当前流式消息的ID
    currentStreamingMessageId: null,
  }),
  actions: {
    addMessage(payload) {
      const messageId = payload.id || Date.now()
      // 如果消息类型是流式消息
      if (payload.isStreaming) {
        this.currentStreamingMessageId = messageId
      }

      this.messages.push({
        ...payload,
        id: messageId,
        timestamp: new Date().toISOString(),
      })
      console.log('所有消息', this.messages)
      return messageId // 返回消息ID
    },

    appendToStreamingMessage(text) {
      if (!this.currentStreamingMessageId) {
        // 如果没有正在进行的流式消息，创建一个新的
        this.startNewStreamingMessage()
      }

      const msgIndex = this.messages.findIndex(
        (msg) => msg.id === this.currentStreamingMessageId
      )

      if (msgIndex !== -1) {
        this.messages[msgIndex].content += text
      } else {
        // 如果找不到消息，创建新的
        this.currentStreamingMessageId = this.addMessage({
          type: 'ai',
          content: text,
          isStreaming: true,
        })
      }
    },
    // 完成流式消息
    finishStreamingMessage(fullText) {
      if (this.currentStreamingMessageId) {
        const msgIndex = this.messages.findIndex(
          (msg) => msg.id === this.currentStreamingMessageId
        )
        if (msgIndex !== -1 && fullText) {
          // 替换为完整内容
          this.messages[msgIndex].content = fullText
        }
        // 标记不再是流式消息
        if (msgIndex !== -1) {
          this.messages[msgIndex].isStreaming = false
        }
      }
      this.currentStreamingMessageId = null
    },
    startNewStreamingMessage() {
      // 创建一个新的流式消息
      this.currentStreamingMessageId = this.addMessage({
        type: 'ai',
        content: '',
        isStreaming: true,
      })
      return this.currentStreamingMessageId
    },
    // 清除所有消息
    clearMessages() {
      this.messages = []
      this.currentStreamingMessageId = null
      // 重置 messageProcessor 中的状态
      const messageProcessorStore = useMessageProcessorStore()
      messageProcessorStore.resetProcessor()
    },

    // 更新特定消息内容
    updateMessageContent(messageId, content) {
      const msgIndex = this.messages.findIndex((msg) => msg.id === messageId)
      if (msgIndex !== -1) {
        this.messages[msgIndex].content = content
      }
    },

    // 查找特定类型的消息
    findMessageByType(type) {
      return this.messages.find((msg) => msg.type === type)
    },
  },
})
