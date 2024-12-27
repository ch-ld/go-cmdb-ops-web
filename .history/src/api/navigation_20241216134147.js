import request from '@/utils/request'

export function fetchNavigationRecords(data) {
  return request({
    url: '/api/home/navigation',
    method: 'get',
    data
  })
}

export function createNavigationRecord(data) {
  return request({
    url: '/api/home/navigation',
    method: 'post',
    data
  })
}

export function updateNavigationRecord(data) {
  return request({
    url: '/api/home/navigation',
    method: 'put',
    data
  })
}

export function deleteNavigationRecord(data) {
  return request({
    url: '/api/home/navigation',
    method: 'delete',
    data
  })
}

export function sortNavigationRecord(data) {
  return request({
    url: '/api/home/navigation',
    method: 'patch',
    data
  })
}