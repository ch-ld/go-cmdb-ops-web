import request from '@/utils/request'

  export function addCmdb(data) {
    return request({
      url: '/api/cmdb/addCmdb',
      method: 'post',
      data
    })
  }
  export function delCmdb(data) {
    return request({
      url: '/api/cmdb/delCmdb',
      method: 'post',
      data
    })
  }
  export function getCmdb(data) {
    return request({
      url: '/api/cmdb/getCmdb',
      method: 'post',
      data
    })
  }
  export function editCmdb(data) {
    return request({
      url: '/api/cmdb/editCmdb',
      method: 'post',
      data
    })
  }
  
  export function getSearchCmdb(data) {
    return request({
      url: '/api/cmdb/GetSearchCmdb',
      method: 'post',
      data
    })
  }
