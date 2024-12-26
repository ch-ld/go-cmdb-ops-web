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
      <el-button type="primary" :disabled="!isConnected" @click="toggleFullscreen">
        全屏
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
    </div>
  </div>
</template>

<script>
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit'
import { getWebSSHUrl } from '@/api/ssh'
import { ElMessage } from 'element-ui'

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
      currentPrompt: '',
      isFullscreen: false
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
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff',
          cursor: '#ffffff'
        },
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
          this.updatePrompt(data)
        }
      })
    },

    async connectWebSocket() {
      try {
        const webSSHUrl = await getWebSSHUrl(this.host)
        this.websocket = new WebSocket(webSSHUrl)
        this.websocket.onopen = () => {
          this.isConnected = true
          this.reconnectAttempts = 0
        }
        this.websocket.onclose = () => {
          this.isConnected = false
          this.tryReconnect()
        }
        this.websocket.onerror = () => {
          this.isConnected = false
          this.tryReconnect()
        }
        this.websocket.onmessage = event => {
          this.terminal.write(event.data)
        }
      } catch (error) {
        ElMessage.error('连接 WebSocket 失败')
        this.tryReconnect()
      }
    },

    tryReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++
          this.connectWebSocket()
        }, 3000)
      } else {
        ElMessage.error('无法连接到 SSH 服务器')
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
      if (this.terminal) {
        this.terminal.dispose()
        this.terminal = null
      }
      if (this.websocket) {
        this.websocket.close()
        this.websocket = null
      }
      window.removeEventListener('resize', this.onResize)
    },

    sendCommand(command) {
      if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(command + '\n')
      }
    },

    updateHistoryCommands(data) {
      const trimmedData = data.trim()
      if (trimmedData && !this.historyCommands.includes(trimmedData)) {
        this.historyCommands.push(trimmedData)
      }
    },

    updatePrompt(data) {
      const promptIndex = data.lastIndexOf('\n')
      if (promptIndex !== -1) {
        this.currentPrompt = data.substring(promptIndex + 1)
      }
    },

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      if (this.isFullscreen) {
        this.$el.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
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
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;

    .el-button {
      margin-right: 10px;
    }
  }
}
</style>
