<script>
  export default {
    onLaunch: function () {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log('版本更新的回调', res.hasUpdate)
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success(res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          },
        })
      })

      updateManager.onUpdateFailed(function () {
        // 新版本下载失败
      })

      console.log('App Launch')
      // 判断用户是否授权
      const token = uni.getStorageSync('token')
      if (!token) {
        console.log('游客身份体验')
        //游客身份体验
        uni.setStorage({
          key: 'tourist',
          data: true,
          success: (result) => {
            console.log('游客身份存储成功:', result)
          },
        })
        //新手引导页设置token
        uni.setStorage({
          key: 'isFirst',
          data: true,
          success: (result) => {
            console.log('首次使用存储成功:', result)
            uni.reLaunch({
              url: '/pages/index/index',
            })
          },
          fail: (error) => {
            console.log('首次使用存储失败:', error)
            uni.showToast({
              title: '游客身份体验失败',
              icon: 'none',
            })
          },
        })
      } else {
        uni.request({
          url: 'https://mang.5gradio.com.cn:443/user/user_info',
          header: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          method: 'GET',
          success: (res) => {
            console.log('获取用户信息', res)
            if (res.data.code === 0 && res.data.data.birth) {
              console.log('用户已注册生日是：', res.data.data.birth)
              uni.reLaunch({
                url: '/pages/index/index',
              })
            } else if (res.data.code === 0 && !res.data.data.birth) {
              console.log('用户未注册')
              uni.reLaunch({
                url: '/pages/hello/hello',
              })
            } else {
              uni.reLaunch({
                url: '/pages/login/login',
              })
            }
          },
          fail: (error) => {},
        })
        // uni.reLaunch({
        //   url: '/pages/questionnaire/questionnaire',
        // })
      }
    },
    onShow: function () {
      console.log('App Show')
    },
    onHide: function () {
      console.log('App Hide')
    },
  }
</script>

<style>
  /*每个页面公共css */
</style>
