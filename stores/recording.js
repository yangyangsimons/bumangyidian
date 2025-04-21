// stores/recording.js
import { defineStore } from 'pinia'

export const useRecordingStore = defineStore('recording', {
  state: () => ({
    isRecording: false,
  }),
  actions: {
    startRecording() {
      this.isRecording = true
    },
    stopRecording() {
      this.isRecording = false
    },
  },
})
