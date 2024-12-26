
import { getpasswd } from '@/api/getpasswd'

/**
 * @description RSA加密，仅加密密码并进行Base64编码
 * @param data
 * @returns {Promise<{param: PromiseLike<ArrayBuffer>}|*>}
 */
export async function encryptedData(data) {
  const res = await getpasswd(data)
  const encryptedPassword = res.data // 暂存加密后的密码
  console.log(encryptedPassword)
  if (encryptedPassword) {
    return { ...data, password: encryptedPassword } // 返回新对象，确保原对象不被直接修改
  }
  return data // 如果没有加密密码，返回原数据
}

