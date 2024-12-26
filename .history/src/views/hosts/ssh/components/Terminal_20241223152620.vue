<template>
  <div class="ssh-terminal">
    <div ref="terminal" class="terminal-container" />
  </div>
</template>

<script>
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit'
import { getWebSSHUrl } from '@/api/ssh'

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
      maxReconnectAttempts: 3
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
      // 初始化终端配置
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

      // 添加 FitAddon
      this.fitAddon = new FitAddon()
      this.terminal.loadAddon(this.fitAddon)

      // 打开终端
      this.terminal.open(this.$refs.terminal)

      // 适应容器大小
      this.$nextTick(() => {
        this.fitAddon.fit()
      })

      // 监听窗口大小变化
      window.addEventListener('resize', this.onResize)
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
              this.websocket.send(JSON.stringify({ type: 'input', data }))
            }
          })
        }

        // 接收消息处理
        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'output') {
              this.terminal.write(data.data)
            }
          } catch (e) {
            // 如果不是 JSON 格式，直接写入终端
            this.terminal.write(event.data)
          }
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
        this.$message.error('连接SSH服务器失败')
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
        this.$message.error('连接失败，请检查网络或重新打开终端')
      }
    },

    onResize() {
      if (this.fitAddon) {
        this.fitAddon.fit()
        // 发送新的终端大小到服务器
        if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
          // const dimensions = this.terminal.rows + ',' + this.terminal.cols
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

    // 确保 xterm.js 终端正确填充容器
    :deep(.xterm) {
      height: 100%;

      .xterm-viewport {
        overflow-y: auto;
      }
    }
  }
}
</style>
