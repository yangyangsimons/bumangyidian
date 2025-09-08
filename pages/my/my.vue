<template>
  <view class="user-container">
    <uni-nav-bar
      :fixed="true"
      :status-bar="true"
      :shadow="false"
      background-color="rgba(255, 255, 255, 0)"
      color="#333"
      :border="false"
      leftWidth="0"
      title="我的"
    >
    </uni-nav-bar>
    <image class="bg" src="../../static/my/bg.png" mode="scaleToFill"></image>
    <view class="header">
      <image class="avator" :src="avator"></image>

      <view class="info-container">
        <view class="user-info-setting">
          <view class="user-info">
            <view class="name">{{ userName }} </view>
            <view class="school">{{ school }}</view></view
          >
          <view class="setting" @click="goSetting">
            <image src="../../static/my/setting.png" mode="scaleToFill" />
          </view>
        </view>

        <view class="checkin-container">
          <view class="checkin">
            <image
              class="checkin-icon"
              src="../../static/my/checkin.png"
              mode="scaleToFill"
            ></image>
            <view class="checkin-text">已签到{{ checkInDays }}天</view>
          </view>
          <!-- points container -->
          <view class="points">
            <image
              class="points-icon"
              src="../../static/my/points.png"
              mode="scaleToFill"
            ></image>
            <view class="checkin-points">积分 {{ points_balance }}</view>
          </view>
          <view class="checkin-btn" @click="checkin">
            <image
              class="checkin-btn-icon"
              src="../../static/my/checkin.png"
            ></image>
            <text>签到</text>
          </view>
        </view>
      </view>
    </view>
    <view class="main">
      <view class="goods-container">
        <view class="goods-head"
          ><view class="title">
            <text>积分好礼</text>
            <view class="bar"></view>
          </view>
          <view class="more" @click="goMore"
            ><view class="more-text">更多</view>
            <image
              class="more-icon"
              src="../../static/my/more.png"
              mode="scaleToFill"
            ></image>
          </view>
        </view>
        <view class="goods-main">
          <!-- 这里显示商品列表 -->
          <view
            v-for="product in productsList"
            :key="product.id"
            class="product-item"
            @click="goToProductDetail(product.id)"
          >
            <view class="image-wrap">
              <image
                :src="product.main_image"
                mode="scaleToFill"
                class="product-pic"
              ></image>
              <!-- <view class="product-name">{{ product.name }}</view> -->
            </view>

            <view class="product-points">{{ product.points }}积分</view>
          </view>
        </view>
      </view>
    </view>
    <view class="footer">
      <view class="container">
        <view class="footer-head"
          ><view class="title">
            <text>我的互动</text>
            <view class="bar"></view>
          </view>
        </view>
        <view class="footer-main">
          <view class="icon-container" @click="goMessage">
            <image
              class="icon"
              src="../../static/my/leave-message.png"
              mode="scaleToFill"
            ></image>
            <view class="icon-text">留言</view>
          </view>
          <view class="icon-container" @click="goCollect">
            <image
              class="icon"
              src="../../static/my/collect.png"
              mode="scaleToFill"
            ></image>
            <view class="icon-text">收藏</view>
          </view>
        </view>
      </view>
    </view>
    <tabbar :current="2" />
  </view>
</template>

<script setup>
  import { ref } from 'vue'
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import { baseUrl } from '../../utils/config'
  import { dmReport } from '../../utils/report'
  import tabbar from '@/components/tabbar/tabbar.vue'
  import { checkTokenAndNavigate } from '@/utils/auth'

  const toneId = ref(null)

  //用户信息
  const user = ref(null)
  const userName = ref('') // 用户名
  const userSex = ref('') // 用户性别
  const userMbti = ref('') // 用户MBTI类型
  const userMbtiShort = ref('') // 用户MBTI类型简称
  const avator = ref('') // 用户头像
  const sexSrc = ref('') // 用户性别图标路径
  const school = ref('湖南工商大学') // 用户学校
  const sptime = ref(0)
  const checkInDays = ref(0) // 用户签到天数
  const points_balance = ref(0) // 用户积分余额
  //商城信息相关
  const productsList = ref([])
  const allActiveProducts = ref([]) // 存储所有 is_active 为 true 的商品
  const currentPage = ref(1) // 当前页码
  const totalPages = ref(0) // 总页数
  const isLoading = ref(false) // 是否正在加载
  const id = ref(null) // 从扫码或链接中获取的商品ID

  // const multiDecode = (val, max = 3) => {
  //   if (!val || typeof val !== 'string') return val
  //   let prev = val
  //   for (let i = 0; i < max; i++) {
  //     try {
  //       const next = decodeURIComponent(prev)
  //       if (next === prev) return next
  //       prev = next
  //     } catch (e) {
  //       return prev
  //     }
  //   }
  //   return prev
  // }
  onLoad(async (options) => {
    // 处理扫描二维码进来的用户的逻辑
    console.log('onLoad触发，处理扫码逻辑拿到id:', options)
    if (options.id) {
      id.value = options.id
      console.log('ID:', id.value)

      // 这里可以直接跳转到商品详情页
      checkTokenAndNavigate((token) => {
        uni.navigateTo({
          url: `/pages/shop/shop?token=${token}&id=${id.value}`,
        })
      })
    }
  })

  const goToProductDetail = (productId) => {
    checkTokenAndNavigate((token) => {
      uni.navigateTo({
        url: `/pages/shop/shop?token=${token}&id=${productId}`,
      })
    })
  }

  // 获取更多商品
  const goMore = () => {
    checkTokenAndNavigate((token) => {
      uni.navigateTo({
        url: `/pages/shop/shop?token=${token}`,
      })
    }) // 这个可以使用简单的toast提示
  }

  // 签到 checkin
  const checkin = async () => {
    //先判断是不是登录了
    checkTokenAndNavigate(async (token) => {
      const checkinRes = await request(`${baseUrl}/user/sign`, 'post', {})
      console.log('签到结果', checkinRes)
      if (checkinRes.code === 0 && checkinRes.data) {
        uni.showToast({
          title: `${checkinRes.data.msg}`,
          icon: 'success',
        })
        // 查询用户的签到日历
        const response = await request(`${baseUrl}/user/user_info`, 'get')
        console.log('签到日历:', response)
        if (response.code === 0) {
          checkInDays.value = response.data.sign_count
        }
        //这里还要再次查询用户的积分，进行更新
        const pointsResponse = await request(`${baseUrl}/user/user_info`, 'get')
        console.log('用户积分:', pointsResponse)
        if (pointsResponse.code === 0) {
          points_balance.value = pointsResponse.data.points_balance
        }
      } else {
        uni.showToast({
          title: checkinRes.message || '签到失败',
          icon: 'none',
        })
      }
    })
  }
  // 获取所有商品数据
  const getAllProducts = async () => {
    console.log('开始获取所有商品数据')
    allActiveProducts.value = []
    currentPage.value = 1

    while (true) {
      try {
        console.log(`开始请求第${currentPage.value}页数据`)

        const shopInfoRes = await request(
          `${baseUrl}/shop_backend/api/products?page=${currentPage.value}`,
          'get'
        )

        if (shopInfoRes.code == 200) {
          console.log(`第${currentPage.value}页获取成功`)

          const products = shopInfoRes.data?.products || []
          const pagination = shopInfoRes.pagination || {}

          totalPages.value = pagination.pages || 1

          console.log(
            '当前页:',
            currentPage.value,
            '总页数:',
            totalPages.value,
            '商品数量:',
            products.length
          )

          // 收集所有 is_active 为 true 的商品
          const activeProducts = products.filter(
            (product) => product.is_active === true
          )
          allActiveProducts.value.push(...activeProducts)

          console.log(
            `第${currentPage.value}页活跃商品数量:`,
            activeProducts.length
          )

          // 如果已经是最后一页，退出循环
          if (currentPage.value >= totalPages.value) {
            break
          }

          currentPage.value++
        } else {
          console.error('获取商城信息失败', shopInfoRes.message || '未知错误')
          break
        }
      } catch (error) {
        console.error('获取商城信息异常', error)
        break
      }
    }

    console.log('所有活跃商品收集完成，总数:', allActiveProducts.value.length)
  }

  // 筛选商品
  const selectProducts = () => {
    console.log('开始筛选商品')
    productsList.value = []

    // 第一步：筛选同时满足 is_active 和 is_recommended 为 true 的商品
    const recommendedProducts = allActiveProducts.value.filter(
      (product) => product.is_active === true && product.is_recommended === true
    )

    console.log('符合推荐条件的商品数量:', recommendedProducts.length)

    // 添加推荐商品，最多8个
    for (const product of recommendedProducts) {
      if (productsList.value.length < 8) {
        productsList.value.push(product)
      } else {
        break
      }
    }

    console.log('添加推荐商品后，当前商品列表长度:', productsList.value.length)

    // 第二步：如果推荐商品不足8个，补充其他活跃商品
    if (productsList.value.length < 8) {
      console.log('推荐商品不足8个，开始补充其他活跃商品')

      // 获取已添加商品的ID列表，避免重复
      const addedProductIds = productsList.value.map((p) => p.id)

      // 筛选出还未添加的活跃商品
      const remainingActiveProducts = allActiveProducts.value.filter(
        (product) => !addedProductIds.includes(product.id)
      )

      console.log('剩余可补充的活跃商品数量:', remainingActiveProducts.length)

      // 补充商品直到达到8个
      for (const product of remainingActiveProducts) {
        if (productsList.value.length < 8) {
          productsList.value.push(product)
        } else {
          break
        }
      }
    }

    console.log('最终商品列表长度:', productsList.value.length)
    console.log(
      '最终商品列表:',
      productsList.value.map((p) => ({
        id: p.id,
        name: p.name,
        is_active: p.is_active,
        is_recommended: p.is_recommended,
        main_image: p.main_image,
      }))
    )
  }

  // 获取商城商品数据（主函数）
  const getProducts = async () => {
    if (isLoading.value) {
      console.log('正在加载中，跳过重复请求')
      return
    }

    try {
      isLoading.value = true

      // 先获取所有商品数据
      await getAllProducts()

      // 然后筛选商品
      selectProducts()
    } catch (error) {
      console.error('获取商品数据失败', error)
    } finally {
      isLoading.value = false
    }
  }

  onShow(async () => {
    try {
      // 获取用户信息
      const userInfoRes = await request(`${baseUrl}/user/user_info`, 'get')
      if (userInfoRes.code === 0) {
        console.log('获取用户信息成功', userInfoRes.data)
        user.value = userInfoRes.data
        avator.value = userInfoRes.data.avator
        toneId.value = userInfoRes.data.tone

        uni.setStorage({
          key: 'toneId',
          data: toneId.value,
        })
        userName.value = userInfoRes.data.username
        userMbtiShort.value = userInfoRes.data.mbti
        userMbti.value = userInfoRes.data.mbti_ch
        userSex.value = userInfoRes.data.sex
        school.value = userInfoRes.data.school_name
        points_balance.value = userInfoRes.data.points_balance
        checkInDays.value = userInfoRes.data.sign_count
        sexSrc.value =
          userSex.value === '男'
            ? '../../static/male.png'
            : '../../static/female.png'
      } else {
        console.error('获取用户信息失败', userInfoRes.message)
      }

      // 重置商品相关数据
      productsList.value = []
      allActiveProducts.value = []
      currentPage.value = 1
      totalPages.value = 0
      isLoading.value = false

      // 获取商城信息
      await getProducts()
    } catch (error) {
      console.error('页面初始化失败', error)
    }
  })

  // 去留言页面
  const goMessage = () => {
    uni.navigateTo({
      url: '/pages/mymessage/mymessage',
    })
  }
  //去设置页面
  const goSetting = () => {
    checkTokenAndNavigate(() => {
      uni.navigateTo({
        url: '/pages/mysetting/mysetting',
      })
    })
  }
  // 去收藏页面
  const goCollect = () => {
    uni.navigateTo({
      url: '/pages/mycollect/mycollect',
    })
  }
</script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
