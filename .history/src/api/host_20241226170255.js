// src/api/host.js
import request from '@/utils/request'

// 获取主机列表
export function getHosts(params) {
  return request({
    url: '/api/cmdb/hosts',
    method: 'get',
    params
  })
}

// 创建主机
export function createHost(data) {
  return request({
    url: '/api/cmdb/hosts',
    method: 'post',
    data
  })
}

// 更新主机
export function updateHost(id, data) {
  return request({
    url: `/api/cmdb/hosts/${id}`,
    method: 'put',
    data
  })
}

// 删除主机
export function deleteHost(id) {
  return request({
    url: `/api/cmdb/hosts/${id}`,
    method: 'delete'
  })
}

// 批量删除主机
export function batchDeleteHosts(ids) {
  return request({
    url: '/api/cmdb/hosts/deletes',
    method: 'post',
    data: { ids }
  })
}

// 检测主机
export function checkHost(id) {
  return request({
    url: `/api/cmdb/hosts/check/${id}`,
    method: 'get'
  })
}

// 同步云主机
export function syncCloudHosts(data) {
  return request({
    url: '/api/cmdb/host/sync',
    method: 'post',
    data
  })
}

// 获取主机详情
export function getHostDetail(id) {
  return request({
    url: `/api/v1/hosts/${id}`,
    method: 'get'
  })
}

// 导入主机
export function importHosts(data) {
  return request({
    url: `/api/cmdb/hosts/import`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载导入模板 前端直接处理
// export function downloadTemplate() {
//   return request({
//     url: '/api/cmdb/hosts/template',
//     method: 'get',
//     responseType: 'blob',
//     // 添加错误处理
//     validateStatus: status => {
//       return status >= 200 && status < 300
//     },
//     // 确保正确的请求头
//     headers: {
//       'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     }
//   })
// }
