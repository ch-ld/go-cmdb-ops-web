import request from '@/utils/request'

export function getRoles(data) {
  return request({
    url: '/api/user/getRole',
    method: 'get'
    // data
  })
}
export function deleteRole(data) {
  return request({
    url: '/api/user/delRole',
    method: 'post',
    data
  })
}
export const addRole = (data) => { /* 实现 */ }

// export const deleteRole = (id) => { /* 实现 */ }
