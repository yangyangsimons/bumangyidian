<template>
  <view class="shop-container">
    <view v-if="loading" class="loading">
      <text>正在加载商城...</text>
    </view>

    <view v-else-if="error" class="error">
      <text>{{ error }}</text>
      <button @click="retry" class="retry-btn">重试</button>
    </view>

    <scroll-view v-else scroll-y="true" class="content">
      <!-- 显示调试信息 -->
      <view class="debug-info">
        <text class="debug-title">调试信息：</text>
        <text
          v-for="(info, index) in debugInfo"
          :key="index"
          class="debug-item"
          >{{ info }}</text
        >
      </view>

      <!-- 如果有商城数据，显示商品 -->
      <view v-if="shopItems && shopItems.length > 0" class="shop-items">
        <text class="section-title">商城商品</text>
        <view v-for="(item, index) in shopItems" :key="index" class="shop-item">
          <text class="item-name">{{ item.name || '商品' + (index + 1) }}</text>
          <text class="item-price">{{ item.price || '价格待定' }}</text>
        </view>
      </view>

      <!-- 显示原始HTML（用于调试） -->
      <view class="raw-html">
        <text class="section-title">原始HTML内容：</text>
        <rich-text :nodes="processedHtml"></rich-text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'

  const loading = ref(true)
  const error = ref('')
  const processedHtml = ref('')
  const debugInfo = ref([])
  const shopItems = ref([])

  const addDebugInfo = (info) => {
    debugInfo.value.push(info)
    console.log('Debug:', info)
  }

  const loadShopContent = async () => {
    const token = uni.getStorageSync('token')

    if (!token) {
      error.value = '请先登录'
      loading.value = false
      return
    }

    try {
      loading.value = true
      error.value = ''
      debugInfo.value = []

      addDebugInfo('开始获取商城内容...')

      // 1. 获取主页面HTML
      const res = await uni.request({
        url: 'https://mang.5gradio.com.cn:443/shop/',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      })

      if (res.statusCode === 200) {
        addDebugInfo(`获取HTML成功，长度: ${res.data.length}`)

        let html = res.data

        // 查找Dash配置
        const configMatch = html.match(
          /<script id="_dash-config" type="application\/json">(.*?)<\/script>/s
        )
        if (configMatch) {
          try {
            const dashConfig = JSON.parse(configMatch[1])
            addDebugInfo('找到Dash配置')
            addDebugInfo(`Dash URL前缀: ${dashConfig.url_base_pathname || '/'}`)
          } catch (e) {
            addDebugInfo('解析Dash配置失败: ' + e.message)
          }
        } else {
          addDebugInfo('未找到Dash配置')
        }

        // 2. 尝试获取Dash布局数据
        try {
          addDebugInfo('尝试获取Dash布局...')
          const layoutRes = await uni.request({
            url: 'https://mang.5gradio.com.cn:443/shop/_dash-layout',
            header: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            method: 'GET',
          })

          if (layoutRes.statusCode === 200) {
            addDebugInfo('获取Dash布局成功')
            console.log('Dash布局数据:', layoutRes.data)

            // 尝试从布局数据中提取商品信息
            if (layoutRes.data && typeof layoutRes.data === 'object') {
              addDebugInfo('布局数据类型: ' + typeof layoutRes.data)
              // 这里需要根据实际的数据结构来解析
            }
          } else {
            addDebugInfo(`Dash布局获取失败: ${layoutRes.statusCode}`)
          }
        } catch (layoutError) {
          addDebugInfo('Dash布局请求失败: ' + layoutError.message)
        }

        // 3. 尝试其他可能的API端点
        const apiEndpoints = [
          '/shop/api/products',
          '/shop/api/items',
          '/shop/_dash-dependencies',
          '/shop/api/shop',
          '/api/shop',
          '/api/products',
        ]

        for (const endpoint of apiEndpoints) {
          try {
            addDebugInfo(`尝试API: ${endpoint}`)
            const apiRes = await uni.request({
              url: `https://mang.5gradio.com.cn:443${endpoint}`,
              header: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              method: 'GET',
              timeout: 5000,
            })

            if (apiRes.statusCode === 200) {
              addDebugInfo(
                `API ${endpoint} 成功: ${JSON.stringify(apiRes.data).substring(
                  0,
                  100
                )}`
              )

              // 如果找到了数据，尝试解析
              if (apiRes.data && Array.isArray(apiRes.data)) {
                shopItems.value = apiRes.data
                addDebugInfo(`找到 ${apiRes.data.length} 个商品`)
                break
              }
            } else {
              addDebugInfo(`API ${endpoint} 失败: ${apiRes.statusCode}`)
            }
          } catch (apiError) {
            addDebugInfo(`API ${endpoint} 错误: ${apiError.message}`)
          }
        }

        // 处理HTML用于显示
        html = html.replace(
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          ''
        )
        html = html.replace(/<head>[\s\S]*?<\/head>/gi, '')

        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        if (bodyMatch) {
          html = bodyMatch[1]
        }

        processedHtml.value = html
        loading.value = false
      } else {
        throw new Error(`服务器返回错误: ${res.statusCode}`)
      }
    } catch (err) {
      console.error('加载失败:', err)
      error.value = '加载失败: ' + (err.message || '网络错误')
      loading.value = false
    }
  }

  const retry = () => {
    loadShopContent()
  }

  onLoad(() => {
    loadShopContent()
  })
</script>

<style scoped>
  .shop-container {
    width: 100%;
    height: 100vh;
    background: #f5f5f5;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 20px;
  }

  .error text {
    color: #ff4444;
    margin-bottom: 20px;
    text-align: center;
  }

  .retry-btn {
    background: #007aff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
  }

  .content {
    width: 100%;
    height: 100vh;
    padding: 15px;
  }

  .debug-info {
    background: #fff;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    border-left: 4px solid #007aff;
  }

  .debug-title {
    font-weight: bold;
    display: block;
    margin-bottom: 10px;
    color: #007aff;
  }

  .debug-item {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    color: #666;
    background: #f5f5f5;
    padding: 5px;
    border-radius: 4px;
  }

  .section-title {
    font-weight: bold;
    display: block;
    margin-bottom: 10px;
    color: #333;
  }

  .shop-items {
    background: #fff;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
  }

  .shop-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
  }

  .item-name {
    font-weight: bold;
  }

  .item-price {
    color: #ff6b35;
  }

  .raw-html {
    background: #fff;
    padding: 15px;
    border-radius: 8px;
  }
</style>
