import { defineStore } from 'pinia'

export const useVolumeStore = defineStore('volume', {
  state: () => ({
    volume: 0, // 默认音量，范围0-1
  }),
  actions: {
    setVolume(volume) {
      this.volume = volume
    },
  },
})
