// stores/systemStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { baseUrl } from '../utils/config'
import request from '../utils/request'

export const useSystemStore = defineStore('system', () => {
  // 状态
  const systemModel = ref({}) // 保存整个 system_model 对象(包含两种模式)
  const shinePoint = ref(null)
  const currentMode = ref('') // 当前选中的模式名称

  // Getters
  const availableModes = computed(() => Object.keys(systemModel.value))

  // 获取当前模式的背景图片数据
  const currentBackground = computed(() => {
    if (!currentMode.value || !systemModel.value[currentMode.value]) {
      return null
    }
    return {
      pic_id: systemModel.value[currentMode.value].pic_id,
      pic_url: systemModel.value[currentMode.value].pic_url,
    }
  })

  // 获取当前可用模式（针对金种子杯模式可能有valid字段）
  const validModes = computed(() => {
    const modes = {}
    for (const [name, mode] of Object.entries(systemModel.value)) {
      if (!('valid' in mode) || mode.valid) {
        modes[name] = mode
      }
    }
    return modes
  })

  // Actions
  function saveSystemData(response) {
    if (response.code === 0 && response.data) {
      // 保存shine_point数据
      shinePoint.value = response.data.shine_point

      // 保存system_model数据
      if (response.data.system_model) {
        systemModel.value = response.data.system_model

        // 如果未设置当前模式，则默认选择第一个可用的模式
        if (!currentMode.value) {
          const validModeKeys = Object.keys(validModes.value)
          if (validModeKeys.length > 0) {
            currentMode.value = validModeKeys[0]
          }
        }
      }
    }
  }

  function setCurrentMode(modeName) {
    if (systemModel.value[modeName]) {
      currentMode.value = modeName
    }
  }

  async function fetchSystemData() {
    try {
      const [error, res] = await uni
        .request({
          url: 'YOUR_API_ENDPOINT',
          method: 'GET',
        })
        .then((res) => [null, res])
        .catch((error) => [error, null])

      if (error) {
        throw error
      }

      saveSystemData(res.data)
      return res.data
    } catch (error) {
      console.error('获取系统数据失败:', error)
      throw error
    }
  }

  return {
    systemModel,
    shinePoint,
    currentMode,
    availableModes,
    validModes,
    currentBackground,
    saveSystemData,
    setCurrentMode,
    fetchSystemData,
  }
})
