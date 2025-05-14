<template>
  <uni-popup @change="popupChange" ref="userPopupRef">
    <view class="user-container">
      <image
        class="bg"
        src="../../static/user-info-bg.png"
        mode="scaleToFill"
      />
      <view class="header">
        <image class="avator" :src="avator" @click="changeAvator"></image>
        <view class="user-info">
          <view class="name"
            >{{ userName }}
            <image
              class="change"
              src="../../static/change.png"
              @click="changeName"
            ></image>
          </view>
          <view class="info-container">
            <view class="age">{{ userAge }}岁</view>
            <view class="sex">
              <image class="sex-icon" :src="sexSrc"></image>
            </view>
            <view class="mbti">
              <view class="mbti-name">{{ userMbti }}</view>
              <view class="mbti-short">{{ userMbtiShort }}</view>
            </view>
            <image
              class="change"
              src="../../static/change.png"
              @click="changeMbti"
            ></image>
          </view>
        </view>
      </view>
      <view class="main">
        <view class="title">
          <text class="name">切换音色</text>
          <view class="bar"></view>
        </view>
        <view class="tones-container">
          <view
            v-for="(item, index) in tones"
            :key="index"
            class="tone-container"
            :class="{ active: item.active }"
            @click="toneClick(item.id, index)"
          >
            <view class="image-container">
              <image class="tone" :src="item.icon" mode="scaleToFill"></image>
              <view class="check">
                <image
                  class="check-icon"
                  src="../../static/check.png"
                  mode="scaleToFill"
                ></image>
              </view>
            </view>
            <view class="describe">
              <text class="name">{{ item.name }}</text>
              <text class="style">{{ item.style }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="footer">
        <!-- <button class="try" @click="tryListen">试听音色</button> -->
        <button class="confirm" @click="updateTone">确认</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
  import { ref, defineExpose, defineEmits } from 'vue'
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  import { baseUrl } from '../../utils/config'
  import { useWebSocketStore } from '@/stores/websocket'
  import { useBarrageStore } from '../../stores/barrage'
  import { useModelStore } from '../../stores/model'
  // 导入音频播放器状态管理
  import { useAudioPlayerStore } from '@/stores/audioPlayer'
  import { useToggleModelStore } from '../../stores/toggleModelStore'
  import { dmReport } from '../../utils/report'

  const modelStore = useModelStore()
  const toggleModelStore = useToggleModelStore()
  const wsStore = useWebSocketStore()
  // 初始化音频播放器状态管理
  const audioPlayerStore = useAudioPlayerStore()
  // 初始化弹幕状态管理
  const barrageStore = useBarrageStore()

  const currentTone = ref(null)
  const tones = ref([])
  const toneId = ref(null)
  // 添加音频播放器引用
  const audioPlayer = ref(null)
  // 记录当前选中的音色ID
  const selectedToneId = ref(null)
  const currentTonePath = ref(null)

  //用户信息
  const user = ref(null)
  const userName = ref('') // 用户名
  const userSex = ref('') // 用户性别
  const userAge = ref('') // 用户年龄
  const userMbti = ref('') // 用户MBTI类型
  const userMbtiShort = ref('') // 用户MBTI类型简称
  const avator = ref('') // 用户头像
  const sexSrc = ref('') // 用户性别图标路径
  const sptime = ref(0)
  onShow(async () => {
    // 页面显示时，获取用户信息
    try {
      const toneRes = await request(`${baseUrl}/tone/query`, 'get')
      if (toneRes.code === 0) {
        console.log('获取音色信息成功', toneRes.data)
        tones.value = toneRes.data
        // 处理音色信息
        // 例如：将音色信息存储到状态管理中
      } else {
        console.error('获取音色信息失败', toneRes.message)
      }
    } catch (e) {
      console.error('获取音色信息失败', e)
    }
  })

  //处理用户出生日期
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 0 // 处理空值
    const parts = birthDateString.split('-')
    if (parts.length !== 3) return 0 // 处理无效格式

    const birthYear = parseInt(parts[0], 10)
    const birthMonth = parseInt(parts[1], 10)
    const birthDay = parseInt(parts[2], 10)

    // 验证是否为有效日期
    if ([birthYear, birthMonth, birthDay].some(isNaN)) return 0

    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1 // 月份从0开始，需+1
    const currentDay = today.getDate()

    let age = currentYear - birthYear

    // 如果当前月份小于出生月份，或月份相同但日期未到，年龄减1
    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && currentDay < birthDay)
    ) {
      age--
    }

    return age
  }
  const toneClick = (id, index) => {
    // 点击音色时的处理逻辑
    console.log('点击音色', id, index)
    tones.value.forEach((item, i) => {
      item.active = i === index
    })
    selectedToneId.value = id
    currentTone.value = tones.value[index]

    // 查找对应的音色项
    const selectedTone = tones.value.find((item) => item.id === id)
    //更新音色试听的path
    if (selectedTone) {
      console.log('选中的音色', selectedTone)
      //上报选中音色
      dmReport(
        'click',
        {},
        {
          page: 'userInfo',
          contents: [
            {
              element_id: 'content',
              element_content: `${selectedTone.name}`,
            },
          ],
        }
      )
      currentTonePath.value = selectedTone.path
    } else {
      console.error('未找到对应的音色项')
    }
    tryListen()
  }

  // 播放音频的函数
  const playAudio = (path) => {
    // 确保每次都创建新的音频上下文，避免同时播放多个音频
    if (audioPlayer.value) {
      audioPlayer.value.stop()
      audioPlayer.value.destroy()
    }

    audioPlayer.value = uni.createInnerAudioContext()
    audioPlayer.value.onError((res) => {
      console.error('音频播放错误', res)
    })

    // 设置音频源
    audioPlayer.value.src = path

    // 播放音频
    audioPlayer.value.play()
    // 添加音频播放完成事件监听
    audioPlayer.value.onEnded(() => {
      console.log('试听音频播放完成')
      // 播放完成后，继续播放原来的音频
      audioPlayerStore.setTtsVolume(1)
    })
    audioPlayer.value.onPlay(() => {
      console.log('试听音频开始播放')
      audioPlayerStore.setTtsVolume(0)
    })
  }

  // 试听按钮点击事件
  const tryListen = () => {
    // 试听音色的处理逻辑
    // audioPlayerStore.reportCurrentProgress()
    audioPlayerStore.setTtsVolume(0.1)
    // barrageStore.clearMessages()
    // console.log('清空消息列表')
    if (currentTone.value && currentTonePath.value) {
      playAudio(currentTonePath.value)
    } else {
      uni.showToast({
        title: '请先选择音色',
        icon: 'none',
      })
    }
  }

  // 更新音色按钮点击事件
  const updateTone = async () => {
    dmReport(
      'click',
      {},
      {
        page: 'userInfo',
        contents: [
          {
            element_id: 'content',
            element_content: `确认`,
          },
        ],
      }
    )
    if (!selectedToneId.value) {
      uni.showToast({
        title: '请先选择音色',
        icon: 'none',
      })
      return
    }
    if (audioPlayer.value) {
      audioPlayer.value.stop()
      audioPlayer.value.destroy()
    }
    audioPlayer.value = null
    audioPlayerStore.setTtsVolume(1)
    console.log('更新音色', selectedToneId.value)
    //先判断是不是选择了id为6的音色，这是金种子，不更新给后台
    if (selectedToneId.value == 6 && modelStore.model !== '金种子杯模式') {
      // 选中的是音色6，触发模式切换逻辑
      console.log(
        '选了金种子，直接切换模式，不更新音色了',
        selectedToneId.value
      )
      toggleModelStore.triggerModelChange()
      return
    }
    if (selectedToneId.value == 6 && modelStore.model == '金种子杯模式') {
      //金种子杯模式下，选中的是音色6，什么都不做；
      console.log(
        '金种子杯模式下选中的是音色6，什么都不做',
        selectedToneId.value
      )
    }

    const res = await request(`${baseUrl}/tone/update`, 'post', {
      tone_id: selectedToneId.value,
    })
    if (res.code === 0) {
      audioPlayerStore.setTtsVolume(1)

      console.log('触发模式切换逻辑', selectedToneId.value)
      console.log('触发模式切换逻辑', modelStore.model)

      uni.showToast({
        title: '音色更新成功',
        icon: 'success',
      })
      if (modelStore.model == '金种子杯模式' && selectedToneId.value !== 6) {
        // 选中的是音色不是6，触发模式切换逻辑
        console.log(
          '金种子杯模式下面选了不是6的音色，触发模式切换逻辑',
          selectedToneId.value
        )
        toggleModelStore.triggerModelChange()
      }
    } else {
      uni.showToast({
        title: '请稍后再试',
        icon: 'none',
      })
    }
  }

  //更换头像
  // 更换头像
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
  //更换名字
  const changeName = async () => {
    dmReport(
      'click',
      {},
      {
        page: 'userInfo',
        contents: [
          {
            element_id: 'content',
            element_content: `修改昵称`,
          },
        ],
      }
    )
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
  //更换mbti
  const changeMbti = async () => {
    dmReport(
      'click',
      {},
      {
        page: 'userInfo',
        contents: [
          {
            element_id: 'content',
            element_content: `修改MBTI`,
          },
        ],
      }
    )
    uni.reLaunch({
      url: '/pages/questionnaire/questionnaire?changeMbti=changeMbti',
    })
  }
  //控制弹窗的显示
  const userPopupRef = ref(null)
  const popupChange = (e) => {
    console.log('popupChange', e)
    console.log('状态', e.show)
    if (!e.show) {
      const endTime = new Date().getTime()
      const duration = endTime - sptime.value
      dmReport(
        'stay',
        {},
        {
          contents: [
            {
              page: 'userInfo',
              sptime: duration,
            },
          ],
        }
      )
    }
  }
  // 暴露方法以便父组件调用
  const open = async () => {
    sptime.value = new Date().getTime()
    dmReport(
      'pv',
      {},
      {
        contents: [
          {
            page: 'userInfo',
          },
        ],
      }
    )
    try {
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
        userAge.value = calculateAge(userInfoRes.data.birth)
        userMbtiShort.value = userInfoRes.data.mbti
        userMbti.value = userInfoRes.data.mbti_ch
        userSex.value = userInfoRes.data.sex
        sexSrc.value =
          userSex.value === '男'
            ? '../../static/male.png'
            : '../../static/female.png'
        // 处理用户信息
        // 例如：将用户信息存储到状态管理中
        // 新增：设置初始选中的音色
        if (toneId.value && tones.value.length > 0) {
          tones.value.forEach((item) => {
            // 根据用户的toneId设置音色的active状态
            item.active = item.id === toneId.value
            // 如果是当前选中的音色，更新相关状态
            if (item.active) {
              selectedToneId.value = item.id
              currentTone.value = item
              currentTonePath.value = item.path
            }
          })
        }
      } else {
        console.error('获取用户信息失败', userInfoRes.message)
      }
    } catch (error) {
      console.error('打开弹窗失败', error)
    }

    userPopupRef.value.open('bottom')
    if (modelStore.model === '金种子杯模式') {
      const index = tones.value.findIndex((item) => item.id === 6)
      console.log('打开了音色页面，金种子杯模式')
      autoClick(6, index)
    }
  }
  const autoClick = (id, index) => {
    // 点击音色时的处理逻辑
    console.log('点击音色', id, index)
    tones.value.forEach((item, i) => {
      item.active = i === index
    })
    selectedToneId.value = id
    currentTone.value = tones.value[index]

    // 查找对应的音色项
    const selectedTone = tones.value.find((item) => item.id === id)
    //更新音色试听的path
    if (selectedTone) {
      console.log('选中的音色', selectedTone)
      currentTonePath.value = selectedTone.path
    } else {
      console.error('未找到对应的音色项')
    }
  }

  const close = () => {
    userPopupRef.value.close()
    console.log('关闭弹窗')
  }

  // 将方法暴露给父组件
  defineExpose({
    open,
    close,
  })
</script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
