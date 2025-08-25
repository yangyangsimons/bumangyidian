# 背景音乐管理统一化修复

## 问题描述

原本存在两个 store 都在创建和管理背景音乐播放器的问题：

- `audioPlayer.js` - 处理 WebSocket 消息中的背景音乐播放
- `music.js` - 处理用户手动选择的音乐播放

由于微信小程序全局只能有一个`getBackgroundAudioManager()`实例，这导致了冲突，用户在切换页面后点击播放按钮没有反应。

## 解决方案

### 1. 统一背景音乐管理器

- **保留** `audioPlayer.js` 作为唯一的背景音乐管理器
- **修改** `music.js` 使其通过 `audioPlayer.js` 来控制背景音乐播放
- 移除 `music.js` 中独立的 `getBackgroundAudioManager()` 创建

### 2. 主要修改内容

#### audioPlayer.js 修改：

- 修改 `playBgMusic` 方法支持传入音频元数据 `metadata` 参数
- 添加 `setOnMusicEndedCallback` 方法用于设置音乐播放完成回调
- 导出 `bgAudioId` 用于状态对比
- 在音乐播放结束时调用回调函数（用于自动切换下一首）

#### music.js 修改：

- 移除独立的 `audioContext` 创建
- 使用 `audioPlayerStore` 引用来控制背景音乐
- 修改所有播放控制方法调用 `audioPlayerStore` 的对应方法
- 使用 `watch` 监听 `audioPlayerStore.bgIsPlaying` 状态同步播放状态
- 在 `initAudio` 中设置音乐播放完成回调用于自动切换下一首

#### messageProcessor.js 修改：

- 在处理 WebSocket 背景音乐消息时清除音乐播放完成回调
- 避免 WebSocket 音乐与用户选择音乐的自动切换功能冲突

#### programme.vue 修改：

- 在用户选择新音乐时重新设置音乐播放完成回调
- 确保用户手动选择的音乐能够自动切换下一首

#### musicbar.vue 修改：

- 添加 `handleTogglePlay` 方法调用 `musicStore.togglePlay()`
- 确保音乐条的播放控制正常工作

### 3. 关键改进点

1. **统一管理**: 所有背景音乐播放都通过 `audioPlayer.js` 统一管理
2. **状态同步**: `music.js` 通过 `watch` 实时同步播放状态
3. **回调机制**: 通过回调函数实现音乐播放完成后的自动切换
4. **冲突避免**: WebSocket 音乐和用户选择音乐通过回调管理避免冲突

### 4. 使用流程

#### WebSocket 背景音乐播放:

1. 接收到 `bg_music` 消息
2. `messageProcessor` 清除音乐播放完成回调
3. 调用 `audioPlayerStore.playBgMusic()` 播放
4. 设置循环播放或广播模式

#### 用户手动选择音乐:

1. 用户点击播放按钮
2. `programme.vue` 重新设置音乐播放完成回调
3. 调用 `musicStore.addAndPlaySong()`
4. `musicStore` 通过 `audioPlayerStore` 播放音乐
5. 播放完成后自动切换下一首

### 5. 测试要点

- [x] WebSocket 背景音乐播放正常
- [x] 用户手动选择音乐播放正常
- [x] 切换页面后播放控制仍然有效
- [x] 音乐播放完成后能自动切换下一首
- [x] WebSocket 音乐和手动选择音乐不会冲突
- [x] 状态显示正确（播放/暂停按钮状态）

这个修复确保了整个应用中只有一个背景音乐管理器实例，解决了页面切换后播放控制失效的问题。
