import { defineStore } from 'pinia'

export const useModelStore = defineStore('model', {
  state: () => ({
    model: '常规模式',
  }),
  actions: {
    setModel(model) {
      this.model = model
    },
  },
})
