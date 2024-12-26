import { constantRoutes } from '@/router'
import Layout from '@/layout/index.vue'
import store from '..'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    // 将静态路由和动态路由合并到一起
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      let asyncRoutes = []
      // 获取异步路由
      const menus = store.getters.menus

      // 处理json 菜单数据
      // eslint-disable-next-line no-empty
      const menusList = []
      if (menus && menus.length > 0) {
        for (let i = 0; i < menus.length; i++) {
          const obj = {}
          obj.path = menus[i].path
          obj.name = menus[i].name
          obj.redirect = menus[i].redirect
          obj.meta = menus[i].meta
          if (menus[i.component] === 'Layout') {
            obj.component = Layout
          } else {
            const component = menus[i].component
            obj.component = (resolve) => require([`@/views${component}`], resolve)
          }
          if (obj.children === 'children') {
            // eslint-disable-next-line no-undef
            obj.children = children
          }
          menusList.push(obj)
        }
        asyncRoutes = menus
      }
      console.log('菜单:', menus)
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes) // 静态路由和动态路由合并
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
