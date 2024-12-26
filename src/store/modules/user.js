import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    menus: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLE: (state, roles) => {
    state.roles = roles
  },
  SET_MENU: (state, menus) => {
    state.menus = menus
  }
}

const actions = {
  // 调用登陆
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        // console.log('data:', data)
        commit('SET_TOKEN', data) // 存储在vuex中
        setToken(data) // 存储到token中
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { Username, Avatar, RoleNames, Menus } = data
        commit('SET_NAME', Username)
        commit('SET_AVATAR', Avatar)
        commit('SET_ROLE', RoleNames)
        commit('SET_MENU', Menus)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout 退出登陆
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first  清空token
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

