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
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/api/user/logout',
    method: 'post'
  })
}

export function addUser(data) {
  return request({
    url: '/api/user/addUser',
    method: 'post',
    data
  })
}
export function delUser(data) {
  return request({
    url: '/api/user/delUser',
    method: 'post',
    data
  })
}
export function getUser(data) {
  return request({
    url: '/api/user/getUser',
    method: 'post',
    data
  })
}
export function editUser(data) {
  return request({
    url: '/api/user/editUser',
    method: 'post',
    data
  })
}
