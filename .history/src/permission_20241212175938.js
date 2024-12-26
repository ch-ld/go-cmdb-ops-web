import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist 白名单列表，其他路由都要经过路由守卫

// 导航守卫
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title 浏览器选项卡标签名
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in 获取token
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // 关闭加载图标
    } else {
      const hasGetUserInfo = store.getters.name // 是否获取用户信息

      // 获取角色
      const roles = store.getters.roles

      // 通过角色获取路由
      const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

      // 添加到路由
      router.addRoutes(accessRoutes)

      if (hasGetUserInfo) {
        next() // 直接放行
      } else {
        try {
          // get user info 获取用户信息
          await store.dispatch('user/getInfo')

          next()
        } catch (error) {
          // 获取用户信息失败（token失效）
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    // 无token

    // 判断是否在白名单
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
