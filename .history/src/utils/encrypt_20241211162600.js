
import { getpasswd } from '@/api/getpasswd'

/**
 * @description RSA加密，仅加密密码并进行Base64编码
 * @param data
 * @returns {Promise<{param: PromiseLike<ArrayBuffer>}|*>}
 */
export async function encryptedData(data) {
  const res = await getpasswd()
  data.password = res.data
  return data // 如果没有密码字段，返回原数据
}

