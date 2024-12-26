<!-- src/views/cmdb/ssh/components/Terminal.vue -->
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
      isConnected: false
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
          background: '#1e1e1e'
        }
      })
      this.fitAddon = new FitAddon()
      this.terminal.loadAddon(this.fitAddon)
      this.terminal.open(this.$refs.terminal)
      this.fitAddon.fit()

      // 监听窗口大小变化
      window.addEventListener('resize', this.onResize)
    },
    connectWebSocket() {
      const params = {
        ip: this.host.privateIp || this.host.publicIp,
        port: this.host.sshPort,
        username: this.host.sshUser,
        password: this.host.sshPassword,
        authmodel: this.host.sshAuthType
      }

      const wsUrl = getWebSSHUrl(params)
      this.websocket = new WebSocket(wsUrl)

      this.websocket.onopen = () => {
        this.isConnected = true
        // 连接建立后再发送数据
        this.terminal.onData(data => {
          if (this.isConnected) {
            this.websocket.send(data)
          }
        })
      }

      this.websocket.onmessage = (event) => {
        this.terminal.write(event.data)
      }

      this.websocket.onerror = (event) => {
        console.error('WebSocket error:', event)
        this.$message.error('WebSocket 连接发生错误')
      }

      this.websocket.onclose = (event) => {
        console.error('WebSocket closed:', event)
        this.isConnected = false
        this.$message.warning('SSH 连接已断开')
      }
    },
    onResize() {
      this.fitAddon.fit()
    },
    destroyTerminal() {
      window.removeEventListener('resize', this.onResize)
      if (this.websocket) {
        this.websocket.close()
      }
      if (this.terminal) {
        this.terminal.dispose()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ssh-terminal {
  height: 500px;
  background: #1e1e1e;
  padding: 10px;
  border-radius: 4px;

  .terminal-container {
    height: 100%;
  }
}
</style>
