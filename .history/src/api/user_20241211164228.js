import request from '@/utils/request'
// import { encryptedData } from '@/utils/encrypt'

export async function login(data) {
  // data = await encryptedData(data)
  return request({
    url: '/login',
    method: 'post',
    data
  })
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
