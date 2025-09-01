<template>
  <view class="adSpecial">
    <image :src="mainsrc" mode="scaleToFill" class="main-image" />
    <image
      src="/static/adspecial/join-btn.png"
      mode="scaleToFill"
      class="join-button"
      @click="reportSource"
    />
  </view>
</template>

<script setup>
  //引入onload onshow等事件
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
  const userName = ref('')

  const reportSource = async () => {
    // 登录校验；未登录会弹窗并跳转登录
    const ok = checkTokenAndNavigate()
    if (!ok) return

    try {
      // 若未获取过用户名则获取
      if (!userName.value) {
        const userInfoRes = await request(`${baseUrl}/user/user_info`, 'get')
        if (userInfoRes.code === 0) {
          console.log('获取用户信息成功', userInfoRes.data)
          userName.value = userInfoRes.data.username || ''
        }
      }

      // if (id.value) {
      //   const clickReport = await request(
      //     `${baseUrl}/track/source_click`,
      //     'POST',
      //     {
      //       source_id: id.value,
      //       username: userName.value, // 上报用户名
      //     }
      //   )
      //   console.log('上报点击结果:', clickReport)
      // }
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
          mainsrc.value = '../../static/adSpecial/fruitTea.jpg'
        } else if (id.value === '1002') {
          mainsrc.value = '../../static/adSpecial/shortTV.jpg'
        } else if (id.value === '1003') {
          mainsrc.value = '../../static/adSpecial/innerAd.jpg'
        } else {
          mainsrc.value = '../../static/adSpecial/shortTV.jpg' //默认图
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
        mainsrc.value = '../../static/adSpecial/fruitTea.jpg'
      } else if (id.value === '1002') {
        mainsrc.value = '../../static/adSpecial/shortTV.jpg'
      } else if (id.value === '1003') {
        mainsrc.value = '../../static/adSpecial/innerAd.jpg'
      } else {
        mainsrc.value = '../../static/adSpecial/shortTV.jpg' //默认图
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
  }
</style>
