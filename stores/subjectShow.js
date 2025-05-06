import { defineStore } from 'pinia'

export const subjectShowStore = defineStore('subjectShow', {
  state: () => ({
    subjectShow: false,
  }),
  actions: {
    setSubjectShow(subjectShow) {
      console.log('更新前subject是否显示:', this.subjectShow)
      this.subjectShow = subjectShow
      console.log('更新后subject是否显示:', this.subjectShow)
    },
  },
})
