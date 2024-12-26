<template>
  <div class="app-container">
    <div class="sidebar">
      <h2>服务器列表</h2>
      <ul>
        <li v-for="(servers, label) in labelGroups" :key="label">
          <span @click="toggleLabelFolder(label)">{{ label }}</span>
          <ul v-show="isLabelFolderOpen(label)">
            <li v-for="server in servers" :key="server.id" @click="showConnectionOptions(server)">
              {{ server.cmdbname }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="main-content">
      <div class="tabs">
        <div
          v-for="(connectedServer, index) in connectedServers"
          :key="index"
          class="tab"
          :class="{ active: connectedServer === activeTab }"
          @click="switchToTab(connectedServer)"
        >
          {{ connectedServer.server.cmdbname }}
        </div>
      </div>
      <div ref="xtermContainer" style="width: calc(100% - 40px); height: 600px; padding: 20px" />
    </div>

    <div v-if="connectionOptionsDialog" class="custom-dialog">
      <h2>请选择连接方式</h2>
      <label>
        <input v-model="selectedConnectionType" type="radio" value="PASSWORD"> 密码连接
      </label>
      <label>
        <input v-model="selectedConnectionType" type="radio" value="PUBLICKEY"> 密钥连接
      </label>
      <button @click="connectToServer">连接</button>
      <button @click="connectionOptionsDialog = false">取消</button>
    </div>
  </div>
</template>

<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import { getHosts } from '@/api/host'

export default {
  name: 'Xterm',
  data() {
    return {
      term: null,
      xtermRef: '',
      socketURI: '',
      socket: null,
      servers: [], // 存储服务器数据的数组
      connectedServers: [], // 存储已连接服务器数据的数组
      activeTab: null, // 存储当前活动的选项卡
      connectionOptionsDialog: false,
      selectedConnectionType: 'PASSWORD', // 默认为密码连接
      selectedServer: null,
      terminalElements: {}, // 存储每个服务器对应的终端 DOM 元素
      terminalContainers: {},
      labelGroups: {}, // 存储按标签分组的服务器
      labelFolderStates: {} // 存储标签文件夹的展开状态

    }
  },
  created() {
    this.fetchServers()

    // 初始化标签文件夹的展开状态，默认为 false
    for (const label in this.labelGroups) {
      this.$set(this.labelFolderStates, label, false)
    }
  },
  mounted() {
    // 使用默认的 socketURI 初始化终端
    this.initTerm('')
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close()
    }
    if (this.term) {
      this.term.dispose()
    }
  },
  methods: {
    async fetchServers() {
      try {
        const response = await getHosts({ id: 0 })
        this.servers = response.data

        // 按标签分组服务器
        this.labelGroups = this.servers.reduce((groups, server) => {
          if (!groups[server.label]) {
            groups[server.label] = []
          }
          groups[server.label].push(server)
          return groups
        }, {})
      } catch (error) {
        console.error('获取服务器失败：', error)
      }
    },
    showConnectionOptions(server) {
      // 为稍后连接存储选定的服务器
      this.selectedServer = server

      // 打开自定义连接选项对话框
      this.connectionOptionsDialog = true
    },
    connectToServer() {
      const socketURI =
        `ws://192.168.2.51:8000/api/admin/user/ssh/webssh?ip=${this.selectedServer.private_ip}&port=${this.selectedServer.ssh_port}&username=${this.selectedServer.username}&password=${this.selectedServer.password}&authmodel=${this.selectedConnectionType}`

      // 创建新的终端实例和 WebSocket 连接
      const term = new Terminal()
      const socket = new WebSocket(socketURI)
      const attachAddon = new AttachAddon(socket)
      const fitAddon = new FitAddon()
      term.loadAddon(attachAddon)
      term.loadAddon(fitAddon)

      // 创建一个新的 DOM 元素来承载终端
      const terminalContainer = document.createElement('div')
      term.open(terminalContainer)
      fitAddon.fit()
      term.focus()

      // 将连接的服务器及其终端实例保存到数组中
      const connectedServer = {
        server: this.selectedServer,
        term: term,
        socket: socket
      }
      this.connectedServers.push(connectedServer)
      this.activeTab = connectedServer

      // 将终端容器关联到对应服务器的键
      this.terminalContainers[connectedServer.server.id] = terminalContainer
      // 存储连接的服务器的终端元素和容器
      this.terminalElements[this.selectedServer.id] = terminalContainer
      this.terminalContainers[this.selectedServer.id] = terminalContainer

      // 清空之前的终端容器
      this.$refs.xtermContainer.innerHTML = ''
      // 将当前服务器的终端容器添加到页面
      this.$refs.xtermContainer.appendChild(terminalContainer)

      // 关闭连接选项对话框
      this.connectionOptionsDialog = false
    },

    initTerm(socketURI) {
      const term = new Terminal()
      const socket = new WebSocket(socketURI)
      const attachAddon = new AttachAddon(socket)
      const fitAddon = new FitAddon()
      term.loadAddon(attachAddon)
      term.loadAddon(fitAddon)
      term.open(this.$refs['xtermRef'])
      fitAddon.fit()
      term.focus()
      this.term = term
      this.socket = socket
    },
    switchToTab(connectedServer) {
      // 将活动选项卡设置为选定的已连接服务器
      this.activeTab = connectedServer

      // 更新活动终端容器
      const terminalContainer = this.terminalContainers[connectedServer.server.id]
      this.$refs.xtermContainer.innerHTML = ''
      this.$refs.xtermContainer.appendChild(terminalContainer)
    },
    toggleLabelFolder(label) {
      this.$set(this.labelFolderStates, label, !this.labelFolderStates[label])
    },
    isLabelFolderOpen(label) {
      return this.labelFolderStates[label] || false
    }

  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar h2 {
  font-size: 18px;
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  width: 100%;
  overflow: auto;
}

.sidebar li {
  padding: 8px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sidebar li:hover {
  background-color: #cf110e;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.tabs {
  display: flex;
  margin-bottom: 10px;
}

.tab {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tab.active {
  background-color: #cf110e;
}

.custom-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
}
</style>
