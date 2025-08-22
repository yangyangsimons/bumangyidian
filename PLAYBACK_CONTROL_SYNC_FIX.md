# 播放控件状态同步修复

## 问题描述

当用户在 index 页面播放 WebSocket 背景音乐后，切换到 programme 或 home 页面时，播放控件会错误地显示为暂停状态（pause 图标），但实际播放的并不是当前页面的音乐。这会让用户感到困惑。

## 解决方案

### 核心思路

**只有当播放的音乐 ID 与当前页面音乐 ID 匹配时，才显示暂停按钮，否则显示播放按钮。**

### 主要修改

#### 1. music.js 修改

- **优化状态同步逻辑**: 修改`setupAudioEvents`方法，只有当播放的音乐是 music store 管理的音乐时，才同步播放状态
- **添加精确判断方法**: 新增`isPlayingAudio`getter，用于判断指定音乐 ID 是否正在播放

```javascript
// 新增getter
isPlayingAudio: (state) => {
  return (audioId) => {
    if (!state.audioPlayerStore || !audioId) return false

    return (
      state.audioPlayerStore.bgIsPlaying &&
      state.audioPlayerStore.bgAudioId === audioId
    )
  }
}

// 优化状态同步
watch(
  () => [this.audioPlayerStore.bgIsPlaying, this.audioPlayerStore.bgAudioId],
  ([isPlaying, audioId]) => {
    // 只有当播放的音乐是我们管理的音乐时，才同步播放状态
    if (this.currentSong && audioId === this.currentSong.id) {
      this.isPlaying = isPlaying
    } else {
      // 如果播放的不是我们的音乐，设置为未播放状态
      this.isPlaying = false
    }
  },
  { immediate: true }
)
```

#### 2. programme.vue 修改

- **推荐音乐播放按钮**: 使用`musicStore.isPlayingAudio(recommendInfo.id)`替代原来的复杂判断
- **列表音乐播放按钮**: 使用`musicStore.isPlayingAudio(item.id)`替代原来的复杂判断

```vue
<!-- 修改前 -->
:src=" musicStore.isPlaying && musicStore.currentSong &&
musicStore.currentSong.id === recommendInfo.id ? '/static/pause.png' :
'/static/triangle.png' "

<!-- 修改后 -->
:src=" musicStore.isPlayingAudio(recommendInfo.id) ? '/static/pause.png' :
'/static/triangle.png' "
```

#### 3. musicbar.vue 修改

- **播放控件**: 确保只有当前歌曲正在播放时才显示暂停按钮
- **修正方法调用**: 修正`@click`事件调用

```vue
<!-- 修改后 -->
:src=" musicStore.currentSong &&
musicStore.isPlayingAudio(musicStore.currentSong.id) ? '/static/pause.png' :
'/static/triangle.png' "
```

### 修复效果

#### 场景 1: WebSocket 背景音乐播放

1. ✅ 在 index 页面播放 WebSocket 音乐时，音乐正常播放
2. ✅ 切换到 programme 页面时，播放按钮显示为三角形（播放状态）
3. ✅ 用户不会因为看到暂停按钮而感到困惑

#### 场景 2: 手动选择音乐播放

1. ✅ 在 programme 页面选择音乐播放时，对应的播放按钮显示为暂停状态
2. ✅ 其他音乐的播放按钮仍显示为播放状态
3. ✅ 切换页面后，只有正在播放的音乐按钮显示为暂停状态

#### 场景 3: musicbar 组件

1. ✅ 只有当 musicbar 对应的音乐正在播放时才显示暂停按钮
2. ✅ 当播放其他音乐（如 WebSocket 音乐）时，musicbar 显示播放按钮

### 关键改进点

1. **精确性**: 通过音乐 ID 精确判断是否为当前播放的音乐
2. **一致性**: 所有播放控件都使用相同的判断逻辑
3. **用户体验**: 避免了用户界面状态与实际播放状态不匹配的困惑
4. **维护性**: 使用统一的`isPlayingAudio`方法，便于维护

现在播放控件的显示状态完全基于实际播放的音乐 ID，确保了用户界面的准确性和一致性。
