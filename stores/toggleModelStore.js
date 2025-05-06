// stores/modelStore.js
import { defineStore } from 'pinia'

export const useToggleModelStore = defineStore('toggleModel', {
  state: () => ({
    // 可以在这里添加需要共享的状态
    shouldToggleModel: false,
  }),
  actions: {
    // 触发模型变更的方法
    triggerModelChange() {
      this.shouldToggleModel = true
    },
    // 重置状态的方法（在另一个组件完成操作后调用）
    resetModelChangeFlag() {
      this.shouldToggleModel = false
    },
  },
})
