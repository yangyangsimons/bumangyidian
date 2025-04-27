<template>
  <view class="login-container">
    <view class="login-bg">
      <image
        src="../../static/login-bg.png"
        class="login-image"
        mode="aspectFill"
      />
    </view>
    <view class="header">
      <view class="logo-container">
        <image class="logo" src="../../static/logo.png" />
      </view>
      <image src="../../static/logo-title.png" class="title">不芒一点</image>
      <view class="describe"> <text>为你世界加一点</text> </view>
    </view>
    <view class="main">
      <button v-if="!agreeProtocol" class="wx-login" @click="clickBtn">
        <image class="wechat-icon" src="../../static/wechat.png" />
        <text class="wechat-text">手机号登录</text>
      </button>
      <button
        v-else
        class="wechat"
        open-type="getPhoneNumber"
        @getphonenumber="handleWechatLogin"
      >
        <image class="wechat-icon" src="../../static/wechat.png" />
        <text class="wechat-text">手机号登录</text>
      </button>
      <view class="skip" @click="unLoginTry">
        <text>不登录，跳过</text>
        <image
          class="skip-icon"
          src="../../static/skip.png"
          mode="scaleToFill"
        />
      </view>
    </view>
    <view class="footer">
      <view class="radio-wrapper" @click="agreeProtocol = !agreeProtocol">
        <radio
          :checked="agreeProtocol"
          class="agreement-checkbox"
          :color="'#A7EE27'"
          :checked-color="'#A7EE27'"
          style="transform: scale(0.55)"
          catchclick="return"
        />
      </view>
      <text class="agreement">
        <text class="agreement-text">我已阅读同意不芒一点</text>
        <text class="agreement-link" @click="openAgreement('user')"
          >《用户协议》</text
        >
        <text class="agreement-text">和</text>
        <text class="agreement-link" @click="openAgreement('privacy')"
          >《隐私政策》</text
        >
      </text>
    </view>
  </view>
</template>

<script setup>
  import { ref } from 'vue'
  import { baseUrl } from '../../utils/config'
  import { useUserStore } from '@/stores/user'
  import { storeToRefs } from 'pinia'
  import request from '@/utils/request'
  const userStore = useUserStore()
  const { isLoggedIn } = storeToRefs(userStore)
  const agreeProtocol = ref(false) // 协议同意状态

  // 微信登录和手机号的处理
  const unLoginTry = async () => {
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
  }
  const token = ref('')
  // 处理协议/隐私政策点击
  const openAgreement = (type) => {
    // 根据类型确定跳转的URL
    const url =
      type === 'user'
        ? '/pages/agreement/agreement?type=user'
        : '/pages/agreement/agreement?type=privacy'

    // 跳转到协议展示页面
    uni.navigateTo({ url })
  }
  const clickBtn = () => {
    console.log('点击了微信登录按钮')
    if (!agreeProtocol.value) {
      return uni.showToast({
        title: '请先阅读并同意协议',
        icon: 'none',
      })
    }
  }
  const handleWechatLogin = async (e) => {
    const phoneCode = e.detail.code
    if (phoneCode === undefined) {
      return uni.showToast({
        title: '获取手机号登录',
        icon: 'none',
      })
    }
    console.log('获取到的手机号code', phoneCode)
    if (!agreeProtocol.value) {
      return uni.showToast({
        title: '请先阅读并同意协议',
        icon: 'none',
      })
    }

    // 微信登录
    try {
      // 显示加载中
      // uni.showLoading({ title: '登录中...', mask: true })
      const loginRes = await wx.login()
      console.log('登录返回', loginRes.code)
      const serverRes = await request(`${baseUrl}/user/code2token`, 'POST', {
        code: loginRes.code,
      })
      console.log('服务器返回', serverRes)
      // 存储token和用户信息
      // userStore.setUserInfo(data.userInfo)
      token.value = serverRes.data.token
      userStore.setToken(serverRes.token)
      console.log('登录成功', serverRes.data)
      console.log('token', serverRes.data.token)

      uni.setStorage({
        key: 'token',
        data: serverRes.data.token,
        success: (result) => {
          console.log('token存储成功', result)
          //查看用户是否已经注册过
        },
        fail: (error) => {
          console.log('token存储失败', error)
        },
      })

      //判断用户是否已经注册
      const registerResult = await uni.request({
        url: 'https://mang.5gradio.com.cn:443/user/user_info',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        method: 'GET',
      })
      console.log('获取用户注册信息', registerResult)
      if (registerResult.data.code === 0 && registerResult.data.data.birth) {
        console.log('用户已注册生日是：', registerResult.data.data.birth)
        uni.reLaunch({
          url: '/pages/index/index',
        })
      } else {
        // 用户未注册走注册流程
        if (phoneCode) {
          console.log('获取到的手机号code', e.detail.code)
          await uni.request({
            url: `${baseUrl}/user/update_phone`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${serverRes.data.token}`,
            },
            data: {
              code: phoneCode,
            },
          })
          // await request(`${baseUrl}/user/update_phone`, 'POST', {
          //   code: e.detail.code,
          // })
          uni.reLaunch({ url: '/pages/hello/hello' })
        } else {
          console.log('获取手机号失败', e.detail.errMsg)
          return uni.showToast({
            title: '获取手机号失败',
            icon: 'none',
            duration: 2000,
          })
        }
      }
    } catch (error) {
      console.log('error', error)
      uni.showToast({
        title: '登录失败',
        icon: 'none',
      })
    } finally {
      uni.hideLoading()
    }
  }
</script>

<style lang="scss" scoped>
  .login-container {
    position: fixed;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    .login-bg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      .login-image {
        width: 100%;
        height: 100%;
      }
    }
    .header {
      // border: 1px solid red;
      position: absolute;
      top: 456rpx;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 350rpx;
      height: 306rpx;
      .logo-container {
        width: 142rpx;
        height: 142rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 42rpx;
        background: rgba(255, 255, 255, 1);
        .logo {
          width: 72rpx;
          height: 96rpx;
          // border-radius: 42rpx;
        }
      }

      .title {
        width: 170rpx;
        height: 40rpx;
      }
      .describe {
        // border: 1px solid red;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: right;
        font-size: 24rpx;
        font-weight: 300;
        color: rgba(0, 0, 0, 1);
        letter-spacing: 21rpx;
        text {
          margin-left: 21rpx;
        }
      }
    }
    .main {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 686rpx;
      height: 220rpx;
      position: absolute;
      bottom: 200rpx;
      font-size: 28rpx;
      font-weight: 700;
      wx-button {
        border: none;
      }
      wx-button:after {
        display: none;
      }
      .wechat {
        width: 686rpx;
        height: 90rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 42rpx;
        background: linear-gradient(
          233.19deg,
          rgba(211, 248, 79, 1) 0%,
          rgba(167, 238, 39, 1) 100%
        );
        .wechat-text {
          font-size: 28rpx;
          font-weight: 700;
          color: rgba(26, 28, 30, 1);
        }
      }
      .wx-login {
        width: 686rpx;
        height: 90rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 42rpx;
        background: linear-gradient(
          233.19deg,
          rgba(211, 248, 79, 1) 0%,
          rgba(167, 238, 39, 1) 100%
        );
        .wechat-text {
          font-size: 28rpx;
          font-weight: 700;
          color: rgba(26, 28, 30, 1);
        }
      }
      .phone {
        width: 100%;
        height: 90rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 42rpx;
        background: rgba(26, 28, 30, 1);
        color: rgba(167, 238, 39, 1);
        font-size: 28rpx;
        font-weight: 700;
      }
      image {
        width: 28rpx;
        height: 29rpx;
        margin-right: 8rpx;
        margin-bottom: 3rpx;
      }
      .skip {
        width: 300rpx;
        // border: 1px solid red;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 28rpx;
        letter-spacing: 3rpx;
        color: rgba(26, 28, 30, 0.75);
        margin-top: 34rpx;
        .skip-icon {
          width: 12rpx;
          height: 20rpx;
          margin-left: 15rpx;
        }
      }
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 710rpx;
      position: absolute;
      bottom: 140rpx;
      font-size: 28rpx;
      color: rgba(152, 153, 153, 1);
      font-weight: 400;
      .radio-wrapper {
        padding: 10rpx; /* 扩大点击区域 */
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .agreement-checkbox {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        margin-right: 20rpx;
        display: flex;
      }
      .agreement-link {
        color: rgba(167, 238, 39, 1);
      }
    }
  }
</style>
