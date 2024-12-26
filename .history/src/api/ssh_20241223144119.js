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

export function getWebSSHUrl(params, data) {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

  // 构建 WebSocket URL
  const url = `${wsProtocol}//localhost:8000/api/cmdb/ssh/webssh?${new URLSearchParams(params)}`

  return {
    url,
    headers: {
      'X-Token': data.token // 将 token 添加到请求头中
    }
  }
}
