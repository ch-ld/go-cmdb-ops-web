import request from '@/utils/request'
// import { encryptedData } from '@/utils/encrypt'

export function login(data) {
  // data = await encryptedData(data)
  // console.log('data:', data)
  return request({
    url: '/api/admin/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/user/info',
    method: 'post',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
