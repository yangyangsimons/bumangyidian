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
              // 规范化参数编码：避免对已经 URL 编码的值(尤其是 q)重复编码
              const normalizeParam = (key, val) => {
                if (val === undefined || val === null) return undefined
                if (typeof val !== 'string')
                  return encodeURIComponent(String(val))
                // 对 q 参数（通常是外部落地 URL 被官方已编码一次）做“多次解码 -> 单次编码”归一
                if (key === 'q') {
                  let tmp = val
                  for (let i = 0; i < 3; i++) {
                    try {
                      const dec = decodeURIComponent(tmp)
                      // 如果 decode 后再 encode 回来与原值相同，说明只有一层，停止
                      if (encodeURIComponent(dec) === tmp) {
                        tmp = dec // 先还原原始
                        break
                      }
                      tmp = dec
                    } catch (e) {
                      break
                    }
                  }
                  return encodeURIComponent(tmp)
                }
                // 通用参数：如果看起来已经是一次完整编码（decode 再 encode 一致），直接原样返回；否则编码
                try {
                  const dec = decodeURIComponent(val)
                  if (encodeURIComponent(dec) === val) {
                    // val 是标准一次编码，直接用 val
                    return val
                  }
                } catch (e) {
                  // 非法的编码片段，按未编码处理
                }
                return encodeURIComponent(val)
              }
              const queryParts = Object.keys(opts)
                .map((k) => {
                  const nv = normalizeParam(k, opts[k])
                  return nv !== undefined ? `${k}=${nv}` : ''
                })
                .filter(Boolean)
              const queryStr = queryParts.join('&')
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
