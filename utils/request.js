/**
 * 请求封装函数
 * @param {string} url - 请求地址
 * @param {string} method - 请求方法，默认为GET
 * @param {object} data - 请求数据
 * @param {object} header - 自定义请求头
 * @returns {Promise} - 返回Promise对象
 */
const request = (url, method = 'GET', data = {}, header = {}) => {
  // 从本地存储获取token
  const token = uni.getStorageSync('token') || ''

  // 设置请求头，加入token
  const defaultHeader = {
    'Content-Type': 'application/json',
    Authorization: token ? `bearer ${token}` : '', // 常见的token携带方式
    is_yk: token ? '0' : '1',
    ...header, // 允许自定义header覆盖默认设置
  }

  // 返回Promise包装的请求
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      header: defaultHeader,
      success(res) {
        // 后端返回响应状态码200视为成功
        // console.log('请求成功:', res)
        if (res.statusCode == 200 && res.data.code == 0) {
          resolve(res.data)
        } else {
          reject(res.data || res)
        }
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

export default request
