// @/api/host.js
import { mockHosts } from './mock'

// 模拟网络延迟
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// 获取主机列表
export async function getHosts({ page = 1, size = 20, query = '' } = {}) {
  await delay()
  let data = [...mockHosts]

  // 搜索过滤
  if (query) {
    data = data.filter(
      host =>
        host.name.toLowerCase().includes(query.toLowerCase()) ||
        host.ip.includes(query)
    )
  }

  // 分页处理
  const total = data.length
  const start = (page - 1) * size
  const end = start + size
  data = data.slice(start, end)

  return {
    code: 200,
    data: {
      list: data,
      total,
      page,
      size
    }
  }
}

// 添加主机
export async function addHost(hostData) {
  await delay()
  const newHost = {
    id: `host_${mockHosts.length + 1}`,
    createTime: new Date().toISOString(),
    ...hostData
  }
  mockHosts.push(newHost)
  return {
    code: 200,
    data: newHost
  }
}

// 更新主机
export async function updateHost(hostData) {
  await delay()
  const index = mockHosts.findIndex(h => h.id === hostData.id)
  if (index > -1) {
    mockHosts[index] = {
      ...mockHosts[index],
      ...hostData,
      updateTime: new Date().toISOString()
    }
    return {
      code: 200,
      data: mockHosts[index]
    }
  }
  return {
    code: 404,
    message: '主机不存在'
  }
}

// 删除主机
export async function deleteHost(id) {
  await delay()
  const index = mockHosts.findIndex(h => h.id === id)
  if (index > -1) {
    mockHosts.splice(index, 1)
    return {
      code: 200,
      data: null
    }
  }
  return {
    code: 404,
    message: '主机不存在'
  }
}

// 验证主机连接
export async function validateHosts(ids) {
  await delay()
  const results = ids.map(id => {
    // eslint-disable-next-line no-unused-vars
    const host = mockHosts.find(h => h.id === id)
    return {
      id,
      success: Math.random() > 0.3, // 随机模拟成功/失败
      message: Math.random() > 0.3 ? 'Connection successful' : 'Connection failed'
    }
  })
  return {
    code: 200,
    data: results
  }
}

// 批量操作主机
export async function batchOperateHosts(ids, operation) {
  await delay()
  const results = ids.map(id => {
    const host = mockHosts.find(h => h.id === id)
    if (host) {
      switch (operation) {
        case 'start':
          host.status = 'online'
          break
        case 'stop':
          host.status = 'offline'
          break
        case 'maintenance':
          host.status = 'maintenance'
          break
      }
      return {
        id,
        success: true
      }
    }
    return {
      id,
      success: false,
      message: '主机不存在'
    }
  })
  return {
    code: 200,
    data: results
  }
}
