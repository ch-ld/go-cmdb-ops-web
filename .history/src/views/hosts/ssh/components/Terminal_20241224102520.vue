<template>
  <div class="ssh-terminal">
    <div ref="terminal" class="terminal-container" />
    <div class="toolbar">
      <el-button type="primary" :disabled="!isConnected" @click="sendCommand('clear')">
        清屏
      </el-button>
      <el-button type="primary" :disabled="!isConnected" @click="sendCommand('su -')">
        切换到 root
      </el-button>
      <el-button type="primary" :disabled="!isConnected" @click="sendCommand('exit')">
        退出 root
      </el-button>
      <el-button type="primary" :disabled="!isConnected" @click="sendCommand('ls -l')">
        列出文件
      </el-button>
      <el-button type="primary" :disabled="!isConnected" @click="sendCommand('cd ~')">
        返回家目录
      </el-button>
      <el-dropdown trigger="click" :disabled="!isConnected">
        <el-button type="primary">
          历史命令
          <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="cmd in historyCommands" :key="cmd" @click.native="sendCommand(cmd)">
            {{ cmd }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click" :disabled="!isConnected">
        <el-button type="primary">
          主题切换
          <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="theme in terminalThemes" :key="theme.name" @click.native="changeTheme(theme)">
            {{ theme.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit'
import { getWebSSHUrl } from '@/api/ssh'
import { ElMessage, ElButton, ElDropdown, ElDropdownItem } from 'element-ui'

export default {
  name: 'SshTerminal',
  props: {
    host: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      terminal: null,
      websocket: null,
      fitAddon: null,
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 3,
      historyCommands: [],
      terminalThemes: [
        { name: 'Default', theme: { background: '#1e1e1e', foreground: '#ffffff', cursor: '#ffffff' }},
        { name: 'Solarized Dark', theme: { background: '#002b36', foreground: '#839496', cursor: '#93a1a1' }},
        { name: 'Monokai', theme: { background: '#272822', foreground: '#f8f8f2', cursor: '#f92672' }}
      ],
      currentTheme: 0
    }
  },
  mounted() {
    this.initTerminal()
    this.$nextTick(() => {
      this.connectWebSocket()
    })
  },
  beforeDestroy() {
    this.destroyTerminal()
  },
  methods: {
    initTerminal() {
      this.terminal = new Terminal({
        cursorBlink: true,
        theme: this.terminalThemes[this.currentTheme].theme,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        rows: 30,
        cols: 100,
        scrollback: 1000,
        convertEol: true
      })

      this.fitAddon = new FitAddon()
      this.terminal.loadAddon(this.fitAddon)

      this.terminal.open(this.$refs.terminal)

      this.$nextTick(() => {
        this.fitAddon.fit()
      })

      window.addEventListener('resize', this.onResize)

      this.terminal.onData(data => {
        if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(data)
          this.updateHistoryCommands(data)
        }
      })
    },

    async connectWebSocket() {
      try {
        // 构建连接参数
        const params = {
          ip: this.host.privateIp || this.host.publicIp,
          port: this.host.sshPort || 22, // 默认 SSH 端口
          username: this.host.sshUser,
          password: this.host.sshPassword,
          authmodel: this.host.sshAuthType || 'PASSWORD'
        }

        // 获取 WebSocket URL
        const wsUrl = await getWebSSHUrl(params)

        // 创建 WebSocket 连接
        this.websocket = new WebSocket(wsUrl)

        // 连接成功处理
        this.websocket.onopen = () => {
          this.isConnected = true
          this.reconnectAttempts = 0
          this.terminal.write('\r\n*** Connected to SSH server ***\r\n')

          // 设置终端数据发送处理
          this.terminal.onData(data => {
            if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
              this.websocket.send(data)
            }
          })
        }

        // 接收消息处理
        this.websocket.onmessage = (event) => {
          this.terminal.write(event.data)
        }

        // 错误处理
        this.websocket.onerror = (event) => {
          console.error('WebSocket error:', event)
          this.terminal.write('\r\n*** WebSocket error occurred ***\r\n')
          this.tryReconnect()
        }

        // 连接关闭处理
        this.websocket.onclose = (event) => {
          this.isConnected = false
          this.terminal.write('\r\n*** Connection closed ***\r\n')

          if (event.code !== 1000) { // 非正常关闭
            this.tryReconnect()
          }
        }
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error)
        this.terminal.write('\r\n*** Failed to connect to SSH server ***\r\n')
        ElMessage.error('连接SSH服务器失败')
      }
    },

    tryReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        this.terminal.write(`\r\n*** Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) ***\r\n`)

        setTimeout(() => {
          this.connectWebSocket()
        }, 2000) // 2秒后重试
      } else {
        this.terminal.write('\r\n*** Max reconnection attempts reached ***\r\n')
        ElMessage.error('连接失败,请检查网络或重新打开终端')
      }
    },

    onResize() {
      if (this.fitAddon) {
        this.fitAddon.fit()
        // 发送新的终端大小到服务器
        if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify({
            type: 'resize',
            rows: this.terminal.rows,
            cols: this.terminal.cols
          }))
        }
      }
    },

    destroyTerminal() {
      window.removeEventListener('resize', this.onResize)

      if (this.websocket) {
        this.websocket.close(1000, 'Terminal destroyed')
      }

      if (this.terminal) {
        this.terminal.dispose()
      }

      this.terminal = null
      this.websocket = null
      this.fitAddon = null
      this.isConnected = false
    },

    sendCommand(command) {
      if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(command + '\n')
      }
    },
    sendCommand(command) {
      if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(command + '\n')
      }
    },

    updateHistoryCommands(data) {
      if (data.trim().length > 0) {
        this.historyCommands.push(data.trim())
      }
    },

    changeTheme(theme) {
      this.currentTheme = this.terminalThemes.indexOf(theme)
      this.terminal.setOption('theme', theme.theme)
    }
  }
}
</script>

<style lang="scss" scoped>
.ssh-terminal {
  height: 600px;
  background: #1e1e1e;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;

  .terminal-container {
    flex: 1;
    overflow: hidden;
    position: relative;

    :deep(.xterm) {
      height: 100%;

      .xterm-viewport {
        overflow-y: auto;
      }
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
