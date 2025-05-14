import { json } from 'stream/consumers'
import { baseUrl } from './config'
let commonParams = null

// type: 'pv' | 'show' | 'click' | 'st',
// data: any = {},
// options: any = {}
let _pages_ = getApp().globalData._pages
export async function dmReport(type, data = {}, options = {}) {
  const pages = getCurrentPages()
  // const route = pages[pages.length - 1]
  // switch (_pages_[_pages_.length - 1]) {
  //   case 'pages/home/home':
  //     _pages_[_pages_.length - 1] = 'shubo_portraitHome'
  //     break
  //   case 'pages/my/my':
  //     _pages_[_pages_.length - 1] = 'shubo_portraitMy'
  //     break
  //   case 'pages/template-use/template-use':
  //     _pages_[_pages_.length - 1] = 'shubo_portraitcreate'
  //     break
  //   case 'pages/ai-generator-index/ai-generator-index':
  //     _pages_[_pages_.length - 1] = 'shubo_portraitList'
  //     break
  //   case 'pages/hd-page/hd-page':
  //     _pages_[_pages_.length - 1] = 'shubo_portraitDetail'
  //     break
  //   case 'pages/edit_photo/index':
  //     _pages_[_pages_.length - 1] = 'shubo_portraitEditIDPhoto'
  //     break
  //   default:
  //     break
  // }
  // console.log('pages_____', _pages_)
  const token = uni.getStorageSync('token') || ''

  // 设置请求头，加入token
  const defaultHeader = {
    'Content-Type': 'application/json',
    Authorization: token ? `bearer ${token}` : '', // 常见的token携带方式
    is_yk: token ? '0' : '1',
  }
  const systemData = JSON.stringify({
    event: type,
    lob: data,
    // lastpage: _pages_[_pages_.length - 1] || '',
    ...(await getCommonParams()), // 公共参数
    ...options,
  })
  uni.request({
    method: 'POST',
    url: `${baseUrl}/track/send`,
    data: JSON.stringify({
      lastp: 'index',
      event: type,
      lob: data,
      network: await getNetworkType(),
      // lastpage: _pages_[_pages_.length - 1] || '',
      ...(await getCommonParams()), // 公共参数
      ...options,
    }),
    header: defaultHeader,
  })
}

async function getNetworkType() {
  return new Promise((resolve) => {
    uni.getNetworkType({
      complete: (res) => resolve(res.networkType || ''),
    })
  })
}

async function getCommonParams() {
  if (commonParams) return commonParams
  return new Promise((resolve) => {
    uni.getSystemInfo({
      success: async (res) => {
        const sessionid = Date.now() + Math.random().toString(36).substring(2)
        const launchParams = uni.getLaunchOptionsSync()
        const rch = launchParams?.query?.rch || ''

        commonParams = {
          sessionid,
          rch,
          dist_ch: 'SHXZ-WX',
          platform: 'miniprogram',
          did: res.deviceId,
          width: res.screenWidth,
          height: res.screenHeight,
          ts: Date.now(),
          app_ver: res.appVersion,
          os: res.system?.split(' ')[0],
          os_ver: res.system?.split(' ')[1],
          model: res.model,
          net: await getNetworkType(),
        }
        resolve(commonParams)
      },
    })
  })
}
