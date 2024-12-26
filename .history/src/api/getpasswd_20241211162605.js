import request from '@/utils/request'

export function getpasswd(data) {
  return request({
    url: '/api/base/getpasswd',
    method: 'get',
    // eslint-disable-next-line no-undef
    params: {
      passwd: data.passwd || '123456'
    }
  })
}
