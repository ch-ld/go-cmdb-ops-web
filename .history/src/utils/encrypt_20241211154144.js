import { JSEncrypt } from 'jsencrypt'
import { getPublicKey } from '@/api/publicKey'

const privateKey = ''

/**
 * @description RSA加密，仅加密密码并进行Base64编码
 * @param data
 * @returns {Promise<{param: PromiseLike<ArrayBuffer>}|*>}
 */
export async function encryptedData(data) {
  let publicKey = ''
  const res = await getPublicKey()
  publicKey = res.data.publicKey
  if (res.data.mockServer) {
    publicKey = ''
  }
  if (publicKey === '') {
    return data
  }

  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(
    `-----BEGIN PUBLIC KEY-----${publicKey}-----END PUBLIC KEY-----`
  )

  // 仅加密密码并进行Base64编码
  if (data.password) {
    const encryptedPassword = encrypt.encrypt(data.password)
    // Base64编码
    const base64EncodedPassword = btoa(encryptedPassword) // 注意：浏览器环境下使用 btoa
    return {
      ...data,
      password: base64EncodedPassword // 替换为Base64编码后的加密密码
    }
  }

  return data // 如果没有密码字段，返回原数据
}

/**
 * @description RSA解密
 * @param data
 * @returns {PromiseLike<ArrayBuffer>}
 */
export function decryptedData(data) {
  const decrypt = new JSEncrypt()
  decrypt.setPrivateKey(
    `-----BEGIN RSA PRIVATE KEY-----${privateKey}-----END RSA PRIVATE KEY-----`
  )
  // 需要先进行Base64解码
  const base64DecodedPassword = atob(data.password) // 注意：浏览器环境下使用 atob
  const decryptedPassword = decrypt.decrypt(base64DecodedPassword)

  return {
    ...data,
    password: decryptedPassword // 返回解密后的密码
  }
}
