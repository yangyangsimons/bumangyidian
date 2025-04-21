"use strict";
const common_vendor = require("../common/vendor.js");
const stores_barrage = require("./barrage.js");
const stores_audioPlayer = require("./audioPlayer.js");
const stores_send = require("./send.js");
const stores_isRadio = require("./isRadio.js");
const useMessageProcessorStore = common_vendor.defineStore("messageProcessor", () => {
  const barrageStore = stores_barrage.useBarrageStore();
  const audioPlayerStore = stores_audioPlayer.useAudioPlayerStore();
  const sendStore = stores_send.useSendStore();
  const isRadioStore = stores_isRadio.useIsRadioStore();
  const isStreaming = common_vendor.ref(false);
  const accumulatedText = common_vendor.ref("");
  const lastSectionId = common_vendor.ref(null);
  const lyricSyncInterval = common_vendor.ref(null);
  const currentLyrics = common_vendor.ref([]);
  const lyricMessageId = common_vendor.ref(null);
  const currentLyricIndex = common_vendor.ref(-1);
  const processMessage = (data) => {
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        common_vendor.index.__f__("error", "at stores/messageProcessor.js:33", "消息解析失败", e);
        showTextMessage(data);
        return;
      }
    }
    switch (data.cmd) {
      case "bg_music":
        handleBgMusic(data);
        break;
      case "audio":
        handleTtsAudio(data);
        break;
      case "finish":
        handleFinishMessage(data);
        break;
      case "subject":
        handleSubjectRequest(data);
        break;
      case "error":
        handleErrorMessage(data);
        break;
      default:
        common_vendor.index.__f__("warn", "at stores/messageProcessor.js:59", "未知消息类型", data);
        if (data.text || data.msg) {
          showTextMessage(data.text || data.msg);
        }
    }
  };
  const handleBgMusic = (data) => {
    common_vendor.index.__f__("log", "at stores/messageProcessor.js:68", "收到背景音乐消息", data);
    const { audio_url, play_time, section_id, audio_id } = data;
    audioPlayerStore.playBgMusic(audio_url, play_time, section_id, audio_id);
    audioPlayerStore.setBgLoop(true);
    if (data.is_radio && data.is_radio == 1) {
      common_vendor.index.__f__("log", "at stores/messageProcessor.js:79", "当前是广播模式");
      isRadioStore.setIsRadio(true);
      audioPlayerStore.setBgLoop(false);
      if (data.lrc) {
        common_vendor.index.__f__("log", "at stores/messageProcessor.js:85", "当前是广播模式,歌词:", data.lrc);
        handleLyrics(data.lrc);
      }
    }
  };
  const handleLyrics = (lyricsData) => {
    stopLyricSync();
    currentLyrics.value = lyricsData;
    currentLyricIndex.value = -1;
    initLyricDisplay();
    startLyricSync(lyricsData);
  };
  const initLyricDisplay = (lyricsData) => {
    lyricMessageId.value = barrageStore.addMessage({
      type: "lyric",
      content: "🎵 歌词加载中...",
      id: "lyric-message",
      // 使用固定ID方便后续更新
      isLyric: true
      // 标记这是歌词消息
    });
  };
  const startLyricSync = (lyricsData) => {
    stopLyricSync();
    const parsedLyrics = lyricsData.map((item) => ({
      text: item.text,
      startTime: parseTimeToSeconds(item.start)
    }));
    common_vendor.index.__f__("log", "at stores/messageProcessor.js:136", "解析后的歌词数据:", parsedLyrics);
    lyricSyncInterval.value = setInterval(() => {
      if (audioPlayerStore.bgIsPlaying) {
        const currentTime = audioPlayerStore.bgPlayTime;
        updateLyricByTime(currentTime, parsedLyrics);
      }
    }, 100);
  };
  const stopLyricSync = () => {
    if (lyricSyncInterval.value) {
      clearInterval(lyricSyncInterval.value);
      lyricSyncInterval.value = null;
    }
  };
  const updateLyricByTime = (currentTime, lyrics) => {
    let newIndex = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].startTime) {
        newIndex = i;
      } else {
        break;
      }
    }
    if (newIndex !== -1 && newIndex !== currentLyricIndex.value) {
      currentLyricIndex.value = newIndex;
      updateLyricDisplay(lyrics[newIndex].text);
    }
  };
  const updateLyricDisplay = (text) => {
    if (!lyricMessageId.value)
      return;
    const messageIndex = barrageStore.messages.findIndex(
      (msg) => msg.id === lyricMessageId.value || msg.id === "lyric-message"
    );
    if (messageIndex !== -1) {
      barrageStore.messages[messageIndex].content = text;
      common_vendor.index.__f__("log", "at stores/messageProcessor.js:188", "歌词已更新:", text);
    } else {
      lyricMessageId.value = barrageStore.addMessage({
        type: "lyric",
        content: text,
        id: "lyric-message",
        isLyric: true
      });
    }
  };
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr)
      return 0;
    const parts = timeStr.split(":");
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    } else {
      seconds = parseFloat(parts[0]);
    }
    return seconds;
  };
  const handleTtsAudio = (data) => {
    common_vendor.index.__f__("log", "at stores/messageProcessor.js:226", "收到TTS音频消息", data);
    if (data.is_radio && data.is_radio == 1) {
      common_vendor.index.__f__("log", "at stores/messageProcessor.js:228", "当前是广播模式");
      isRadioStore.setIsRadio(true);
    }
    const { audio_url, section_id, audio_id, text } = data;
    sendStore.setSend(false);
    lastSectionId.value = section_id;
    audioPlayerStore.playTtsAudio(audio_url, section_id, audio_id);
    if (text) {
      common_vendor.index.__f__("log", "at stores/messageProcessor.js:240", "处理文本:");
      if (!isStreaming.value || lastSectionId.value !== section_id) {
        common_vendor.index.__f__("log", "at stores/messageProcessor.js:244", "开始新的流式消息", {
          isStreaming: isStreaming.value,
          lastSectionId: lastSectionId.value,
          newSectionId: section_id
        });
        isStreaming.value = true;
        accumulatedText.value = "";
        barrageStore.startNewStreamingMessage();
      }
      accumulatedText.value += text;
      barrageStore.appendToStreamingMessage(text);
      common_vendor.index.__f__("log", "at stores/messageProcessor.js:260", "当前累积文本:", accumulatedText.value);
    }
  };
  const handleFinishMessage = (data) => {
    common_vendor.index.__f__("log", "at stores/messageProcessor.js:266", "收到结束消息", data);
    sendStore.setSend(true);
    const { full_text } = data;
    if (full_text) {
      accumulatedText.value = full_text;
    }
    barrageStore.finishStreamingMessage(full_text || accumulatedText.value);
    isStreaming.value = false;
    accumulatedText.value = "";
  };
  const handleSubjectRequest = (data) => {
    common_vendor.index.__f__("log", "at stores/messageProcessor.js:286", "收到主题选择请求", data);
    const subjects = data.subjects.join("\n");
    common_vendor.index.__f__("log", "at stores/messageProcessor.js:288", "可选主题列表", subjects);
    barrageStore.addMessage({
      type: "subject",
      content: data.msg + "\n" + subjects
    });
  };
  const handleErrorMessage = (data) => {
    common_vendor.index.__f__("log", "at stores/messageProcessor.js:298", "收到错误消息", data);
    const { text } = data;
    common_vendor.index.showToast({
      title: text || "系统错误",
      icon: "none",
      duration: 2e3
    });
  };
  const showTextMessage = (text, type = "ai") => {
    if (!text)
      return;
    barrageStore.addMessage({
      type,
      content: text
    });
  };
  const resetProcessor = () => {
    isStreaming.value = false;
    accumulatedText.value = "";
    lastSectionId.value = null;
    stopLyricSync();
    currentLyrics.value = [];
    lyricMessageId.value = null;
    currentLyricIndex.value = -1;
  };
  return {
    processMessage,
    resetProcessor,
    isStreaming,
    accumulatedText,
    // 暴露歌词相关方法（如果需要在外部调用）
    stopLyricSync,
    currentLyrics,
    currentLyricIndex
  };
});
exports.useMessageProcessorStore = useMessageProcessorStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/messageProcessor.js.map
