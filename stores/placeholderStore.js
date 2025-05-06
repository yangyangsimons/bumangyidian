import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlaceholderStore = defineStore('placeholder', () => {
  // 定义占位符数据
  const normalPlaceholders = [
    '现在想聊什么?',
    '开心还是emo？在线接招中。',
    '你的树洞已上线，随便说吧！',
    '今天有什么新鲜事？来聊聊~',
    '任意关键词，解锁你的话题！',
  ]

  const specialPlaceholders = [
    '输入问题，查询创新创业政策',
    '创业不孤单，学长为你护航',
    '你的创业难题，湖南来兜底！',
    '创业第一步？最佳政策匹配上！',
  ]

  // 当前的placeholder文本
  const currentPlaceholder = ref('')

  // 生成随机索引的函数
  const getRandomIndex = (array) => {
    return Math.floor(Math.random() * array.length)
  }

  // 设置普通占位符
  const setRandomNormalPlaceholder = () => {
    const randomIndex = getRandomIndex(normalPlaceholders)
    currentPlaceholder.value = normalPlaceholders[randomIndex]
    return currentPlaceholder.value
  }

  // 设置特殊占位符
  const setRandomSpecialPlaceholder = () => {
    const randomIndex = getRandomIndex(specialPlaceholders)
    currentPlaceholder.value = specialPlaceholders[randomIndex]
    return currentPlaceholder.value
  }

  // 初始化时设置一个默认值
  setRandomNormalPlaceholder()

  return {
    currentPlaceholder,
    setRandomNormalPlaceholder,
    setRandomSpecialPlaceholder,
  }
})
