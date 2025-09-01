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
          // 记录当前页面用于登录后返回
          try {
            const pages = getCurrentPages()
            if (pages && pages.length) {
              const current = pages[pages.length - 1]
              // 组合当前路由及其查询参数
              let route = '/' + current.route
              const opts =
                current.options ||
                (current.$page && current.$page.options) ||
                {}
              const queryStr = Object.keys(opts)
                .map((k) => `${k}=${encodeURIComponent(opts[k])}`)
                .join('&')
              if (queryStr) route += `?${queryStr}`
              // 避免把登录页自己存进去
              if (!route.includes('/pages/login/login')) {
                uni.setStorageSync('postLoginRedirect', route)
              }
            }
          } catch (e) {
            console.log('记录返回路径失败', e)
          }
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
