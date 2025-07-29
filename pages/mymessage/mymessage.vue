<template>
  <view class="my-message">
    <view class="my-message-header">
      <view class="avator">
        <image class="avator" :src="avator"></image>
      </view>
      <view class="info-container">
        <view class="user-info-setting">
          <view class="user-info">
            <view class="name">{{ userName }} </view>
            <view class="school">{{ school }}</view></view
          >
          <view class="setting">
            <image src="../../static/my/setting.png" mode="scaleToFill" />
          </view>
        </view>
      </view>
    </view>
    <view class="my-message__content">
      <text class="my-message__empty">暂无消息</text>
    </view>
  </view>
</template>

<script setup></script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
