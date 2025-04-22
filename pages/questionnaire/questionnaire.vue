<template>
  <view class="questionnaire-container">
    <image class="global-title" src="../../static/global-title.png"></image>
    <view class="header">
      <text class="title">{{ question_text }}</text>
      <text class="describe">方便我们为你提供更精准的服务</text>
    </view>
    <view class="main">
      <view class="mbti-container">
        <view
          v-for="(value, key) in options"
          :key="key"
          class="mbti-item"
          :class="{ active: selectedMbti === key }"
          @click="selectMBTI(key)"
        >
          <text class="mbti-title">{{ key }}</text>
          <text class="mbti-text">{{ value }}</text>
        </view>
      </view>
    </view>
    <view class="footer">
      <button class="next" @click="handleNext">
        <text class="next-text">开启</text>
      </button>
      <view class="skip" @click="skip"
        ><text>不知道，跳过</text>
        <image class="skip-icon" src="../../static/skip.png" mode="scaleToFill"
      /></view>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
  import { baseUrl } from '@/utils/config'
  import request from '@/utils/request'

  const options = ref({})
  const sex = ref('') // 记录性别
  const birth = ref('') // 记录出生日期
  const selectedMbti = ref('') // 记录选中的MBTI类型的key
  const selectedMbtiValue = ref('') // 记录选中的MBTI类型的value
  const question_id = ref('') // 记录问题ID
  const question_text = ref('') // 记录问题文本
  const changeMbti = ref(false) // 记录MBTI类型
  onLoad((param) => {
    // 页面加载时的逻辑
    console.log('页面加载questionnaire', param)
    if (param.changeMbti !== undefined) {
      changeMbti.value = true
    }
  })
  onShow(async () => {
    // 页面显示时的逻辑
    console.log('页面显示questionnaire')
    try {
      const res = await request(`${baseUrl}/user/question`, 'GET')
      console.log('获取问卷数据', res)
      if (res.code === 0) {
        question_id.value = res.data[0].id
        options.value = res.data[0].options
        question_text.value = res.data[0].question_text
      }
    } catch (e) {
      console.error('获取问卷数据失败', e)
      uni.showToast({
        title: '网络异常，请稍后再试',
        icon: 'none',
      })
    }
  })

  const selectMBTI = (key, value) => {
    selectedMbti.value = key
    selectedMbtiValue.value = options.value[key]
    console.log('选择了MBTI:', key, selectedMbtiValue.value)
  }

  const handleNext = async () => {
    if (changeMbti.value) {
      console.log(selectedMbtiValue.value)
      const res = await request(`${baseUrl}/user/update_mbti`, 'POST', {
        mbti: selectedMbtiValue.value,
      })
      uni.reLaunch({ url: '/pages/index/index' })
      return
    }
    // 处理下一步逻辑
    uni.getStorage({
      key: 'sex',
      success: ({ data }) => {
        console.log('获取到的性别:', data)
        if (data == 'male') {
          sex.value = '男'
        } else {
          sex.value = '女'
        }
        console.log('获取到的出生日期:', birth.value)
      },
      fail: (error) => {
        console.error('获取性别失败', error)
        return
      },
    })
    uni.getStorage({
      key: 'birth',
      success: async ({ data }) => {
        birth.value = data
        if (selectedMbti.value) {
          console.log('提交选择', selectedMbti.value, selectedMbtiValue.value)
          try {
            const res = await request(`${baseUrl}/user/register`, 'POST', {
              sex: sex.value,
              birth: birth.value,
              username: '李思明',
              avator: 'http://avatar1',
              answers: [
                {
                  question_id: question_id.value,
                  option: [selectedMbtiValue.value],
                },
              ],
            })
            console.log('提交问卷结果', res)
            if (res.code == 0) {
              uni.reLaunch({ url: '/pages/index/index' })
            }
          } catch (e) {
            console.error('提交问卷结果失败', e)
            uni.showToast({
              title: '网络异常，请稍后再试',
              icon: 'none',
            })
          }
          // 这里可以添加提交数据或跳转逻辑
        } else {
          uni.showToast({
            title: '请先选择一个MBTI类型',
            icon: 'none',
          })
        }
      },
      fail: (error) => {
        console.error('获取出生日期失败', error)
        return
      },
    })
  }

  const skip = async () => {
    if (changeMbti.value) {
      uni.reLaunch({ url: '/pages/index/index' })
      return
    }
    // 处理下一步逻辑
    uni.getStorage({
      key: 'sex',
      success: ({ data }) => {
        console.log('获取到的性别:', data)
        if (data == 'male') {
          sex.value = '男'
        } else {
          sex.value = '女'
        }
        console.log('获取到的出生日期:', birth.value)
      },
      fail: (error) => {
        console.error('获取性别失败', error)
        return
      },
    })
    uni.getStorage({
      key: 'birth',
      success: async ({ data }) => {
        birth.value = data
        try {
          const res = await request(`${baseUrl}/user/register`, 'POST', {
            sex: sex.value,
            birth: birth.value,
            username: '李思明',
            avator: 'http://avatar1',
            answers: [],
          })
          console.log('提交问卷结果', res)
          if (res.code == 0) {
            uni.reLaunch({ url: '/pages/index/index' })
          }
        } catch (e) {
          console.log('提交问卷结果失败', e)
          uni.showToast({
            title: '网络异常，请稍后再试',
            icon: 'none',
          })
        }
      },
      fail: (error) => {
        console.error('获取出生日期失败', error)
        return
      },
    })
  }
</script>

<style lang="scss" scoped>
  @import 'index.scss';

  // 如果在index.scss中没有定义active样式，可以在这里添加
</style>
