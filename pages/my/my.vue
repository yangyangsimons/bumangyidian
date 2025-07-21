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
    <view class="header">
      <image class="avator" :src="avator" @click="changeAvator"></image>

      <view class="info-container">
        <view class="user-info-setting">
          <view class="user-info">
            <view class="name">{{ userName }} </view>
            <view class="school">{{ school }}</view></view
          >
          <view class="setting">
            <image src="../../static/setting.png" mode="scaleToFill" />
          </view>
        </view>

        <view class="checkin-container">
          <view class="checkin">
            <!-- <image class="checkin-icon"></image> -->
            <view class="checkin-text">已签到{{ 26 }}天</view>
            <view class="checkin-points">积分：{{ 26 }}</view>
          </view>

          <view class="checkin-btn">
            <image class="checkin-btn-bg"></image>
            <text>签到</text>
          </view>
        </view>
      </view>
    </view>
    <view class="main"></view>
    <view class="footer"></view>
  </view>
</template>

<script setup>
  import { ref } from 'vue'
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
  const school = ref('湖南工商大学') // 用户学校
  const sptime = ref(0)
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

  onShow(async () => {
    // sptime.value = new Date().getTime()
    // dmReport(
    //   'pv',
    //   {},
    //   {
    //     contents: [
    //       {
    //         page: 'userInfo',
    //       },
    //     ],
    //   }
    // )
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
        userMbtiShort.value = userInfoRes.data.mbti
        userMbti.value = userInfoRes.data.mbti_ch
        userSex.value = userInfoRes.data.sex
        school.value = userInfoRes.data.school_name
        sexSrc.value =
          userSex.value === '男'
            ? '../../static/male.png'
            : '../../static/female.png'
      } else {
        console.error('获取用户信息失败', userInfoRes.message)
      }
    } catch (error) {
      console.error('打开弹窗失败', error)
    }
  })
</script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
