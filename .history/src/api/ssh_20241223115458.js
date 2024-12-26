// src/api/ssh.js
import request from '@/utils/request'

export function executeCommand(data) {
  return request({
    url: '/api/v1/cmdb/ssh/command',
    method: 'post',
    data
  })
}

export function createFile(data) {
  return request({
    url: '/api/v1/cmdb/ssh/createFile',
    method: 'post',
    data
  })
}

export function getWebSSHUrl(params) {
  const baseUrl = process.env.VUE_APP_BASE_API
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${wsProtocol}//${host}${baseUrl}/cmdb/ssh/webssh?${new URLSearchParams(params)}`
}
