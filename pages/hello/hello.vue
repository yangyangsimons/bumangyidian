<template>
  <view class="hello-container">
    <image class="global-title" src="../../static/global-title.png"></image>
    <!-- <uni-nav-bar title="不芒一点" left-icon="left" /> -->
    <view class="header">
      <view class="title"
        ><text>Hello</text>
        <view class="bar"></view>
      </view>

      <text class="describe">填写基本信息，解锁更懂你的 AI 体验</text>
    </view>
    <view class="main">
      <view class="sex-container">
        <view class="second-title">
          <image class="icon" src="../../static/sex-icon.png"></image>
          <text class="describe">性别</text>
        </view>
        <view class="sex-choice-container">
          <view class="male" @click="selectSex('male')">
            <image :src="maleImageSrc" mode="scaleToFill" />
          </view>
          <view class="female" @click="selectSex('female')">
            <image :src="femaleImageSrc" mode="scaleToFill" />
          </view>
        </view>
      </view>
      <view class="birth-container">
        <view class="second-title">
          <image class="icon" src="../../static/birth-icon.png"></image>
          <text class="describe">出生日期</text>
        </view>
        <view class="birth-choice-container">
          <view class="date-container">
            <image class="date-icon" src="../../static/date-icon.png"></image>
            <picker
              mode="date"
              :start="startDate"
              :end="endDate"
              @change="bindDateChange"
            >
              <view class="date-display">
                <text class="year">{{ dateParts.year }}</text> 年
                <text class="month">{{ dateParts.month }}</text> 月
                <text class="day">{{ dateParts.day }}</text> 日
              </view>
            </picker>
            <image class="more-icon" src="../../static/more-icon.png"></image>
          </view>
        </view>
      </view>
      <!-- 学校部分 -->
      <view class="school-choice-container">
        <view class="school-select-container" @click="showSchoolPicker">
          <image class="school-icon" src="../../static/school.png"></image>
          <text class="school-name">{{
            selectedSchoolName || '请选择学校'
          }}</text>
        </view>
      </view>
    </view>
    <view class="footer">
      <button class="next" @click="handleNext">
        <text class="next-text">下一步</text>
      </button>
    </view>

    <!-- 学校选择弹窗 -->
    <view
      class="school-picker-modal"
      v-if="showModal"
      @click="hideSchoolPicker"
    >
      <view class="school-picker-content" @click.stop>
        <!-- 头部 -->
        <view class="picker-header">
          <text class="cancel-btn" @click="hideSchoolPicker">取消</text>
          <text class="title">选择学校</text>
          <text class="confirm-btn" @click="confirmSchoolSelection">确定</text>
        </view>

        <!-- 搜索框 -->
        <view class="search-container">
          <input
            class="search-input"
            v-model="searchKeyword"
            placeholder="搜索学校名称"
            @input="onSearchInput"
            confirm-type="search"
            @confirm="handleSearchConfirm"
          />
        </view>

        <!-- 学校列表 -->
        <scroll-view
          class="school-list"
          scroll-y
          @scrolltolower="handleScrollToLower"
          lower-threshold="50"
          refresher-enabled="false"
          enable-back-to-top="true"
        >
          <view
            class="school-item"
            v-for="(school, index) in schoolList"
            :key="`${
              school.id || school.school_id || index
            }-${currentPage}-${index}`"
            :class="{ selected: tempSelectedIndex === index }"
            @click="selectSchoolItem(index)"
          >
            <text class="school-item-name">{{ getSchoolName(school) }}</text>
            <view class="check-icon" v-if="tempSelectedIndex === index">✓</view>
          </view>

          <!-- 加载更多提示 -->
          <view
            class="load-more"
            v-if="!isSearching && hasMore && !loading && schoolList.length > 0"
          >
            <text>上拉加载更多...</text>
          </view>

          <!-- 搜索结果为空 -->
          <view
            class="no-data"
            v-if="
              isSearching &&
              !loading &&
              schoolList.length === 0 &&
              searchKeyword.trim()
            "
          >
            <text>未找到相关学校</text>
          </view>

          <!-- 分页加载完毕 -->
          <view
            class="no-more"
            v-if="!isSearching && !hasMore && schoolList.length > 0"
          >
            <text>已加载全部数据</text>
          </view>

          <!-- 加载中提示 -->
          <view class="loading" v-if="loading">
            <text>加载中...</text>
          </view>

          <!-- 无数据提示 -->
          <view
            class="no-data"
            v-if="!loading && schoolList.length === 0 && !searchKeyword.trim()"
          >
            <text>暂无学校数据</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed, nextTick } from 'vue'
  import { onShow, onHide } from '@dcloudio/uni-app'
  import { baseUrl } from '../../utils/config'
  import request from '../../utils/request'

  const selectedSex = ref('male')

  // 学校相关数据
  const schoolList = ref([])
  const selectedSchoolIndex = ref(-1)
  const selectedSchool = ref(null)
  const showModal = ref(false)
  const tempSelectedIndex = ref(-1)

  // 分页相关
  const currentPage = ref(1)
  const pageSize = ref(20)
  const hasMore = ref(true)
  const loading = ref(false)

  // 搜索相关
  const searchKeyword = ref('')
  const isSearching = ref(false)
  const searchTimer = ref(null)

  // 调试开关
  const showDebugInfo = ref(true) // 设为 true 以显示调试信息

  onShow(async () => {
    // 页面显示时不预加载学校列表，只在打开弹窗时加载
  })

  // 获取学校名称的统一方法
  const getSchoolName = (school) => {
    return school.name || school.school_name || school.title || ''
  }

  // 加载学校列表
  const loadSchools = async (page = 1, reset = false) => {
    if (loading.value) {
      console.log('正在加载中，跳过本次请求')
      return
    }

    console.log(
      `开始加载学校列表 - 页码: ${page}, 重置: ${reset}, 搜索: ${isSearching.value}, 关键词: ${searchKeyword.value}`
    )
    console.log(
      `当前状态 - 列表长度: ${schoolList.value.length}, 当前页: ${currentPage.value}, 还有更多: ${hasMore.value}`
    )

    loading.value = true

    try {
      let url = `${baseUrl}/school/get_school_list?page=${page}&page_size=${pageSize.value}`

      // 如果有搜索关键词，添加name参数进行搜索
      if (searchKeyword.value.trim()) {
        url += `&name=${encodeURIComponent(searchKeyword.value.trim())}`
      }

      console.log('请求URL:', url)

      const res = await request(url, 'get', {})
      console.log('学校列表响应:', res)

      if (res.code === 0) {
        const newSchools = res.data.data || []
        console.log(`接收到新数据: ${newSchools.length} 条`)

        if (reset) {
          console.log('重置列表数据')
          schoolList.value = newSchools
          tempSelectedIndex.value = -1 // 重置时清空选择
        } else {
          console.log(
            `追加数据到现有列表，当前长度: ${schoolList.value.length}`
          )
          const oldLength = schoolList.value.length

          // 使用 nextTick 确保响应式更新
          await nextTick()

          // 使用 push 方法追加数据，确保响应式更新
          newSchools.forEach((school) => {
            schoolList.value.push(school)
          })

          console.log(
            `数据追加完成，新长度: ${schoolList.value.length}，实际增加: ${
              schoolList.value.length - oldLength
            }`
          )

          // 如果选中的学校索引需要调整（因为列表重置了）
          if (selectedSchool.value && tempSelectedIndex.value === -1) {
            // 在新列表中查找之前选中的学校
            const foundIndex = schoolList.value.findIndex(
              (school) =>
                (school.id && school.id === selectedSchool.value.id) ||
                (school.school_id &&
                  school.school_id === selectedSchool.value.school_id) ||
                getSchoolName(school) === getSchoolName(selectedSchool.value)
            )
            if (foundIndex !== -1) {
              tempSelectedIndex.value = foundIndex
              console.log(`重新定位选中学校索引: ${foundIndex}`)
            }
          }
        }

        // 判断是否还有更多数据
        hasMore.value = newSchools.length >= pageSize.value
        currentPage.value = page

        console.log(
          `数据加载完成 - 当前页: ${page}, 新增: ${newSchools.length}, 总数: ${schoolList.value.length}, 还有更多: ${hasMore.value}`
        )

        // 强制触发视图更新
        await nextTick()
      } else {
        console.error('接口返回错误:', res)
        uni.showToast({
          title: res.message || '获取学校列表失败',
          icon: 'none',
        })
      }
    } catch (error) {
      console.error('获取学校列表出错:', error)
      uni.showToast({
        title: '网络错误',
        icon: 'none',
      })
    } finally {
      loading.value = false
      console.log(
        `加载完成，最终状态 - 列表长度: ${schoolList.value.length}, 还有更多: ${hasMore.value}`
      )
    }
  }

  // 处理滚动到底部事件
  const handleScrollToLower = async () => {
    console.log('=== 滚动到底部触发 ===')
    console.log('当前状态:', {
      hasMore: hasMore.value,
      loading: loading.value,
      isSearching: isSearching.value,
      currentPage: currentPage.value,
      listLength: schoolList.value.length,
    })

    // 如果是搜索模式，不自动加载更多
    if (isSearching.value) {
      console.log('搜索模式下不自动加载更多')
      return
    }

    // 如果还有更多数据且不在加载中，则加载下一页
    if (hasMore.value && !loading.value) {
      const nextPage = currentPage.value + 1
      console.log(`触发加载下一页: ${nextPage}`)
      await loadSchools(nextPage, false)
    } else {
      console.log('不满足加载条件:', {
        hasMore: hasMore.value,
        loading: loading.value,
      })
    }
  }

  // 搜索输入处理（防抖）
  const onSearchInput = () => {
    console.log('搜索输入:', searchKeyword.value)

    // 清除之前的定时器
    if (searchTimer.value) {
      clearTimeout(searchTimer.value)
    }

    // 如果搜索框为空，恢复正常模式
    if (!searchKeyword.value.trim()) {
      exitSearchMode()
      return
    }

    // 设置新的定时器进行搜索
    searchTimer.value = setTimeout(() => {
      performSearch()
    }, 300) // 300ms 防抖
  }

  // 处理搜索确认
  const handleSearchConfirm = () => {
    console.log('搜索确认:', searchKeyword.value)

    // 清除防抖定时器
    if (searchTimer.value) {
      clearTimeout(searchTimer.value)
    }

    if (searchKeyword.value.trim()) {
      performSearch()
    } else {
      exitSearchMode()
    }
  }

  // 执行搜索
  const performSearch = async () => {
    console.log('执行搜索:', searchKeyword.value)

    isSearching.value = true
    currentPage.value = 1
    hasMore.value = false // 搜索模式下不支持分页

    await loadSchools(1, true)
  }

  // 退出搜索模式
  const exitSearchMode = async () => {
    console.log('退出搜索模式')

    isSearching.value = false
    hasMore.value = true
    currentPage.value = 1

    // 重新加载正常的学校列表
    await loadSchools(1, true)
  }

  // 显示学校选择器
  const showSchoolPicker = async () => {
    console.log('显示学校选择器')
    showModal.value = true

    // 重置搜索状态
    searchKeyword.value = ''
    isSearching.value = false
    currentPage.value = 1
    hasMore.value = true

    // 设置临时选择索引
    tempSelectedIndex.value = selectedSchoolIndex.value

    // 加载学校数据
    await loadSchools(1, true)
  }

  // 隐藏学校选择器
  const hideSchoolPicker = () => {
    console.log('隐藏学校选择器')
    showModal.value = false
    searchKeyword.value = ''
    isSearching.value = false

    // 清除搜索定时器
    if (searchTimer.value) {
      clearTimeout(searchTimer.value)
      searchTimer.value = null
    }
  }

  // 选择学校项
  const selectSchoolItem = (index) => {
    tempSelectedIndex.value = index
    console.log('选择学校项:', index, schoolList.value[index])
  }

  // 确认学校选择
  const confirmSchoolSelection = () => {
    if (
      tempSelectedIndex.value >= 0 &&
      schoolList.value[tempSelectedIndex.value]
    ) {
      selectedSchoolIndex.value = tempSelectedIndex.value
      selectedSchool.value = schoolList.value[tempSelectedIndex.value]
      console.log('确认选择的学校:', selectedSchool.value)
    }
    hideSchoolPicker()
  }

  // 当前选中的学校名称
  const selectedSchoolName = computed(() => {
    if (selectedSchool.value) {
      return getSchoolName(selectedSchool.value)
    }
    return ''
  })

  const maleImageSrc = computed(() => {
    return selectedSex.value === 'male'
      ? '../../static/sex/male-select.png'
      : '../../static/sex/male-unselect.png'
  })

  const femaleImageSrc = computed(() => {
    return selectedSex.value === 'female'
      ? '../../static/sex/female-select.png'
      : '../../static/sex/female-unselect.png'
  })

  // 选择性别的方法
  const selectSex = (sex) => {
    selectedSex.value = sex
    console.log('选择的性别:', selectedSex.value)
  }

  const rawDate = ref('2007-10-01')
  const startDate = ref('1900-01-01')
  const endDate = ref('2015-10-01')

  // 显示用计算属性（自动转换为带中文的数组）
  const dateParts = computed(() => {
    const [year, month, day] = rawDate.value.split('-')
    return {
      year,
      month: parseInt(month), // 去除前导零
      day: parseInt(day), // 去除前导零
    }
  })

  const bindDateChange = (e) => {
    rawDate.value = e.detail.value
  }

  const handleNext = () => {
    // 存储学校信息
    if (selectedSchool.value) {
      uni.setStorage({
        key: 'school',
        data: selectedSchool.value,
        success: (result) => {
          console.log('学校存储成功:', result)
        },
        fail: (error) => {
          console.log('学校存储失败:', error)
        },
      })
    } else {
      uni.showToast({
        title: '请先选择学校',
        icon: 'none',
      })
      return
    }
    if (selectedSex.value) {
      console.log('选择的性别:', selectedSex.value)
      console.log('选择的日期:', rawDate.value)
      uni.setStorage({
        key: 'sex',
        data: selectedSex.value,
        success: (result) => {
          console.log('性别存储成功:', result)
        },
        fail: (error) => {
          console.log('性别存储失败:', error)
        },
      })
      uni.setStorage({
        key: 'birth',
        data: rawDate.value,
        success: (result) => {
          console.log('出生日期存储成功:', result)
          uni.reLaunch({ url: '/pages/questionnaire/questionnaire' })
        },
        fail: (error) => {
          console.log('出生日期存储失败:', error)
        },
      })
      uni.setStorage({
        key: 'isFirst',
        data: true,
        success: (result) => {
          console.log('首次使用存储成功:', result)
        },
        fail: (error) => {
          console.log('首次使用存储失败:', error)
        },
      })
    } else {
      uni.showToast({
        title: '请先选择性别',
        icon: 'none',
      })
    }
  }
</script>

<style lang="scss" scoped>
  @import './index.scss';

  // 学校选择弹窗样式
  .school-picker-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: flex-end;
  }

  .school-picker-content {
    width: 100%;
    max-height: 60%;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;
    display: flex;
    flex-direction: column;
  }

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 30rpx 20rpx;
    border-bottom: 1rpx solid #eee;
    flex-shrink: 0;

    .cancel-btn,
    .confirm-btn {
      color: #007aff;
      font-size: 32rpx;
      padding: 10rpx;
    }

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .search-container {
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #eee;
    flex-shrink: 0;

    .search-input {
      width: 100%;
      height: 80rpx;
      background-color: #f5f5f5;
      border-radius: 40rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }

  .school-list {
    flex: 1;
    padding: 0 30rpx;
    min-height: 400rpx;
    max-height: 60vh; // 添加最大高度确保滚动
    height: 60vh; // 固定高度确保滚动
  }

  .school-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    &.selected {
      background-color: #f0f9ff;

      .school-item-name {
        color: #007aff;
      }
    }

    .school-item-name {
      font-size: 32rpx;
      color: #333;
      flex: 1;
    }

    .check-icon {
      color: #007aff;
      font-size: 32rpx;
      font-weight: bold;
    }
  }

  .load-more,
  .loading,
  .no-data,
  .no-more {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 28rpx;
  }

  .no-more {
    color: #ccc;
  }
</style>
