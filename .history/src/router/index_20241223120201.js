import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */
/**
 * 动态路由
 */
// export const asyncRoutes = []

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 * 1. 静态路由
 * 2. 所有用户都可以访问
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard', affix: true }
    }]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/navIndex',
    children: [{
      path: 'navIndex',
      name: '内部导航',
      component: () => import('@/views/navfrom/index.vue'),
      meta: { title: '内部导航', icon: 'list', affix: true }
    }]
  },
  {
    path: '/users',
    component: Layout,
    name: '用户中心',
    meta: { title: '用户中心', icon: 'peoples' },
    children: [
      {
        path: 'user',
        name: '用户中心',
        component: () => import('@/views/users/user/index'),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'roles',
        name: '角色中心',
        component: () => import('@/views/users/roles/index'),
        meta: { title: '角色管理', icon: 'people' }
      }
    ]
  },
  {
    path: '/hosts', // 新一级目录路径为 /ops
    component: Layout,
    name: '主机管理',
    meta: { title: 'CMDB', icon: 'list' },
    children: [
      {
        path: 'host',
        name: '主机配置',
        component: () => import('@/views/hosts/host/index'),
        meta: { title: '主机管理', icon: 'list' }
      },
      {
        path: 'hostsGroup',
        name: '主机组配置',
        component: () => import('@/views/hosts/hostsGroup/index'),
        meta: { title: '主机组管理', icon: 'list' }
      },
      {
        path: 'ssh',
        component: Layout,
        name: '远程操作',
        meta: { title: '远程操作', icon: 'list' },
        children: [
          {
            path: 'shell',
            name: 'WEB终端',
            component: () => import('@/views/hosts/ssh/index.vue'),
            meta: { title: 'SSH管理', icon: 'list' }
          }
        ]
      }
    ]
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
