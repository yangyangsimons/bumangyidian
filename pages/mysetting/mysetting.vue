<template>
  <view class="mysetting">
    <!-- 现有的导航栏和背景保持不变 -->
    <uni-nav-bar
      :fixed="true"
      :status-bar="true"
      :shadow="false"
      background-color="rgba(255, 255, 255, 0)"
      color="#333"
      :border="false"
      leftWidth="0"
    >
      <uni-icons
        type="left"
        size="22"
        class="nav-icon"
        @click="goBack"
      ></uni-icons>
      <view class="nav-title">
        <text class="title-text">设置</text>
      </view>
    </uni-nav-bar>
    <image class="bg" src="../../static/my/bg.png" mode="scaleToFill"></image>

    <view class="container">
      <view class="header">
        <view class="avator">
          <view class="text">头像</view>
          <image :src="avator" @click="changeAvator"></image>
        </view>
      </view>
      <view class="main">
        <view class="username" @click="changeName">
          <view class="text">昵称</view>
          <view class="value">{{ userName }}</view>
        </view>
        <view class="sex">
          <view class="text">性别</view>
          <view class="value">{{ sex }}</view>
        </view>
        <view class="age">
          <view class="text">年龄</view>
          <view class="value">{{ age }}</view>
        </view>
        <!-- 修改学校部分，添加点击事件 -->
        <view class="school" @click="showSchoolPicker">
          <view class="text">学校</view>
          <view class="value">{{ school }}</view>
          <view class="arrow"
            ><image src="../../static//my/arrow.png" mode="scaleToFill"
          /></view>
        </view>
      </view>
      <!-- 修改MBTI部分，添加点击事件 -->
      <view class="mbti" @click="showMbtiPicker">
        <view class="text">MBTI</view>
        <view class="value"
          >{{ mbti }}
          <view class="arrow"
            ><image src="../../static//my/arrow.png" mode="scaleToFill" /></view
        ></view>
      </view>
      <view class="agreements">
        <view class="user-agreement" @click="openAgreement('user')">
          <view class="text">用户协议</view>
          <view class="arrow"
            ><image src="../../static//my/arrow.png" mode="scaleToFill" /></view
        ></view>
        <view class="privacy-policy" @click="openAgreement('privacy')">
          <view class="text">隐私政策</view>
          <view class="arrow"
            ><image src="../../static//my/arrow.png" mode="scaleToFill" /></view
        ></view>
        <view class="about-us">
          <view class="text">版本号</view>
          <view class="arrow">2.0.0</view></view
        >
      </view>
      <view class="logout" @click="logout">
        <text class="logout-text">退出账号</text>
      </view>
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

    <!-- MBTI选择弹窗 -->
    <view
      class="mbti-picker-modal"
      v-if="showMbtiModal"
      @click="hideMbtiPicker"
    >
      <view class="mbti-picker-content" @click.stop>
        <!-- 头部 -->
        <view class="picker-header">
          <text class="cancel-btn" @click="hideMbtiPicker">取消</text>
          <text class="title">选择MBTI</text>
          <text class="confirm-btn" @click="confirmMbtiSelection">确定</text>
        </view>

        <!-- MBTI列表 -->
        <scroll-view class="mbti-list" scroll-y>
          <view
            class="mbti-item"
            v-for="(mbtiCode, label) in mbtiOptions"
            :key="mbtiCode"
            :class="{ selected: tempSelectedMbti === mbtiCode }"
            @click="selectMbtiItem(mbtiCode)"
          >
            <view class="mbti-info">
              <text class="mbti-label">{{ label }}</text>
              <text class="mbti-value">{{ mbtiCode }}</text>
            </view>
            <view class="check-icon" v-if="tempSelectedMbti === mbtiCode"
              >✓</view
            >
          </view>

          <!-- 无数据提示 -->
          <view class="no-data" v-if="Object.keys(mbtiOptions).length === 0">
            <text>暂无MBTI数据</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
  import { ref, computed, nextTick } from 'vue'
  import request from '@/utils/request.js'
  import { baseUrl } from '../../utils/config'
  import { dmReport } from '../../utils/report'

  // 现有的响应式数据
  const avator = ref('../../static/logo.png')
  const userName = ref('用户名')
  const sex = ref('保密')
  const age = ref('保密')
  const school = ref('保密')
  const mbti = ref('未设置')
  const mbtiOptions = ref({})

  // 新增MBTI选择相关的响应式数据
  const showMbtiModal = ref(false)
  const tempSelectedMbti = ref('')
  const selectedMbtiValue = ref('')

  //logout相关
  const logout = () => {
    console.log('用户点击了退出登录')
    uni.showModal({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          uni.removeStorageSync('token')
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
            },
            fail: (error) => {
              console.log('首次使用存储失败:', error)
              uni.showToast({
                title: '游客身份体验失败',
                icon: 'none',
              })
            },
          })

          // 跳转到登录页面或首页
          uni.reLaunch({
            url: '/pages/login/login',
          })
        }
      },
    })
  }
  // 返回上一页的方法
  const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      goHome()
    }
  }
  //返回首页的方法
  const goHome = () => {
    uni.reLaunch({
      url: '/pages/index/index',
    })
  }
  // 导航agreement
  const openAgreement = (type) => {
    // 根据类型确定跳转的URL
    const url =
      type === 'user'
        ? '/pages/agreement/agreement?type=user'
        : '/pages/agreement/agreement?type=privacy'

    // 跳转到协议展示页面
    uni.navigateTo({ url })
  }

  // change name
  //更换名字
  const changeName = async () => {
    uni.showModal({
      title: '修改昵称（不超过9个字）',
      editable: true,
      placeholderText: '请输入新的昵称',
      content: userName.value,
      success: async (res) => {
        if (res.confirm && res.content) {
          // 验证名称长度
          if (res.content.length > 10) {
            uni.showToast({
              title: '昵称不能超过20个字符',
              icon: 'none',
            })
            return
          }

          try {
            const result = await request(
              `${baseUrl}/user/update_username`,
              'POST',
              {
                username: res.content,
              }
            )

            if (result.code === 0) {
              // 更新本地显示的用户名
              userName.value = res.content
              uni.showToast({
                title: '昵称修改成功',
                icon: 'success',
              })
              // 更新全局用户状态
              const modelStore = useModelStore()
              if (modelStore.userInfo) {
                modelStore.updateUserInfo({ username: res.content })
              }
            } else {
              uni.showToast({
                title: result.message || '修改失败',
                icon: 'none',
              })
            }
          } catch (error) {
            console.error('修改昵称失败', error)
            uni.showToast({
              title: '网络错误，请稍后再试',
              icon: 'none',
            })
          }
        }
      },
    })
  }

  // 现有的 onShow 方法，保持不变
  onShow(async () => {
    console.log('我的留言页面显示')

    try {
      const userInfo = await request(`${baseUrl}/user/user_info`, 'GET')
      console.log('获取用户信息:', userInfo)
      if (userInfo.code === 0) {
        avator.value = userInfo.data.avator || '../../static/logo.png'
        userName.value = userInfo.data.username || '游客'
        sex.value = userInfo.data.sex || '保密'
        age.value = userInfo.data.birth || '保密'
        school.value = userInfo.data.school_name || '保密'
        // 直接显示英文MBTI代码
        mbti.value = userInfo.data.mbti || '未设置'
        selectedMbtiValue.value = userInfo.data.mbti || ''
      } else {
        console.error('获取用户信息失败:', userInfo.message)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
    try {
      const res = await request(`${baseUrl}/user/question`, 'GET')
      if (res.code === 0) {
        mbtiOptions.value = res.data[0].options || {}
        console.log('MBTI选项:', mbtiOptions.value)
      }
    } catch (e) {
      console.error('获取问卷数据失败', e)
    }
  })

  // 新增学校选择相关的响应式数据
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

  // 现有的更换头像方法保持不变
  const changeAvator = async () => {
    dmReport(
      'click',
      {},
      {
        page: 'userInfo',
        contents: [
          {
            element_id: 'content',
            element_content: `修改头像`,
          },
        ],
      }
    )
    uni.chooseImage({
      count: 1,
      success: async (res) => {
        console.log('选择的头像', res.tempFilePaths[0])
        const avatorFile = res.tempFilePaths[0]

        // 读取文件内容并转换为base64
        uni.getFileSystemManager().readFile({
          filePath: avatorFile,
          encoding: 'base64',
          success: async (readRes) => {
            // 获取base64数据
            const base64String = readRes.data

            // 上传头像
            try {
              const uploadResult = await request(
                `${baseUrl}/user/upload_avatar`,
                'POST',
                {
                  pic_base64: base64String,
                }
              )
              console.log('头像上传成功', uploadResult)
              uni.showToast({
                title: '头像更新成功',
                icon: 'success',
              })
              avator.value = uploadResult.data.avator_url
            } catch (error) {
              console.error('头像上传失败', error)
              uni.showToast({
                title: '头像更新成功',
                icon: 'success',
              })
            }
          },
          fail: (error) => {
            console.error('读取文件失败', error)
            uni.showToast({
              title: '头像更新成功',
              icon: 'success',
            })
          },
        })
      },
      fail: (error) => {
        console.error('选择头像失败', error)
      },
    })
  }

  const showMbtiPicker = () => {
    showMbtiModal.value = true
    // 根据当前显示的英文MBTI代码设置临时选择
    tempSelectedMbti.value = selectedMbtiValue.value
  }

  const hideMbtiPicker = () => {
    showMbtiModal.value = false
    tempSelectedMbti.value = ''
  }

  const selectMbtiItem = (mbtiCode) => {
    tempSelectedMbti.value = mbtiCode // 现在传入的是英文MBTI代码
  }

  const confirmMbtiSelection = async () => {
    if (tempSelectedMbti.value) {
      selectedMbtiValue.value = tempSelectedMbti.value // 英文MBTI代码

      // 直接显示英文MBTI代码，而不是中文标签
      mbti.value = tempSelectedMbti.value // 显示英文代码如 "ENTJ"

      // 调用接口更新MBTI
      try {
        console.log('准备更新MBTI，发送的数据:', {
          mbti: selectedMbtiValue.value,
        })
        const res = await request(`${baseUrl}/user/update_mbti`, 'POST', {
          mbti: selectedMbtiValue.value,
        })
        console.log('更新MBTI结果', res)

        if (res.code === 0) {
          uni.showToast({
            title: 'MBTI更新成功',
            icon: 'success',
          })
        } else {
          uni.showToast({
            title: res.message || '更新失败',
            icon: 'none',
          })
        }
      } catch (e) {
        console.error('更新MBTI失败', e)
        uni.showToast({
          title: '网络异常，请稍后再试',
          icon: 'none',
        })
      }
    }
    hideMbtiPicker()
  }

  // 新增学校相关方法
  const getSchoolName = (school) => {
    return school.name || school.school_name || school.title || ''
  }

  const loadSchools = async (page = 1, reset = false) => {
    if (loading.value) {
      console.log('正在加载中，跳过本次请求')
      return
    }

    loading.value = true

    try {
      let url = `${baseUrl}/school/get_school_list?page=${page}&page_size=${pageSize.value}`

      if (searchKeyword.value.trim()) {
        url += `&name=${encodeURIComponent(searchKeyword.value.trim())}`
      }

      const res = await request(url, 'get', {})

      if (res.code === 0) {
        const newSchools = res.data.data || []

        if (reset) {
          schoolList.value = newSchools
          tempSelectedIndex.value = -1
        } else {
          await nextTick()
          newSchools.forEach((school) => {
            schoolList.value.push(school)
          })

          if (selectedSchool.value && tempSelectedIndex.value === -1) {
            const foundIndex = schoolList.value.findIndex(
              (school) =>
                (school.id && school.id === selectedSchool.value.id) ||
                (school.school_id &&
                  school.school_id === selectedSchool.value.school_id) ||
                getSchoolName(school) === getSchoolName(selectedSchool.value)
            )
            if (foundIndex !== -1) {
              tempSelectedIndex.value = foundIndex
            }
          }
        }

        hasMore.value = newSchools.length >= pageSize.value
        currentPage.value = page

        await nextTick()
      } else {
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
    }
  }

  const handleScrollToLower = async () => {
    if (isSearching.value) {
      return
    }

    if (hasMore.value && !loading.value) {
      const nextPage = currentPage.value + 1
      await loadSchools(nextPage, false)
    }
  }

  const onSearchInput = () => {
    if (searchTimer.value) {
      clearTimeout(searchTimer.value)
    }

    if (!searchKeyword.value.trim()) {
      exitSearchMode()
      return
    }

    searchTimer.value = setTimeout(() => {
      performSearch()
    }, 300)
  }

  const handleSearchConfirm = () => {
    if (searchTimer.value) {
      clearTimeout(searchTimer.value)
    }

    if (searchKeyword.value.trim()) {
      performSearch()
    } else {
      exitSearchMode()
    }
  }

  const performSearch = async () => {
    isSearching.value = true
    currentPage.value = 1
    hasMore.value = false

    await loadSchools(1, true)
  }

  const exitSearchMode = async () => {
    isSearching.value = false
    hasMore.value = true
    currentPage.value = 1

    await loadSchools(1, true)
  }

  const showSchoolPicker = async () => {
    showModal.value = true

    searchKeyword.value = ''
    isSearching.value = false
    currentPage.value = 1
    hasMore.value = true

    tempSelectedIndex.value = selectedSchoolIndex.value

    await loadSchools(1, true)
  }

  const hideSchoolPicker = () => {
    showModal.value = false
    searchKeyword.value = ''
    isSearching.value = false

    if (searchTimer.value) {
      clearTimeout(searchTimer.value)
      searchTimer.value = null
    }
  }

  const selectSchoolItem = (index) => {
    tempSelectedIndex.value = index
  }

  const confirmSchoolSelection = async () => {
    if (
      tempSelectedIndex.value >= 0 &&
      schoolList.value[tempSelectedIndex.value]
    ) {
      selectedSchoolIndex.value = tempSelectedIndex.value
      selectedSchool.value = schoolList.value[tempSelectedIndex.value]

      // 更新显示的学校名称
      school.value = getSchoolName(selectedSchool.value)

      // 调用接口更新用户学校信息
      try {
        const updateResult = await request(
          `${baseUrl}/user/update_school`,
          'POST',
          {
            school_id:
              selectedSchool.value.id || selectedSchool.value.school_id,
            school_name: getSchoolName(selectedSchool.value),
          }
        )

        if (updateResult.code === 0) {
          uni.showToast({
            title: '学校更新成功',
            icon: 'success',
          })
        } else {
          uni.showToast({
            title: updateResult.message || '更新失败',
            icon: 'none',
          })
        }
      } catch (error) {
        console.error('更新学校信息失败:', error)
        uni.showToast({
          title: '更新失败',
          icon: 'none',
        })
      }
    }
    hideSchoolPicker()
  }
</script>

<style lang="scss" scoped>
  @import './index.scss';

  // 为MBTI弹窗添加样式，复用学校选择弹窗的样式
  .mbti-picker-modal {
    @extend .school-picker-modal;
  }

  .mbti-picker-content {
    @extend .school-picker-content;
  }

  .mbti-list {
    @extend .school-list;
  }

  .mbti-item {
    @extend .school-item;

    .mbti-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .mbti-label {
        font-size: 16px;
        color: #333;
        margin-bottom: 4px;
      }

      .mbti-value {
        font-size: 14px;
        color: #666;
      }
    }
  }
</style>
