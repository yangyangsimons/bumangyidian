import { defineStore } from 'pinia'

export const useIsRadioStore = defineStore('isRadio', {
  state: () => ({
    isRadio: false,
  }),
  actions: {
    setIsRadio(isRadio) {
      console.log('更新前是radio模式吗:', this.isRadio)
      this.isRadio = isRadio
      console.log('更新后是radio模式吗:', this.isRadio)
    },
  },
})
