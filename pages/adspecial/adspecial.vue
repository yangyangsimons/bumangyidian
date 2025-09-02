<template>
  <view class="adSpecial">
    <image :src="mainsrc" mode="scaleToFill" class="main-image" />
    <image
      src="https://imango-school-public.obs.cn-south-1.myhuaweicloud.com:443/activity/join-btn.png"
      mode="scaleToFill"
      class="join-button"
      @click="reportSource"
    />

    <view class="popout" v-if="showPop">
      <view class="popout-inner" @click.stop>
        <image :src="popoutSrc" mode="scaleToFill" class="popout-image" />
        <view class="close-btn" @click.stop="closePop">
          <view class="close-visual">
            <text class="close-icon">×</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  // 引入生命周期等
  import {
    onLoad,
    onShow,
    onHide,
    onShareAppMessage,
    onShareTimeline,
  } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import request from '@/utils/request'
  import { baseUrl } from '../../utils/config'
  import { checkTokenAndNavigate, hasValidToken } from '@/utils/auth'

  const mainsrc = ref('')
  const id = ref(null)
  const showPop = ref(false)
  const popoutSrc = ref('')

  const closePop = () => {
    showPop.value = false
    uni.switchTab({ url: '/pages/index/index' })
  }
  const openPop = () => {
    showPop.value = true
  }

  const reportSource = async () => {
    // 登录校验；未登录会弹窗并跳转登录
    const ok = checkTokenAndNavigate()
    if (!ok) return

    try {
      if (id.value) {
        const clickReport = await request(
          `${baseUrl}/user/participate_activity`,
          'POST',
          {
            source_id: id.value,
          }
        )
        console.log('上报点击结果:', clickReport)

        //上报成功显示弹窗
        openPop()
      }
    } catch (e) {
      console.log('上报点击异常', e)
    }
  }

  //在onload的时候判断来源，根据来源更改mainsrc和btnsrc
  onLoad(async (query) => {
    if (query && query.q) {
      console.log('从外部链接打开，query.q:', query.q)
      const source = decodeURIComponent(query.q)
      console.log('decode 之后的source:', source)

      // 使用字符串分割提取id
      if (source.includes('id=')) {
        const parts = source.split('id=')
        if (parts[1]) {
          id.value = parts[1].split('&')[0] // 处理可能有其他参数的情况
        }
      }
      console.log('提取的id:', id.value)

      // 上报id (来源总量) – 这里不强制登录，只统计来源
      if (id.value) {
        //这里进行id来源判断和上报,
        // 1001 -static/adSpecial/fruitTea.jpg
        // 1002 -static/adSpecial/shortTV.jpg
        // 1003 -static/adSpecial/innerAd.jpg
        if (id.value === '1001') {
          mainsrc.value =
            'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruitTea.jpg'
          popoutSrc.value =
            'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruit-tea-pop.png'
        } else if (id.value === '1002') {
          mainsrc.value =
            'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/shortTV.jpg'
          popoutSrc.value =
            'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/short-tv-pop.png'
        } else if (id.value === '1003') {
          mainsrc.value =
            'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/innerAd.jpg'
          popoutSrc.value =
            'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/inner-pop.png'
        } else {
          mainsrc.value =
            'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/shortTV.jpg'
          popoutSrc.value =
            'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruit-tea-pop.png' //默认图
        }

        try {
          const sourceReport = await request(
            `${baseUrl}/track/source_total`,
            'POST',
            {
              source_id: id.value,
            }
          )
          console.log('上报来源结果:', sourceReport)
        } catch (e) {
          console.log('来源上报失败', e)
        }
      }
    } else {
      console.log('正常加载主页面')
    }

    //如果用户是点击跳转的，那么就获取携带的id,图片判断和外部链接一样,但是不上报
    if (query && query.id) {
      id.value = query.id
      // 跳转逻辑和外部一样,但是不上报
      if (id.value === '1001') {
        mainsrc.value =
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruitTea.jpg'
        popoutSrc.value =
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruit-tea-pop.png'
      } else if (id.value === '1002') {
        mainsrc.value =
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/shortTV.jpg'
        popoutSrc.value =
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/short-tv-pop.png'
      } else if (id.value === '1003') {
        mainsrc.value =
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/innerAd.jpg'
        popoutSrc.value =
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/inner-pop.png'
      } else {
        mainsrc.value =
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/shortTV.jpg'
        popoutSrc.value =
          'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruit-tea-pop.png' //默认图
      }
    }
  })
</script>

<style lang="scss" scoped>
  .adSpecial {
    position: relative;
    width: 100%;
    height: 100vh;
    background-color: #f5f5f5;

    .main-image {
      width: 100%;
      height: 100vh;
      object-fit: cover;
    }

    .join-button {
      position: absolute;
      bottom: 4%;
      left: 50%;
      transform: translateX(-50%);
      width: 200rpx;
      height: 200rpx;
    }
    .popout {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.55); /* 遮罩 */
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      .popout-inner {
        position: relative;
        width: 530rpx;
        height: 660rpx;
        border-radius: 16rpx;
        // 之前使用 overflow:hidden 会把外侧(-top / -right)的关闭按钮裁剪掉
        // 改为可见，圆角由图片自己实现
        overflow: visible;
        //位置居中靠上一些
        top: -100rpx;
        .popout-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16rpx;
        }
        .close-btn {
          position: absolute;
          bottom: -150rpx; // 按钮整体向下
          right: 50%;
          transform: translateX(50%);
          width: 120rpx; // 命中区域更大
          height: 120rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          // 透明命中区
        }
        .close-btn .close-visual {
          width: 84rpx;
          height: 84rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.55);
          border-radius: 50%;
          backdrop-filter: blur(6rpx);
          box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.25);
        }

        .close-icon {
          vertical-align: middle;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 60rpx;
          width: 60rpx;
          height: 60rpx;
          line-height: 60rpx;
          color: #fff;
          font-weight: 400;
          // × 字形本身在字体字框内偏下，做微调向上移使视觉居中
          transform: translateY(-4rpx);
        }
      }
    }
  }
</style>
