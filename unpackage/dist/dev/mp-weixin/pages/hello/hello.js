"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_config = require("../../utils/config.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "hello",
  setup(__props) {
    const selectedSex = common_vendor.ref("male");
    const schoolList = common_vendor.ref([]);
    const selectedSchoolIndex = common_vendor.ref(-1);
    const selectedSchool = common_vendor.ref(null);
    const showModal = common_vendor.ref(false);
    const tempSelectedIndex = common_vendor.ref(-1);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const hasMore = common_vendor.ref(true);
    const loading = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const isSearching = common_vendor.ref(false);
    const searchTimer = common_vendor.ref(null);
    common_vendor.ref(true);
    common_vendor.onShow(async () => {
    });
    const getSchoolName = (school) => {
      return school.name || school.school_name || school.title || "";
    };
    const loadSchools = async (page = 1, reset = false) => {
      if (loading.value) {
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:204", "正在加载中，跳过本次请求");
        return;
      }
      common_vendor.index.__f__(
        "log",
        "at pages/hello/hello.vue:208",
        `开始加载学校列表 - 页码: ${page}, 重置: ${reset}, 搜索: ${isSearching.value}, 关键词: ${searchKeyword.value}`
      );
      common_vendor.index.__f__(
        "log",
        "at pages/hello/hello.vue:211",
        `当前状态 - 列表长度: ${schoolList.value.length}, 当前页: ${currentPage.value}, 还有更多: ${hasMore.value}`
      );
      loading.value = true;
      try {
        let url = `${utils_config.baseUrl}/school/get_school_list?page=${page}&page_size=${pageSize.value}`;
        if (searchKeyword.value.trim()) {
          url += `&name=${encodeURIComponent(searchKeyword.value.trim())}`;
        }
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:225", "请求URL:", url);
        const res = await utils_request.request(url, "get", {});
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:228", "学校列表响应:", res);
        if (res.code === 0) {
          const newSchools = res.data.data || [];
          common_vendor.index.__f__("log", "at pages/hello/hello.vue:232", `接收到新数据: ${newSchools.length} 条`);
          if (reset) {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:235", "重置列表数据");
            schoolList.value = newSchools;
            tempSelectedIndex.value = -1;
          } else {
            common_vendor.index.__f__(
              "log",
              "at pages/hello/hello.vue:239",
              `追加数据到现有列表，当前长度: ${schoolList.value.length}`
            );
            const oldLength = schoolList.value.length;
            await common_vendor.nextTick$1();
            newSchools.forEach((school) => {
              schoolList.value.push(school);
            });
            common_vendor.index.__f__(
              "log",
              "at pages/hello/hello.vue:252",
              `数据追加完成，新长度: ${schoolList.value.length}，实际增加: ${schoolList.value.length - oldLength}`
            );
            if (selectedSchool.value && tempSelectedIndex.value === -1) {
              const foundIndex = schoolList.value.findIndex(
                (school) => school.id && school.id === selectedSchool.value.id || school.school_id && school.school_id === selectedSchool.value.school_id || getSchoolName(school) === getSchoolName(selectedSchool.value)
              );
              if (foundIndex !== -1) {
                tempSelectedIndex.value = foundIndex;
                common_vendor.index.__f__("log", "at pages/hello/hello.vue:270", `重新定位选中学校索引: ${foundIndex}`);
              }
            }
          }
          hasMore.value = newSchools.length >= pageSize.value;
          currentPage.value = page;
          common_vendor.index.__f__(
            "log",
            "at pages/hello/hello.vue:279",
            `数据加载完成 - 当前页: ${page}, 新增: ${newSchools.length}, 总数: ${schoolList.value.length}, 还有更多: ${hasMore.value}`
          );
          await common_vendor.nextTick$1();
        } else {
          common_vendor.index.__f__("error", "at pages/hello/hello.vue:286", "接口返回错误:", res);
          common_vendor.index.showToast({
            title: res.message || "获取学校列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/hello/hello.vue:293", "获取学校列表出错:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        loading.value = false;
        common_vendor.index.__f__(
          "log",
          "at pages/hello/hello.vue:300",
          `加载完成，最终状态 - 列表长度: ${schoolList.value.length}, 还有更多: ${hasMore.value}`
        );
      }
    };
    const handleScrollToLower = async () => {
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:308", "=== 滚动到底部触发 ===");
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:309", "当前状态:", {
        hasMore: hasMore.value,
        loading: loading.value,
        isSearching: isSearching.value,
        currentPage: currentPage.value,
        listLength: schoolList.value.length
      });
      if (isSearching.value) {
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:319", "搜索模式下不自动加载更多");
        return;
      }
      if (hasMore.value && !loading.value) {
        const nextPage = currentPage.value + 1;
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:326", `触发加载下一页: ${nextPage}`);
        await loadSchools(nextPage, false);
      } else {
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:329", "不满足加载条件:", {
          hasMore: hasMore.value,
          loading: loading.value
        });
      }
    };
    const onSearchInput = () => {
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:338", "搜索输入:", searchKeyword.value);
      if (searchTimer.value) {
        clearTimeout(searchTimer.value);
      }
      if (!searchKeyword.value.trim()) {
        exitSearchMode();
        return;
      }
      searchTimer.value = setTimeout(() => {
        performSearch();
      }, 300);
    };
    const handleSearchConfirm = () => {
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:359", "搜索确认:", searchKeyword.value);
      if (searchTimer.value) {
        clearTimeout(searchTimer.value);
      }
      if (searchKeyword.value.trim()) {
        performSearch();
      } else {
        exitSearchMode();
      }
    };
    const performSearch = async () => {
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:375", "执行搜索:", searchKeyword.value);
      isSearching.value = true;
      currentPage.value = 1;
      hasMore.value = false;
      await loadSchools(1, true);
    };
    const exitSearchMode = async () => {
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:386", "退出搜索模式");
      isSearching.value = false;
      hasMore.value = true;
      currentPage.value = 1;
      await loadSchools(1, true);
    };
    const showSchoolPicker = async () => {
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:398", "显示学校选择器");
      showModal.value = true;
      searchKeyword.value = "";
      isSearching.value = false;
      currentPage.value = 1;
      hasMore.value = true;
      tempSelectedIndex.value = selectedSchoolIndex.value;
      await loadSchools(1, true);
    };
    const hideSchoolPicker = () => {
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:416", "隐藏学校选择器");
      showModal.value = false;
      searchKeyword.value = "";
      isSearching.value = false;
      if (searchTimer.value) {
        clearTimeout(searchTimer.value);
        searchTimer.value = null;
      }
    };
    const selectSchoolItem = (index) => {
      tempSelectedIndex.value = index;
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:431", "选择学校项:", index, schoolList.value[index]);
    };
    const confirmSchoolSelection = () => {
      if (tempSelectedIndex.value >= 0 && schoolList.value[tempSelectedIndex.value]) {
        selectedSchoolIndex.value = tempSelectedIndex.value;
        selectedSchool.value = schoolList.value[tempSelectedIndex.value];
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:442", "确认选择的学校:", selectedSchool.value);
      }
      hideSchoolPicker();
    };
    const selectedSchoolName = common_vendor.computed(() => {
      if (selectedSchool.value) {
        return getSchoolName(selectedSchool.value);
      }
      return "";
    });
    const maleImageSrc = common_vendor.computed(() => {
      return selectedSex.value === "male" ? "../../static/sex/male-select.png" : "../../static/sex/male-unselect.png";
    });
    const femaleImageSrc = common_vendor.computed(() => {
      return selectedSex.value === "female" ? "../../static/sex/female-select.png" : "../../static/sex/female-unselect.png";
    });
    const selectSex = (sex) => {
      selectedSex.value = sex;
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:470", "选择的性别:", selectedSex.value);
    };
    const rawDate = common_vendor.ref("2007-10-01");
    const startDate = common_vendor.ref("1900-01-01");
    const endDate = common_vendor.ref("2015-10-01");
    const dateParts = common_vendor.computed(() => {
      const [year, month, day] = rawDate.value.split("-");
      return {
        year,
        month: parseInt(month),
        // 去除前导零
        day: parseInt(day)
        // 去除前导零
      };
    });
    const bindDateChange = (e) => {
      rawDate.value = e.detail.value;
    };
    const handleNext = () => {
      if (selectedSchool.value) {
        common_vendor.index.setStorage({
          key: "school",
          data: selectedSchool.value,
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:498", "学校存储成功:", result);
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:501", "学校存储失败:", error);
          }
        });
      } else {
        common_vendor.index.showToast({
          title: "请先选择学校",
          icon: "none"
        });
        return;
      }
      if (selectedSex.value) {
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:512", "选择的性别:", selectedSex.value);
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:513", "选择的日期:", rawDate.value);
        common_vendor.index.setStorage({
          key: "sex",
          data: selectedSex.value,
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:518", "性别存储成功:", result);
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:521", "性别存储失败:", error);
          }
        });
        common_vendor.index.setStorage({
          key: "birth",
          data: rawDate.value,
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:528", "出生日期存储成功:", result);
            common_vendor.index.reLaunch({ url: "/pages/questionnaire/questionnaire" });
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:532", "出生日期存储失败:", error);
          }
        });
        common_vendor.index.setStorage({
          key: "isFirst",
          data: true,
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:539", "首次使用存储成功:", result);
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:542", "首次使用存储失败:", error);
          }
        });
      } else {
        common_vendor.index.showToast({
          title: "请先选择性别",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_assets._imports_1$2,
        c: maleImageSrc.value,
        d: common_vendor.o(($event) => selectSex("male")),
        e: femaleImageSrc.value,
        f: common_vendor.o(($event) => selectSex("female")),
        g: common_assets._imports_2$1,
        h: common_assets._imports_3,
        i: common_vendor.t(dateParts.value.year),
        j: common_vendor.t(dateParts.value.month),
        k: common_vendor.t(dateParts.value.day),
        l: startDate.value,
        m: endDate.value,
        n: common_vendor.o(bindDateChange),
        o: common_assets._imports_4,
        p: common_assets._imports_5,
        q: common_vendor.t(selectedSchoolName.value || "请选择学校"),
        r: common_vendor.o(showSchoolPicker),
        s: common_vendor.o(handleNext),
        t: showModal.value
      }, showModal.value ? common_vendor.e({
        v: common_vendor.o(hideSchoolPicker),
        w: common_vendor.o(confirmSchoolSelection),
        x: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, onSearchInput]),
        y: common_vendor.o(handleSearchConfirm),
        z: searchKeyword.value,
        A: common_vendor.f(schoolList.value, (school, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getSchoolName(school)),
            b: tempSelectedIndex.value === index
          }, tempSelectedIndex.value === index ? {} : {}, {
            c: `${school.id || school.school_id || index}-${currentPage.value}-${index}`,
            d: tempSelectedIndex.value === index ? 1 : "",
            e: common_vendor.o(($event) => selectSchoolItem(index), `${school.id || school.school_id || index}-${currentPage.value}-${index}`)
          });
        }),
        B: !isSearching.value && hasMore.value && !loading.value && schoolList.value.length > 0
      }, !isSearching.value && hasMore.value && !loading.value && schoolList.value.length > 0 ? {} : {}, {
        C: isSearching.value && !loading.value && schoolList.value.length === 0 && searchKeyword.value.trim()
      }, isSearching.value && !loading.value && schoolList.value.length === 0 && searchKeyword.value.trim() ? {} : {}, {
        D: !isSearching.value && !hasMore.value && schoolList.value.length > 0
      }, !isSearching.value && !hasMore.value && schoolList.value.length > 0 ? {} : {}, {
        E: loading.value
      }, loading.value ? {} : {}, {
        F: !loading.value && schoolList.value.length === 0 && !searchKeyword.value.trim()
      }, !loading.value && schoolList.value.length === 0 && !searchKeyword.value.trim() ? {} : {}, {
        G: common_vendor.o(handleScrollToLower),
        H: common_vendor.o(() => {
        }),
        I: common_vendor.o(hideSchoolPicker)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dc3958f6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/hello/hello.js.map
