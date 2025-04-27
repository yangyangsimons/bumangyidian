<script>
  export default {
    onLaunch: function () {
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
