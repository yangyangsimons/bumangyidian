import { defineStore } from 'pinia'
import { ref } from 'vue'
import { wsUrl } from '../utils/config'
import { useBarrageStore } from './barrage'
import { useMessageProcessorStore } from './messageProcessor'

export const useWebSocketStore = defineStore('websocket', () => {
  const messages = ref([])
  let socketTask = null
  const isConnected = ref(false)
  const isConnecting = ref(false) // 新增：标记是否正在连接中
  const messageQueue = ref([]) // 用于存储连接前的消息

  // 新增：上一次关闭的时间戳，用于防止频繁切换
  const lastCloseTime = ref(0)

  // 在store内部获取barrageStore实例
  const barrageStore = useBarrageStore()
  const messageProcessor = useMessageProcessorStore()

  // 确保WebSocket完全关闭
  const ensureSocketClosed = () => {
    return new Promise((resolve) => {
      if (!socketTask) {
        resolve()
        return
      }

      // 如果已连接状态，正常关闭
      if (isConnected.value) {
        socketTask.close({
          success: () => {
            console.log('WebSocket正常关闭')
            socketTask = null
            isConnected.value = false
            lastCloseTime.value = Date.now()
            resolve()
          },
          fail: (err) => {
            console.error('WebSocket关闭失败', err)
            // 即使关闭失败，也认为连接已关闭
            socketTask = null
            isConnected.value = false
            lastCloseTime.value = Date.now()
            resolve()
          },
        })
      } else {
        // 如果不是已连接状态，直接置空
        socketTask = null
        isConnected.value = false
        lastCloseTime.value = Date.now()
        resolve()
      }
    })
  }

  const connect = async () => {
    // 如果已经连接，直接返回
    if (isConnected.value && socketTask) {
      console.log('WebSocket已经连接，无需重连')
      return
    }

    // 如果正在连接中，等待连接完成
    if (isConnecting.value) {
      console.log('WebSocket正在连接中，请稍候')
      throw new Error('连接正在进行中，请勿重复连接')
    }

    // 检查上次关闭时间，防止频繁连接
    const now = Date.now()
    if (now - lastCloseTime.value < 1000) {
      console.log('连接过于频繁，请稍后再试')
      throw new Error('连接过于频繁，请稍后再试')
    }

    try {
      isConnecting.value = true

      // 确保之前的连接已完全关闭
      await ensureSocketClosed()

      return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token')

        // 检查当前WebSocket连接数量
        uni.getNetworkType({
          success: function (res) {
            console.log('当前网络类型:', res.networkType)
            if (res.networkType === 'none') {
              isConnecting.value = false
              reject(new Error('当前无网络连接'))
              return
            }

            // 创建新的WebSocket连接
            try {
              socketTask = uni.connectSocket({
                url: `${wsUrl}/content/ws`,
                header: {
                  Authorization: `bearer ${token}`,
                  is_yk: token ? '0' : '1',
                },
                success: () => {
                  console.log('WebSocket连接请求已发送')
                },
                fail: (err) => {
                  console.error('WebSocket连接请求失败', err)
                  isConnecting.value = false
                  reject(err)
                },
              })

              // 设置连接超时
              const connectTimeout = setTimeout(() => {
                if (!isConnected.value && isConnecting.value) {
                  console.error('WebSocket连接超时')
                  if (socketTask) {
                    socketTask.close()
                    socketTask = null
                  }
                  isConnecting.value = false
                  reject(new Error('WebSocket连接超时'))
                }
              }, 10000) // 10秒超时

              socketTask.onOpen(() => {
                console.log('WebSocket连接已打开')
                clearTimeout(connectTimeout)
                isConnected.value = true
                isConnecting.value = false

                // 延迟一点再处理消息队列，确保连接稳定
                setTimeout(() => {
                  // 处理排队的消息
                  while (messageQueue.value.length > 0) {
                    _doSendMessage(messageQueue.value.shift())
                  }
                  resolve()
                }, 300)
              })

              socketTask.onMessage((res) => {
                console.log('WebSocket收到消息:', res.data)
                // 交由消息处理器处理
                messageProcessor.processMessage(res.data)
              })

              socketTask.onError((err) => {
                console.error('WebSocket发生错误:', err)
                clearTimeout(connectTimeout)
                isConnected.value = false
                isConnecting.value = false
                socketTask = null
                reject(err)
              })

              socketTask.onClose(() => {
                console.log('WebSocket连接已关闭......')
                isConnected.value = false
                isConnecting.value = false
                socketTask = null
              })
            } catch (error) {
              console.error('创建WebSocket连接出错:', error)
              isConnecting.value = false
              reject(error)
            }
          },
          fail: function (err) {
            console.error('获取网络类型失败:', err)
            isConnecting.value = false
            reject(new Error('无法获取网络类型'))
          },
        })
      })
    } catch (error) {
      isConnecting.value = false
      throw error
    }
  }

  const _doSendMessage = (message) => {
    return new Promise((resolve, reject) => {
      if (!socketTask || !isConnected.value) {
        reject(new Error('WebSocket未连接'))
        return
      }

      socketTask.send({
        data: JSON.stringify(message),
        success: () => {
          console.log('WebSocket消息发送成功')
          resolve()
        },
        fail: (err) => {
          console.error('WebSocket消息发送失败', err)
          reject(err)
        },
      })
    })
  }

  const sendMessage = async (message) => {
    // 如果未连接，将消息加入队列
    if (!isConnected.value || !socketTask) {
      console.log('WebSocket未连接，消息加入队列')
      messageQueue.value.push(message)
      return Promise.reject(new Error('WebSocket未连接，消息加入队列'))
    }

    return _doSendMessage(message)
  }

  const close = async () => {
    return ensureSocketClosed()
  }

  return { messages, connect, sendMessage, close, isConnected, isConnecting }
})
