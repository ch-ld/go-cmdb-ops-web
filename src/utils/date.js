// @/utils/date.js
export function formatDate(date) {
  if (!date) return '-'

  try {
    // 如果是时间戳或字符串，转换为 Date 对象
    if (!(date instanceof Date)) {
      date = new Date(date)
    }

    // 检查是否是有效日期
    if (isNaN(date.getTime())) {
      return '-'
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '-'
  }
}
