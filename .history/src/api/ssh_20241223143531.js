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

export function getWebSSHUrl(params, token) {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  // const host = window.location.host
  // 将 token 添加到 params 中
  params.token = token

  return `${wsProtocol}//localhost:8000/api/cmdb/ssh/webssh?${new URLSearchParams(params)}`
}
