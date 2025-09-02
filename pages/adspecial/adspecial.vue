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

  // 多次解码（处理被重复 encode 的场景：%252F -> %2F -> /）
  const multiDecode = (val, max = 3) => {
    if (!val || typeof val !== 'string') return val
    let prev = val
    for (let i = 0; i < max; i++) {
      try {
        const next = decodeURIComponent(prev)
        if (next === prev) return next
        prev = next
      } catch (e) {
        return prev
      }
    }
    return prev
  }

  const applyIdAssets = (theId) => {
    if (!theId) return
    if (theId === '1001') {
      mainsrc.value =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruitTea.jpg'
      popoutSrc.value =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruit-tea-pop.png'
    } else if (theId === '1002') {
      mainsrc.value =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/shortTV.jpg'
      popoutSrc.value =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/short-tv-pop.png'
    } else if (theId === '1003') {
      mainsrc.value =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/innerAd.jpg'
      popoutSrc.value =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/inner-pop.png'
    } else {
      mainsrc.value =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/shortTV.jpg'
      popoutSrc.value =
        'https://imango-school-public.obs.cn-south-1.myhuaweicloud.com/activity/fruit-tea-pop.png'
    }
  }

  const closePop = () => {
    showPop.value = false
    uni.switchTab({ url: '/pages/index/index' })
  }
  const openPop = () => {
    showPop.value = true
  }

  const reportSource = async () => {
    // 若未登录：构建当前页面 + 现有参数（含其它追踪参数），再合并 / 覆盖 id，避免重复
    if (!hasValidToken()) {
      try {
        const pages = getCurrentPages && getCurrentPages()
        let basePath = '/pages/adspecial/adspecial'
        let params = {}
        if (pages && pages.length) {
          const current = pages[pages.length - 1] || {}
          const rawOpts =
            (current &&
              (current.options || (current.$page && current.$page.options))) ||
            {}
          // 拷贝一份，后面可安全修改
          Object.keys(rawOpts).forEach((k) => {
            params[k] = rawOpts[k]
          })
        }
        // 合并 / 覆盖 id
        if (id.value) params.id = id.value
        // 生成查询串（去重已由对象语义完成）
        const queryStr = Object.keys(params)
          .filter(
            (k) =>
              params[k] !== undefined && params[k] !== null && params[k] !== ''
          )
          .map((k) => `${k}=${encodeURIComponent(params[k])}`)
          .join('&')
        const redirect = queryStr ? `${basePath}?${queryStr}` : basePath
        uni.setStorageSync('postLoginRedirect', redirect)
      } catch (e) {
        console.log('构建重定向路径失败', e)
        // 兜底：至少带上 id
        let fallback = '/pages/adspecial/adspecial'
        if (id.value) fallback += `?id=${id.value}`
        uni.setStorageSync('postLoginRedirect', fallback)
      }
      checkTokenAndNavigate() // 触发登录弹窗 & 跳转
      return
    }

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
      const source = multiDecode(query.q)
      console.log('多次 decode 后的 source:', source)

      // 统一用正则匹配 ?id= / &id=
      const match = source.match(/[?&]id=([^&]+)/)
      if (match) {
        id.value = match[1]
      }
      console.log('提取的 id:', id.value)

      // 上报id (来源总量) – 这里不强制登录，只统计来源
      if (id.value) {
        // 根据 id 设置图片
        applyIdAssets(id.value)

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
      // 设置图片（不上来源上报）
      applyIdAssets(id.value)
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
