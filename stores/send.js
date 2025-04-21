import { defineStore } from 'pinia'

export const useSendStore = defineStore('send', {
  state: () => ({
    send: true,
  }),
  actions: {
    setSend(okToSend) {
      console.log('更新前:', this.send)
      this.send = okToSend
      console.log('更新后:', this.send)
    },
  },
})
