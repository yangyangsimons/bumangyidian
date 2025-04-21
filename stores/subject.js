import { defineStore } from 'pinia'

export const useSubjectStore = defineStore('subject', {
  state: () => ({
    subject: '关于所有一切的话题',
  }),
  actions: {
    setSubject(subject) {
      console.log('更新前:', this.subject)
      this.subject = subject
      console.log('更新后:', this.subject)
    },
  },
})
