// @/api/mock.js

// 模拟主机数据
export const mockHosts = [
  {
    id: 'host_1',
    name: 'Web Server 01',
    ip: '192.168.1.100',
    status: 'online',
    groupId: 'group_1',
    owner: 'DevOps Team',
    monitor: 'normal',
    remarks: '主要用于生产环境web服务',
    sshPort: 22,
    sshUsername: 'admin',
    createTime: '2024-01-01T00:00:00Z',
    updateTime: '2024-01-01T00:00:00Z'
  },
  {
    id: 'host_2',
    name: 'DB Server 01',
    ip: '192.168.1.101',
    status: 'online',
    groupId: 'group_2',
    owner: 'DBA Team',
    monitor: 'warning',
    remarks: '主数据库服务器',
    sshPort: 22,
    sshUsername: 'admin',
    createTime: '2024-01-01T00:00:00Z',
    updateTime: '2024-01-01T00:00:00Z'
  },
  {
    id: 'host_3',
    name: 'App Server 01',
    ip: '192.168.1.102',
    status: 'maintenance',
    groupId: 'group_1',
    owner: 'App Team',
    monitor: 'normal',
    remarks: '应用服务器',
    sshPort: 22,
    sshUsername: 'admin',
    createTime: '2024-01-01T00:00:00Z',
    updateTime: '2024-01-01T00:00:00Z'
  },
  {
    id: 'host_4',
    name: 'Cache Server 01',
    ip: '192.168.1.103',
    status: 'offline',
    groupId: 'group_3',
    owner: 'DevOps Team',
    monitor: 'error',
    remarks: 'Redis缓存服务器',
    sshPort: 22,
    sshUsername: 'admin',
    createTime: '2024-01-01T00:00:00Z',
    updateTime: '2024-01-01T00:00:00Z'
  }
]

// 生成更多测试数据
for (let i = 5; i <= 50; i++) {
  mockHosts.push({
    id: `host_${i}`,
    name: `Server ${i.toString().padStart(2, '0')}`,
    ip: `192.168.1.${i + 100}`,
    status: ['online', 'offline', 'maintenance'][Math.floor(Math.random() * 3)],
    groupId: `group_${Math.floor(Math.random() * 3) + 1}`,
    owner: ['DevOps Team', 'DBA Team', 'App Team'][Math.floor(Math.random() * 3)],
    monitor: ['normal', 'warning', 'error'][Math.floor(Math.random() * 3)],
    remarks: `测试服务器 ${i}`,
    sshPort: 22,
    sshUsername: 'admin',
    createTime: '2024-01-01T00:00:00Z',
    updateTime: '2024-01-01T00:00:00Z'
  })
}

// 模拟分组数据
export const mockGroups = [
  {
    id: 'group_1',
    name: '应用服务器组',
    parentId: null,
    count: mockHosts.filter(h => h.groupId === 'group_1').length
  },
  {
    id: 'group_2',
    name: '数据库服务器组',
    parentId: null,
    count: mockHosts.filter(h => h.groupId === 'group_2').length
  },
  {
    id: 'group_3',
    name: '缓存服务器组',
    parentId: null,
    count: mockHosts.filter(h => h.groupId === 'group_3').length
  },
  {
    id: 'group_1_1',
    name: 'Web服务器',
    parentId: 'group_1',
    count: 5
  },
  {
    id: 'group_1_2',
    name: 'API服务器',
    parentId: 'group_1',
    count: 3
  },
  {
    id: 'group_2_1',
    name: 'MySQL服务器',
    parentId: 'group_2',
    count: 2
  },
  {
    id: 'group_2_2',
    name: 'MongoDB服务器',
    parentId: 'group_2',
    count: 2
  }
]
