<template>
  <view class="danmaku-container">
    <view
      class="danmaku-track"
      v-for="(track, trackIndex) in tracks"
      :key="trackIndex"
    >
      <view
        class="danmaku-item"
        v-for="danmaku in track"
        :key="danmaku.id"
        :style="getDanmakuStyle(danmaku)"
      >
        {{ danmaku.content }}
      </view>
    </view>

    <!-- 调试信息 -->
    <!-- <view class="debug-info" v-if="showDebug">
      <text>队列长度: {{ danmakuQueue.length }}</text>
      <text>当前批次: {{ currentBatchIndex }}</text>
      <text>轨道数据: {{ tracks.map((t) => t.length).join(',') }}</text>
      <text>是否最后弹幕: {{ isLastDanmakuShown }}</text>
      <text>请求中: {{ isRequesting }}</text>
    </view> -->
  </view>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { baseUrl } from '../../utils/config'
  import request from '../../utils/request'

  // 开启调试模式
  const showDebug = ref(true)
  const fetchDataTime = ref(0) // 记录获取数据的时间
  const isRequesting = ref(false) // 防止重复请求

  // 模拟后端数据
  const mockDanmakuData = ref(['还没有弹幕数据，快来发一条弹幕吧！'])

  const getTimeMinusMinutes = (minutesToSubtract = 1) => {
    const date = new Date(Date.now() - minutesToSubtract * 60 * 1000)
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0') +
      ' ' +
      String(date.getHours()).padStart(2, '0') +
      ':' +
      String(date.getMinutes()).padStart(2, '0') +
      ':' +
      String(date.getSeconds()).padStart(2, '0')
    )
  }

  // 添加分组函数
  const divideIntoGroups = (array, groupCount = 4) => {
    const groups = Array.from({ length: groupCount }, () => [])

    array.forEach((item, index) => {
      const groupIndex = index % groupCount
      groups[groupIndex].push(item)
    })

    return groups
  }

  // 组件数据
  const tracks = ref([[], [], [], []]) // 4个轨道
  const danmakuQueue = ref([]) // 弹幕队列
  const currentBatchIndex = ref(0) // 当前批次索引
  const containerWidth = ref(750) // 容器宽度，使用rpx单位，750rpx = 屏幕宽度
  const isLastDanmakuShown = ref(false) // 标记最后一条弹幕是否已显示

  // 弹幕ID计数器
  let danmakuId = 0

  // 创建弹幕对象
  const createDanmaku = (content) => {
    const id = ++danmakuId
    // console.log('创建弹幕:', { id, content })

    return {
      id,
      content,
      x: containerWidth.value, // 从右侧开始
      isMoving: false,
      startTime: Date.now(),
    }
  }

  // 获取弹幕样式
  const getDanmakuStyle = (danmaku) => {
    return {
      transform: `translateX(${danmaku.x}rpx)`,
      transition: danmaku.isMoving ? 'transform 6s linear' : 'none',
    }
  }

  // 从后端获取弹幕数据
  const fetchDanmakuData = async () => {
    if (isRequesting.value) {
      console.log('正在请求中，跳过重复请求')
      return
    }

    isRequesting.value = true
    console.log('正在获取新的弹幕数据...')

    try {
      // 后端接口获取数据
      const response = await request(
        `${baseUrl}/bullet_comment/query?start_time=${fetchDataTime.value}`,
        {},
        {},
        'GET'
      )

      if (response.code == 0) {
        console.log('获取弹幕数据成功:', response.data)
        const data = response.data

        // 检查是否有新数据
        if (data && data.length > 0) {
          // 更新弹幕数据
          const comments = data.map((item) => item.comment)
          mockDanmakuData.value = comments

          const maxCreatedAt = data
            .filter((item) => item.performance_id === 0)
            .reduce(
              (max, current) =>
                current.created_at > max ? current.created_at : max,
              ''
            )

          // 更新获取数据的时间为最新的created_at
          fetchDataTime.value = maxCreatedAt || getTimeMinusMinutes(1)
          console.log('最新的请求时间:', maxCreatedAt || '没有找到数据')

          // 重置批次索引，重新开始分组
          currentBatchIndex.value = 0

          // 将一维数组分为四组
          const groups = divideIntoGroups(mockDanmakuData.value)
          const newData = groups[0] // 从第一组开始

          console.log(`获取新的弹幕数据，第1批:`, newData)

          // 将新数据添加到队列
          newData.forEach((content) => {
            danmakuQueue.value.push(createDanmaku(content))
          })

          currentBatchIndex.value++
          isLastDanmakuShown.value = false

          console.log('弹幕队列更新后长度:', danmakuQueue.value.length)
        } else {
          // 没有新数据，延迟一段时间后再次尝试
          console.log('没有新的弹幕数据，等待中...')
          setTimeout(async () => {
            isRequesting.value = false
            await fetchDanmakuData()
          }, 5000) // 5秒后重试
          return
        }
      } else {
        console.error('获取弹幕数据失败:', response)
        // 请求失败，延迟后重试
        setTimeout(async () => {
          isRequesting.value = false
          await fetchDanmakuData()
        }, 5000)
        return
      }
    } catch (error) {
      console.error('请求弹幕数据异常:', error)
      // 请求异常，延迟后重试
      setTimeout(async () => {
        isRequesting.value = false
        await fetchDanmakuData()
      }, 5000)
      return
    } finally {
      isRequesting.value = false
    }
  }

  // 寻找可用轨道
  const findAvailableTrack = () => {
    // 优先选择空轨道
    for (let i = 0; i < tracks.value.length; i++) {
      if (tracks.value[i].length === 0) {
        return i
      }
    }

    // 如果没有空轨道，选择弹幕最少的轨道
    let minTrack = 0
    let minCount = tracks.value[0].length

    for (let i = 1; i < tracks.value.length; i++) {
      if (tracks.value[i].length < minCount) {
        minCount = tracks.value[i].length
        minTrack = i
      }
    }

    return minTrack
  }

  // 显示弹幕
  const showDanmaku = () => {
    if (danmakuQueue.value.length === 0) {
      console.log('弹幕队列为空')

      // 检查是否还有未使用的批次
      const groups = divideIntoGroups(mockDanmakuData.value)
      if (currentBatchIndex.value < groups.length) {
        // 还有本地数据的其他批次
        const batchIndex = currentBatchIndex.value
        const newData = groups[batchIndex]

        console.log(`使用本地数据第${currentBatchIndex.value + 1}批:`, newData)

        newData.forEach((content) => {
          danmakuQueue.value.push(createDanmaku(content))
        })

        currentBatchIndex.value++
        console.log('本地批次弹幕队列更新后长度:', danmakuQueue.value.length)
      } else if (!isLastDanmakuShown.value && !isRequesting.value) {
        // 本地数据已用完，需要获取新数据
        isLastDanmakuShown.value = true
        console.log('本地数据已用完，准备获取新数据')
        setTimeout(async () => {
          await fetchDanmakuData()
        }, 1000)
      }
      return
    }

    const trackIndex = findAvailableTrack()
    const danmaku = danmakuQueue.value.shift()

    console.log('显示弹幕:', danmaku.content, '轨道:', trackIndex)

    // 添加到轨道
    tracks.value[trackIndex].push(danmaku)

    // 启动动画
    nextTick(async () => {
      setTimeout(() => {
        danmaku.isMoving = true
        danmaku.x = -800 // 移动到左侧屏幕外
        // console.log('启动弹幕动画:', danmaku.content)
      }, 50)
    })

    // 8秒后清理弹幕
    setTimeout(() => {
      const track = tracks.value[trackIndex]
      const index = track.findIndex((item) => item.id === danmaku.id)
      if (index !== -1) {
        track.splice(index, 1)
        // console.log('清理弹幕:', danmaku.content)
      }
    }, 8000)
  }

  // 定时器
  let showTimer = null

  // 启动弹幕展示
  const startDanmaku = () => {
    console.log('启动弹幕展示')
    if (showTimer) {
      clearInterval(showTimer)
    }
    showTimer = setInterval(() => {
      showDanmaku()
    }, 1000) // 每1秒显示一条弹幕
  }

  // 停止弹幕展示
  const stopDanmaku = () => {
    console.log('停止弹幕展示')
    if (showTimer) {
      clearInterval(showTimer)
      showTimer = null
    }
  }

  // 初始化
  const init = async () => {
    console.log('弹幕组件初始化')
    // 初始化的时间
    fetchDataTime.value = getTimeMinusMinutes(1) // 获取1分钟前的时间
    await fetchDanmakuData() // 获取初始弹幕数据
    await nextTick()
    startDanmaku()

    // 立即显示第一条弹幕用于测试
    setTimeout(() => {
      showDanmaku()
    }, 500)
  }

  // 生命周期
  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    stopDanmaku()
  })

  // 暴露方法供父组件调用
  defineExpose({
    startDanmaku,
    stopDanmaku,
    fetchDanmakuData,
  })
</script>

<style lang="scss" scoped>
  .danmaku-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    // background: rgba(0, 0, 0, 0.1); // 添加背景色便于查看
    // border: 2rpx solid #ccc; // 添加边框便于查看
  }

  .danmaku-track {
    position: absolute;
    width: 100%;
    height: 80rpx;
    left: 0;

    &:nth-child(1) {
      top: 20rpx;
    }

    &:nth-child(2) {
      top: 150rpx;
    }

    &:nth-child(3) {
      top: 280rpx;
    }
    &:nth-child(4) {
      top: 400rpx;
    }
  }

  .danmaku-item {
    position: absolute;
    top: 0;
    padding: 24rpx 40rpx;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 30rpx;
    font-size: 28rpx;
    font-weight: 400;
    vertical-align: middle;
    padding: 16rpx 24rpx;
    padding-right: 20rpx;
    white-space: nowrap;
    will-change: transform;
    z-index: 10;
  }

  .debug-info {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    background: rgba(255, 255, 255, 0.9);
    padding: 10rpx;
    border-radius: 10rpx;
    font-size: 20rpx;
    z-index: 100;

    text {
      display: block;
      margin-bottom: 5rpx;
    }
  }
</style>
