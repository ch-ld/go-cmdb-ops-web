import request from '@/utils/request'

export async function login(data) {
  try {
    // 发送请求生成加密密码
    const formData = new FormData()
    formData.append('passwd', data.password)// 传递密码

    const response = await fetch('http://localhost:8888/api/base/getpasswd', {
      method: 'get',
      body: formData
    })

    const result = await response.json()

    // 检查接口响应
    if (result.code === 0) {
      // 更新 data.password 为加密后的字符串
      // eslint-disable-next-line require-atomic-updates
      data.password = result.data

      // 发送登录请求
      return request({
        url: '/api/base/login',
        method: 'post',
        data
      })
    } else {
      throw new Error(result.msg || 'Failed to get encrypted password')
    }
  } catch (err) {
    console.error('Login error:', err)
    throw err// 可以根据需要处理错误
  }
}

export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
