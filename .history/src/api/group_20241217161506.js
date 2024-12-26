// @/api/group.js
import { mockGroups } from './mock'

// 模拟网络延迟
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// 获取分组列表
export async function getGroups() {
  await delay()
  // 构建树形结构
  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }))
  }

  return {
    code: 200,
    data: buildTree(mockGroups)
  }
}

// 添加分组
export async function addGroup(groupData) {
  await delay()
  const newGroup = {
    id: `group_${mockGroups.length + 1}`,
    ...groupData,
    count: 0
  }
  mockGroups.push(newGroup)
  return {
    code: 200,
    data: newGroup
  }
}

// 更新分组
export async function updateGroup(groupData) {
  await delay()
  const index = mockGroups.findIndex(g => g.id === groupData.id)
  if (index > -1) {
    mockGroups[index] = {
      ...mockGroups[index],
      ...groupData
    }
    return {
      code: 200,
      data: mockGroups[index]
    }
  }
  return {
    code: 404,
    message: '分组不存在'
  }
}

// 删除分组
export async function deleteGroup(id) {
  await delay()
  const index = mockGroups.findIndex(g => g.id === id)
  if (index > -1) {
    // 检查是否有子分组
    const hasChildren = mockGroups.some(g => g.parentId === id)
    if (hasChildren) {
      return {
        code: 400,
        message: '该分组下存在子分组，无法删除'
      }
    }
    mockGroups.splice(index, 1)
    return {
      code: 200,
      data: null
    }
  }
  return {
    code: 404,
    message: '分组不存在'
  }
}
