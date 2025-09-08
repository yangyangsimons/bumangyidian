<template>
  <view class="questionnaire-container">
    <image class="global-title" src="../../static/global-title.png"></image>
    <view class="header">
      <view class="title">
        <text>你的 MBTI 是什么</text>
        <view class="bar"></view>
      </view>
      <text class="describe">让我们更懂你一点</text>
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
  import { ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { baseUrl } from '@/utils/config'
  import request from '@/utils/request'

  const options = ref({})
  const sex = ref('') // 记录性别
  const birth = ref('') // 记录出生日期
  const school = ref('') // 记录学校
  const selectedMbti = ref('') // 记录选中的MBTI类型的key
  const selectedMbtiValue = ref('') // 记录选中的MBTI类型的value
  const question_id = ref('') // 记录问题ID
  const question_text = ref('') // 记录问题文本
  const changeMbti = ref(false) // 记录MBTI类型
  const dataLoaded = ref(false) // 记录数据是否加载完成
  const schoolNumber = ref('') // 学号

  onLoad((param) => {
    console.log('页面加载questionnaire', param)
    if (param.changeMbti !== undefined) {
      changeMbti.value = true
    }
  })

  onShow(async () => {
    console.log('页面显示questionnaire')
    dataLoaded.value = false

    try {
      // 并行获取问卷数据和storage数据
      await Promise.all([getQuestionnaireData(), getStorageData()])
      dataLoaded.value = true
    } catch (error) {
      console.error('数据加载失败', error)
      uni.showToast({
        title: '数据加载失败，请稍后再试',
        icon: 'none',
      })
    }
  })

  // 获取问卷数据
  const getQuestionnaireData = async () => {
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
      throw new Error('获取问卷数据失败')
    }
  }

  // 获取storage数据
  const getStorageData = async () => {
    try {
      // 使用Promise.all并行获取所有storage数据
      const [schoolData, sexData, birthData, schoolNumberData] =
        await Promise.all([
          getStorageItem('school'),
          getStorageItem('sex'),
          getStorageItem('birth'),
          getStorageItem('schoolNumber'),
        ])

      school.value = schoolData.id
      sex.value = sexData === 'male' ? '男' : '女'
      birth.value = birthData
      schoolNumber.value = schoolNumberData || ''

      console.log('预加载数据完成:', {
        school: school.value,
        sex: sex.value,
        birth: birth.value,
        schoolNumber: schoolNumber.value,
      })
    } catch (error) {
      console.error('获取storage数据失败', error)
      throw new Error('获取用户数据失败')
    }
  }

  // 封装获取storage的方法
  const getStorageItem = (key) => {
    return new Promise((resolve, reject) => {
      uni.getStorage({
        key,
        success: ({ data }) => {
          resolve(data)
        },
        fail: (error) => {
          console.error(`获取${key}失败`, error)
          reject(error)
        },
      })
    })
  }

  const selectMBTI = (key) => {
    selectedMbti.value = key
    selectedMbtiValue.value = options.value[key]
    console.log('选择了MBTI:', key, selectedMbtiValue.value)
  }

  const handleNext = async () => {
    if (!dataLoaded.value) {
      uni.showToast({
        title: '数据加载中，请稍后',
        icon: 'none',
      })
      return
    }

    // 如果是修改MBTI的情况
    if (changeMbti.value) {
      if (!selectedMbti.value) {
        uni.showToast({
          title: '请先选择一个MBTI类型',
          icon: 'none',
        })
        return
      }

      try {
        const res = await request(`${baseUrl}/user/update_mbti`, 'POST', {
          mbti: selectedMbtiValue.value,
        })
        console.log('更新MBTI结果', res)
        uni.reLaunch({ url: '/pages/index/index' })
      } catch (e) {
        console.error('更新MBTI失败', e)
        uni.showToast({
          title: '网络异常，请稍后再试',
          icon: 'none',
        })
      }
      return
    }

    // 验证必要数据
    if (!school.value) {
      uni.showToast({
        title: '请先选择学校',
        icon: 'none',
      })
      return
    }

    if (!selectedMbti.value) {
      uni.showToast({
        title: '请先选择一个MBTI类型',
        icon: 'none',
      })
      return
    }

    // 提交注册数据
    try {
      const res = await request(`${baseUrl}/user/register`, 'POST', {
        sex: sex.value,
        birth: birth.value,
        username: '不芒一点同学',
        avator: 'http://avatar1',
        answers: [
          {
            question_id: question_id.value,
            option: [selectedMbtiValue.value],
          },
        ],
        school: school.value,
        id_number: schoolNumber.value,
      })
      console.log('提交问卷结果', res)
      if (res.code === 0) {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    } catch (e) {
      console.error('提交问卷结果失败', e)
      uni.showToast({
        title: '网络异常，请稍后再试',
        icon: 'none',
      })
    }
  }

  const skip = async () => {
    if (!dataLoaded.value) {
      uni.showToast({
        title: '数据加载中，请稍后',
        icon: 'none',
      })
      return
    }

    // 如果是修改MBTI的情况
    if (changeMbti.value) {
      uni.reLaunch({ url: '/pages/index/index' })
      return
    }

    // 验证必要数据
    if (!school.value) {
      uni.showToast({
        title: '请先选择学校',
        icon: 'none',
      })
      return
    }

    // 提交跳过的注册数据
    try {
      const res = await request(`${baseUrl}/user/register`, 'POST', {
        sex: sex.value,
        birth: birth.value,
        school: school.value,
        username: '不芒同学',
        avator: 'http://avatar1',
        answers: [],
      })
      console.log('跳过提交结果', res)
      if (res.code === 0) {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    } catch (e) {
      console.error('跳过提交失败', e)
      uni.showToast({
        title: '网络异常，请稍后再试',
        icon: 'none',
      })
    }
  }
</script>

<style lang="scss" scoped>
  @import 'index.scss';
</style>
