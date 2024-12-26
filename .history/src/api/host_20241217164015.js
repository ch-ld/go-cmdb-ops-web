// src/api/host.js
import request from '@/utils/request'

// 获取主机列表
export function getHostList(params) {
  return request({
    url: '/host/list',
    method: 'get',
    params
  })
}

// 获取主机详情
export function getHostDetail(id) {
  return request({
    url: `/host/${id}`,
    method: 'get'
  })
}

// 创建主机
export function createHost(data) {
  return request({
    url: '/host/create',
    method: 'post',
    data
  })
}

// 更新主机信息
export function updateHost(id, data) {
  return request({
    url: `/host/${id}`,
    method: 'put',
    data
  })
}

// 删除主机
export function deleteHost(id) {
  return request({
    url: `/host/${id}`,
    method: 'delete'
  })
}

// 批量删除主机
export function batchDeleteHosts(ids) {
  return request({
    url: '/host/batch-delete',
    method: 'post',
    data: { ids }
  })
}

// 获取主机分组列表
export function getHostGroups() {
  return request({
    url: '/host/groups',
    method: 'get'
  })
}

// 更新主机监控设置
export function updateHostMonitorSettings(id, data) {
  return request({
    url: `/host/${id}/monitor-settings`,
    method: 'put',
    data
  })
}
