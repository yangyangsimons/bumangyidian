"use strict";
const common_vendor = require("../common/vendor.js");
const useUserStore = common_vendor.defineStore("user", {
  state: () => ({
    token: null,
    userInfo: null,
    isLoggedIn: false
  }),
  actions: {
    setToken(token) {
      this.token = token;
      this.isLoggedIn = !!token;
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
    },
    logout() {
      this.token = null;
      this.userInfo = null;
      this.isLoggedIn = false;
    }
  },
  persist: {
    // 如需持久化存储
    enabled: true,
    strategies: [
      {
        key: "user",
        storage: localStorage
      }
    ]
  }
});
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/user.js.map
