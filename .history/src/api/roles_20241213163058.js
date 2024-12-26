import request from '@/utils/request'

export function getRoles(data) {
  return request({
    url: '/api/user/getRole',
    method: 'get'
    // data
  })
}
export const addRole = (data) => { /* 实现 */ }
export const editRole = (data) => { /* 实现 */ }
export const deleteRole = (id) => { /* 实现 */ }
