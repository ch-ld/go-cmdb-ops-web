import Layout from '@/layout/index.vue'

// 处理子菜单的递归方法
export function subMenuList(subMenu) {
  const arr = []
  if (subMenu && subMenu.length > 0) {
    for (let i = 0; i < subMenu.length; i++) {
      const obj = {}
      obj.path = subMenu[i].path
      obj.name = subMenu[i].name
      obj.redirect = subMenu[i].redirect
      obj.meta = subMenu[i].meta
      if (subMenu[i.component] === 'Layout') {
        obj.component = Layout
      } else {
        const component = subMenu[i].component
        obj.component = (resolve) => require([`@/views${component}`], resolve)
      }
      obj.children = subMenuList(subMenu[i].children)
      arr.push(obj)
    }
  }
  return arr
}
