import request from '@/utils/request'

export function getPublicKey(data) {
  return request({
    url: '/api/base/getpasswd',
    method: 'get'
    // eslint-disable-next-line no-undef
    // body: data.password
  })
}
