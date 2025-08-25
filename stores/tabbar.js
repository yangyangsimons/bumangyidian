// stores/tabbar.js
import { defineStore } from 'pinia'
import Home from '../static/tabbar/home.png'
import HomeSelect from '../static/tabbar/home-select.png'
import Chat from '../static/tabbar/chat.png'
import ChatSelect from '../static/tabbar/chat-select.png'
import My from '../static/tabbar/my.png'
import MySelect from '../static/tabbar/my-select.png'
import Activity from '../static/tabbar/activity.png'
import ActivitySelect from '../static/tabbar/activity-select.png'
import Main from '../static/tabbar/index.png'

export const useTabbarStore = defineStore('tabbar', {
  state: () => ({
    activeIndex: 2,
    tabList: [
      {
        name: '校园',
        path: '/pages/home/home',
        icon: Home,
        iconSelected: HomeSelect,
      },
      {
        name: '互动',
        path: '/pages/interaction/interaction',
        icon: Chat,
        iconSelected: ChatSelect,
      },
      {
        name: '', // 空字符串，不显示文字
        path: '/pages/index/index',
        icon: Main,
        iconSelected: Main,
        isLarge: true, // 添加标识符
      },
      {
        name: '活动',
        path: '/pages/activity/activity',
        icon: Activity,
        iconSelected: ActivitySelect,
      },
      {
        name: '我的',
        path: '/pages/my/my',
        icon: My,
        iconSelected: MySelect,
      },
    ],
  }),

  actions: {
    setActiveIndex(index) {
      this.activeIndex = index
    },

    switchTab(index) {
      this.setActiveIndex(index)
      const targetPage = this.tabList[index]

      uni.switchTab({
        url: `${targetPage.path}?tabIndex=${index}`,
      })
    },
  },
})
