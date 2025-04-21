"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("../utils/config.js");
const stores_subject = require("./subject.js");
const stores_isRadio = require("./isRadio.js");
const useAudioPlayerStore = common_vendor.defineStore("audioPlayer", () => {
  const subjectStore = stores_subject.useSubjectStore();
  const isRadioStore = stores_isRadio.useIsRadioStore();
  const bgAudioManager = common_vendor.ref(null);
  const bgSectionId = common_vendor.ref(null);
  const bgAudioId = common_vendor.ref(null);
  const bgPlayTime = common_vendor.ref(0);
  const bgIsPlaying = common_vendor.ref(false);
  const bgVolume = common_vendor.ref(1);
  const bgLoop = common_vendor.ref(false);
  const currentBgUrl = common_vendor.ref("");
  const musicTitle = common_vendor.computed(() => {
    return `${subjectStore.subject} `;
  });
  const ttsAudioContext = common_vendor.ref(null);
  const ttsSectionId = common_vendor.ref(null);
  const ttsAudioId = common_vendor.ref(null);
  const ttsIsPlaying = common_vendor.ref(false);
  const ttsPlayTime = common_vendor.ref(0);
  const ttsVolume = common_vendor.ref(1);
  const ttsPaused = common_vendor.ref(false);
  const currentTtsUrl = common_vendor.ref("");
  const ttsQueue = common_vendor.ref([]);
  const isProcessingQueue = common_vendor.ref(false);
  const UPLOAD_PROGRESS_URL = `${utils_config.baseUrl}/content/upload_progress`;
  const initBgAudioManager = () => {
    if (!bgAudioManager.value) {
      bgAudioManager.value = common_vendor.index.getBackgroundAudioManager();
      bgAudioManager.value.onEnded(() => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:50", "背景音乐播放结束");
        if (bgLoop.value && currentBgUrl.value) {
          common_vendor.index.__f__("log", "at stores/audioPlayer.js:54", "背景音乐循环播放");
          setTimeout(() => {
            playBgMusic(
              currentBgUrl.value,
              0,
              bgSectionId.value,
              bgAudioId.value
            );
          }, 100);
        } else {
          reportBgMusicFinish();
          bgIsPlaying.value = false;
        }
      });
      bgAudioManager.value.onTimeUpdate(() => {
        bgPlayTime.value = bgAudioManager.value.currentTime;
      });
      bgAudioManager.value.onError((err) => {
        common_vendor.index.__f__("error", "at stores/audioPlayer.js:78", "背景音乐播放错误", err);
        bgIsPlaying.value = false;
      });
      bgAudioManager.value.onStop(() => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:84", "背景音乐已停止");
        bgIsPlaying.value = false;
      });
      bgAudioManager.value.onPlay(() => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:90", "背景音乐开始播放");
        bgIsPlaying.value = true;
      });
      bgAudioManager.value.onPause(() => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:96", "背景音乐已暂停");
        bgIsPlaying.value = false;
      });
    }
  };
  const updateBgMusicProperties = () => {
    if (bgAudioManager.value) {
      bgAudioManager.value.title = musicTitle.value;
      bgAudioManager.value.epname = "小程序背景音乐";
      bgAudioManager.value.coverImgUrl = "../../static/logo.png";
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:112", "更新背景音乐属性:", {
        title: musicTitle.value
      });
    }
  };
  const initTtsAudioContext = () => {
    if (!ttsAudioContext.value) {
      ttsAudioContext.value = common_vendor.index.createInnerAudioContext();
      ttsAudioContext.value.volume = ttsVolume.value;
      ttsAudioContext.value.onEnded(() => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:128", "TTS音频播放结束", "队列长度:", ttsQueue.value.length);
        if (ttsSectionId.value && ttsAudioId.value) {
          reportTtsFinish();
        }
        ttsIsPlaying.value = false;
        ttsPaused.value = false;
        playNextInQueue();
      });
      ttsAudioContext.value.onError((err) => {
        common_vendor.index.__f__("error", "at stores/audioPlayer.js:144", "TTS音频播放错误", err);
        ttsIsPlaying.value = false;
        ttsPaused.value = false;
        playNextInQueue();
      });
      ttsAudioContext.value.onCanplay(() => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:153", "TTS音频已准备好播放");
        if (ttsAudioContext.value.duration > 0) {
          ttsPlayTime.value = ttsAudioContext.value.duration;
          common_vendor.index.__f__("log", "at stores/audioPlayer.js:157", "TTS音频长度:", ttsPlayTime.value);
        }
      });
      ttsAudioContext.value.onPlay(() => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:162", "TTS音频开始播放");
        ttsIsPlaying.value = true;
        ttsPaused.value = false;
      });
      ttsAudioContext.value.onTimeUpdate(() => {
        if (ttsAudioContext.value.duration > 0 && ttsPlayTime.value === 0) {
          ttsPlayTime.value = ttsAudioContext.value.duration;
          common_vendor.index.__f__("log", "at stores/audioPlayer.js:171", "更新TTS音频长度:", ttsPlayTime.value);
        }
      });
      ttsAudioContext.value.onPause(() => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:177", "TTS音频已暂停");
        ttsIsPlaying.value = false;
        ttsPaused.value = true;
      });
    }
  };
  const setTtsVolume = (volume) => {
    volume = Math.min(1, Math.max(0, volume));
    ttsVolume.value = volume;
    if (ttsAudioContext.value) {
      ttsAudioContext.value.volume = volume;
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:193", "TTS音量已设置为:", volume);
    }
    return volume;
  };
  const setBgVolume = (volume) => {
    volume = Math.min(1, Math.max(0, volume));
    bgVolume.value = volume;
    if (bgAudioManager.value) {
      bgAudioManager.value.volume = volume;
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:208", "背景音乐音量已设置为:", volume);
    }
    return volume;
  };
  const setBgLoop = (loop) => {
    bgLoop.value = !!loop;
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:217", "背景音乐循环播放状态设置为:", bgLoop.value);
    return bgLoop.value;
  };
  const playBgMusic = (url, playTime = 0, sectionId = null, audioId = null) => {
    initBgAudioManager();
    bgSectionId.value = sectionId;
    bgAudioId.value = audioId;
    bgPlayTime.value = playTime;
    currentBgUrl.value = url;
    updateBgMusicProperties();
    bgAudioManager.value.src = url;
    bgAudioManager.value.volume = bgVolume.value;
    if (playTime > 0) {
      bgAudioManager.value.startTime = playTime;
    }
    bgIsPlaying.value = true;
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:248", "开始播放背景音乐", {
      url,
      playTime,
      sectionId,
      audioId,
      title: musicTitle.value,
      volume: bgVolume.value,
      loop: bgLoop.value
    });
  };
  const pauseBgMusic = () => {
    if (bgAudioManager.value && bgIsPlaying.value) {
      bgAudioManager.value.pause();
      bgIsPlaying.value = false;
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:264", "背景音乐已暂停");
    }
  };
  const resumeBgMusic = () => {
    if (bgAudioManager.value && !bgIsPlaying.value && currentBgUrl.value) {
      updateBgMusicProperties();
      try {
        bgAudioManager.value.play();
        bgIsPlaying.value = true;
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:278", "背景音乐恢复播放");
      } catch (err) {
        common_vendor.index.__f__("error", "at stores/audioPlayer.js:280", "背景音乐恢复播放失败", err);
        playBgMusic(
          currentBgUrl.value,
          bgPlayTime.value,
          bgSectionId.value,
          bgAudioId.value
        );
      }
    } else if (currentBgUrl.value) {
      playBgMusic(
        currentBgUrl.value,
        bgPlayTime.value,
        bgSectionId.value,
        bgAudioId.value
      );
    }
  };
  const enqueueTtsAudio = (url, sectionId = null, audioId = null) => {
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:302", "将TTS音频添加到队列", {
      url,
      sectionId,
      audioId,
      currentQueueLength: ttsQueue.value.length
    });
    ttsQueue.value.push({
      url,
      sectionId,
      audioId
    });
    if (!isProcessingQueue.value) {
      playNextInQueue();
    }
  };
  const playNextInQueue = () => {
    if (ttsQueue.value.length === 0) {
      isProcessingQueue.value = false;
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:327", "TTS队列为空，等待新音频");
      return;
    }
    isProcessingQueue.value = true;
    const nextAudio = ttsQueue.value.shift();
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:336", "播放队列中的下一个TTS音频", {
      remainingInQueue: ttsQueue.value.length,
      nextAudio
    });
    playTtsAudioDirectly(nextAudio.url, nextAudio.sectionId, nextAudio.audioId);
  };
  const playTtsAudioDirectly = (url, sectionId = null, audioId = null) => {
    initTtsAudioContext();
    ttsSectionId.value = sectionId;
    ttsAudioId.value = audioId;
    currentTtsUrl.value = url;
    ttsPlayTime.value = 0;
    ttsAudioContext.value.src = url;
    ttsAudioContext.value.volume = ttsVolume.value;
    try {
      ttsAudioContext.value.play();
      ttsIsPlaying.value = true;
      ttsPaused.value = false;
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:368", "正在播放TTS音频", {
        url: url.substring(0, 50) + "...",
        // 只显示URL的一部分，避免日志太长
        sectionId,
        audioId,
        volume: ttsVolume.value
      });
    } catch (err) {
      common_vendor.index.__f__("error", "at stores/audioPlayer.js:375", "播放TTS音频失败", err);
      setTimeout(playNextInQueue, 500);
    }
  };
  const playTtsAudio = (url, sectionId = null, audioId = null) => {
    enqueueTtsAudio(url, sectionId, audioId);
  };
  const toggleBgMusic = () => {
    if (bgIsPlaying.value) {
      pauseBgMusic();
    } else {
      resumeBgMusic();
    }
  };
  const toggleTtsAudio = () => {
    if (!ttsAudioContext.value)
      return;
    if (ttsIsPlaying.value) {
      pauseTtsAudio();
    } else {
      resumeTtsAudio();
    }
  };
  const pauseTtsAudio = () => {
    if (ttsAudioContext.value && ttsIsPlaying.value) {
      ttsAudioContext.value.pause();
      ttsIsPlaying.value = false;
      ttsPaused.value = true;
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:413", "TTS音频已暂停");
    }
  };
  const resumeTtsAudio = () => {
    if (!ttsAudioContext.value) {
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:420", "TTS音频上下文未初始化，无法恢复播放");
      return;
    }
    if (ttsPaused.value && currentTtsUrl.value) {
      try {
        ttsAudioContext.value.play();
        ttsIsPlaying.value = true;
        ttsPaused.value = false;
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:431", "恢复TTS音频播放");
      } catch (err) {
        common_vendor.index.__f__("error", "at stores/audioPlayer.js:433", "恢复TTS音频播放失败", err);
        ttsAudioContext.value.src = currentTtsUrl.value;
        ttsAudioContext.value.volume = ttsVolume.value;
        ttsAudioContext.value.play();
        ttsIsPlaying.value = true;
        ttsPaused.value = false;
      }
    } else if (!ttsIsPlaying.value && ttsQueue.value.length > 0) {
      playNextInQueue();
    } else {
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:446", "没有可恢复播放的TTS音频");
    }
  };
  const stopBgMusic = () => {
    if (bgAudioManager.value) {
      bgAudioManager.value.stop();
      bgIsPlaying.value = false;
    }
  };
  const stopTtsAudio = () => {
    if (ttsAudioContext.value) {
      ttsAudioContext.value.stop();
      ttsIsPlaying.value = false;
      ttsPaused.value = false;
    }
    ttsQueue.value = [];
    isProcessingQueue.value = false;
  };
  const stopAllAudio = () => {
    stopBgMusic();
    stopTtsAudio();
  };
  const reportBgMusicFinish = () => {
    if (!bgSectionId.value && !bgAudioId.value)
      return;
    const reportData = {
      section_id: bgSectionId.value,
      audio_id: bgAudioId.value,
      play_time: Number(bgPlayTime.value.toFixed(1)),
      is_finish: true
    };
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:489", "上报背景音乐播放完成", reportData);
    isRadioStore.setIsRadio(false);
    sendProgressReport(reportData);
  };
  const reportTtsFinish = () => {
    if (!ttsSectionId.value && !ttsAudioId.value)
      return;
    const reportData = {
      section_id: ttsSectionId.value,
      audio_id: ttsAudioId.value,
      is_finish: true,
      play_time: Number(ttsPlayTime.value.toFixed(1))
      // 添加play_time字段
    };
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:508", "上报TTS音频播放完成", reportData);
    sendProgressReport(reportData);
  };
  const reportCurrentProgress = () => {
    if (bgIsPlaying.value && bgSectionId.value && bgAudioId.value) {
      const reportData = {
        section_id: bgSectionId.value,
        audio_id: bgAudioId.value,
        play_time: Number(bgPlayTime.value.toFixed(1)),
        is_finish: false
      };
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:525", "上报背景音乐当前进度", reportData);
      sendProgressReport(reportData);
    }
    if (ttsIsPlaying.value && ttsSectionId.value && ttsAudioId.value) {
      const reportData = {
        section_id: ttsSectionId.value,
        audio_id: ttsAudioId.value,
        is_finish: false,
        play_time: Number(ttsPlayTime.value.toFixed(1))
        // 添加play_time字段
      };
      common_vendor.index.__f__("log", "at stores/audioPlayer.js:538", "上报TTS当前进度", reportData);
      sendProgressReport(reportData);
    }
  };
  const sendProgressReport = (data) => {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.request({
      url: UPLOAD_PROGRESS_URL,
      method: "POST",
      header: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`
      },
      data,
      success: (res) => {
        common_vendor.index.__f__("log", "at stores/audioPlayer.js:556", "上报进度成功", res.data);
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at stores/audioPlayer.js:559", "上报进度失败", err);
      }
    });
  };
  const getQueueStatus = () => {
    return {
      queueLength: ttsQueue.value.length,
      isProcessing: isProcessingQueue.value,
      currentlyPlaying: ttsIsPlaying.value ? {
        sectionId: ttsSectionId.value,
        audioId: ttsAudioId.value
      } : null
    };
  };
  const resetTtsAudio = () => {
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:580", "重置TTS音频状态");
    if (ttsIsPlaying.value && ttsAudioContext.value) {
      ttsAudioContext.value.stop();
    }
    ttsSectionId.value = null;
    ttsAudioId.value = null;
    ttsIsPlaying.value = false;
    ttsPlayTime.value = 0;
    ttsPaused.value = false;
    currentTtsUrl.value = "";
    ttsQueue.value = [];
    isProcessingQueue.value = false;
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:601", "TTS音频状态已重置");
  };
  const resetBgMusic = () => {
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:606", "重置背景音乐状态");
    if (bgIsPlaying.value && bgAudioManager.value) {
      bgAudioManager.value.stop();
    }
    bgSectionId.value = null;
    bgAudioId.value = null;
    bgIsPlaying.value = false;
    bgPlayTime.value = 0;
    currentBgUrl.value = "";
    common_vendor.index.__f__("log", "at stores/audioPlayer.js:622", "背景音乐状态已重置");
  };
  return {
    // 背景音乐相关
    playBgMusic,
    stopBgMusic,
    pauseBgMusic,
    resumeBgMusic,
    toggleBgMusic,
    bgIsPlaying,
    setBgVolume,
    bgVolume,
    setBgLoop,
    bgLoop,
    musicTitle,
    // 导出计算属性，便于UI显示
    resetBgMusic,
    // 新增：重置背景音乐
    // TTS相关
    playTtsAudio,
    stopTtsAudio,
    toggleTtsAudio,
    pauseTtsAudio,
    // 新增：暂停TTS音频
    resumeTtsAudio,
    // 新增：恢复TTS音频播放
    ttsIsPlaying,
    ttsPaused,
    // 新增：TTS暂停状态
    setTtsVolume,
    ttsVolume,
    getQueueStatus,
    resetTtsAudio,
    // 新增：重置TTS音频
    // 通用方法
    stopAllAudio,
    reportCurrentProgress,
    // 播放状态
    get isAnyPlaying() {
      return bgIsPlaying.value || ttsIsPlaying.value;
    },
    // 队列长度（便于调试显示）
    get queueLength() {
      return ttsQueue.value.length;
    }
  };
});
exports.useAudioPlayerStore = useAudioPlayerStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/audioPlayer.js.map
