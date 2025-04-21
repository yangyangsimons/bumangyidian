<template>
  <view class="hello-container">
    <image class="global-title" src="../../static/global-title.png"></image>
    <!-- <uni-nav-bar title="不芒一点" left-icon="left" /> -->
    <view class="header">
      <text class="title">Hello</text>
      <text class="describe">这是你的专属电台,先认识下吧</text>
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
    </view>
    <view class="footer">
      <button class="next" @click="handleNext">
        <text class="next-text">下一步</text>
      </button>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue'
  const selectedSex = ref('male')
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

  const rawDate = ref('2020-10-10')
  const startDate = ref('1900-01-01')
  const endDate = ref('2023-10-01')

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
    // console.log('date', e)
  }
  const handleNext = () => {
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
</style>
