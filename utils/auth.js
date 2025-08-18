// utils/auth.js
export const checkTokenAndNavigate = (callback, options = {}) => {
  const token = uni.getStorageSync('token')

  if (!token) {
    const {
      title = '',
      content = '登录后体验完整功能',
      showToast = false,
      toastMessage = '请先登录',
    } = options

    if (showToast) {
      uni.showToast({
        title: toastMessage,
        icon: 'none',
      })
      return false
    }

    uni.showModal({
      title,
      content,
      success: async (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          // 这里你可能需要根据实际情况调整这些store的引用方式
          // await wsStore.close()
          // audioPlayerStore.stopAllAudio()
          // barrageStore.clearMessages()

          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login',
            })
          }, 1000)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
    })
    return false
  }

  // 如果有token，执行回调函数
  if (callback && typeof callback === 'function') {
    callback(token)
  }
  return true
}

// 简化版本，只检查token不处理跳转
export const hasValidToken = () => {
  const token = uni.getStorageSync('token')
  return !!token
}
