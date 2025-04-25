"use strict";
const common_vendor = require("../common/vendor.js");
const usePlaceholderStore = common_vendor.defineStore("placeholder", () => {
  const normalPlaceholders = [
    "现在想聊什么?",
    "开心还是emo？在线接招中。",
    "你的树洞已上线，随便说吧！",
    "今天有什么新鲜事？来聊聊~",
    "任意关键词，解锁你的话题！"
  ];
  const specialPlaceholders = [
    "输入问题，查询创新创业政策",
    "创业不孤单，学长为你护航",
    "你的创业难题，湖南来兜底！",
    "创业第一步？最佳政策匹配上！"
  ];
  const currentPlaceholder = common_vendor.ref("");
  const getRandomIndex = (array) => {
    return Math.floor(Math.random() * array.length);
  };
  const setRandomNormalPlaceholder = () => {
    const randomIndex = getRandomIndex(normalPlaceholders);
    currentPlaceholder.value = normalPlaceholders[randomIndex];
    return currentPlaceholder.value;
  };
  const setRandomSpecialPlaceholder = () => {
    const randomIndex = getRandomIndex(specialPlaceholders);
    currentPlaceholder.value = specialPlaceholders[randomIndex];
    return currentPlaceholder.value;
  };
  setRandomNormalPlaceholder();
  return {
    currentPlaceholder,
    setRandomNormalPlaceholder,
    setRandomSpecialPlaceholder
  };
});
exports.usePlaceholderStore = usePlaceholderStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/placeholderStore.js.map
