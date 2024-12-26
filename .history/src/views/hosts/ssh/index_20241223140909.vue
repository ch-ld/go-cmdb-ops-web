<template>
  <div class="ssh-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">SSH终端管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>运维工具</el-breadcrumb-item>
        <el-breadcrumb-item>SSH终端</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 搜索和过滤区域 -->
    <el-card class="search-card">
      <el-form ref="searchForm" :inline="true" :model="searchForm">
        <el-form-item label="主机组">
          <el-select v-model="searchForm.hostGroupId" placeholder="请选择主机组" clearable>
            <el-option
              v-for="group in hostGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="主机名/IP"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="主机状态" clearable>
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主机列表 -->
    <el-card class="table-card">
      <div slot="header" class="clearfix">
        <span class="card-title">SSH主机列表</span>
        <el-button-group style="float: right">
          <el-button
            size="small"
            type="success"
            icon="el-icon-plus"
            @click="handleNewTerminal"
          >
            新建终端
          </el-button>
          <el-button
            size="small"
            type="primary"
            icon="el-icon-refresh"
            @click="fetchHosts"
          >
            刷新
          </el-button>
        </el-button-group>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="主机名" prop="hostname" min-width="120">
          <template slot-scope="{ row }">
            <el-link type="primary" @click="handleOpenTerminal(row)">
              {{ row.hostname }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="IP地址" min-width="200">
          <template slot-scope="{ row }">
            <div class="ip-info">
              <div v-if="row.privateIp" class="ip-item">
                <i class="el-icon-office-building" />
                <span class="ip-text">{{ row.privateIp }}</span>
              </div>
              <div v-if="row.publicIp" class="ip-item">
                <i class="el-icon-connection" />
                <span class="ip-text">{{ row.publicIp }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="SSH信息" min-width="180">
          <template slot-scope="{ row }">
            <el-tag size="small">端口: {{ row.sshPort }}</el-tag>
            <el-tag size="small" type="success">用户: {{ row.sshUser }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="主机组" min-width="120">
          <template slot-scope="{ row }">
            {{ formatHostGroupName(row) }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="{ row }">
            <el-button-group>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-terminal"
                @click="handleOpenTerminal(row)"
              >
                终端
              </el-button>
              <el-button
                size="mini"
                type="success"
                icon="el-icon-video-play"
                @click="handleCommand(row)"
              >
                命令
              </el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-document"
                @click="handleFile(row)"
              >
                文件
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- SSH终端对话框 -->
    <el-dialog
      title="SSH终端"
      :visible.sync="terminalVisible"
      width="85%"
      :before-close="handleCloseTerminal"
      custom-class="ssh-terminal-dialog"
      top="5vh"
    >
      <div class="terminal-header">
        <span class="terminal-title">
          <i class="el-icon-monitor" />
          {{ currentHost ? currentHost.hostname : '' }}
          <el-tag size="small" type="success" style="margin-left: 10px">
            {{ currentHost ? (currentHost.privateIp || currentHost.publicIp) : '' }}
          </el-tag>
        </span>
      </div>
      <ssh-terminal
        v-if="terminalVisible && currentHost"
        :host="currentHost"
        :websocket-url="getWebSocketUrl(currentHost)"
        @close="handleCloseTerminal"
      />
    </el-dialog>

    <!-- 新建终端对话框 -->
    <el-dialog
      title="新建终端连接"
      :visible.sync="newTerminalVisible"
      width="500px"
      @close="resetNewTerminalForm"
    >
      <el-form
        ref="newTerminalForm"
        :model="newTerminalForm"
        :rules="newTerminalRules"
        label-width="100px"
      >
        <el-form-item label="主机地址" prop="host">
          <el-input v-model="newTerminalForm.host" placeholder="请输入主机IP或域名" />
        </el-form-item>
        <el-form-item label="SSH端口" prop="port">
          <el-input-number
            v-model="newTerminalForm.port"
            :min="1"
            :max="65535"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newTerminalForm.username" placeholder="请输入SSH用户名" />
        </el-form-item>
        <el-form-item label="认证方式" prop="authType">
          <el-radio-group v-model="newTerminalForm.authType">
            <el-radio label="password">密码认证</el-radio>
            <el-radio label="key">密钥认证</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="newTerminalForm.authType === 'password'"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="newTerminalForm.password"
            type="password"
            show-password
            placeholder="请输入SSH密码"
          />
        </el-form-item>
        <el-form-item
          v-if="newTerminalForm.authType === 'key'"
          label="私钥"
          prop="privateKey"
        >
          <el-input
            v-model="newTerminalForm.privateKey"
            type="textarea"
            :rows="4"
            placeholder="请输入SSH私钥内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="newTerminalVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="connecting"
          @click="handleNewTerminalSubmit"
        >
          连 接
        </el-button>
      </div>
    </el-dialog>

    <!-- 命令执行对话框 -->
    <el-dialog
      title="执行命令"
      :visible.sync="cmdVisible"
      width="50%"
    >
      <el-form :model="cmdForm" label-width="80px">
        <el-form-item label="目标主机">
          <el-tag>{{ currentHost ? currentHost.hostname : '' }}</el-tag>
        </el-form-item>
        <el-form-item label="命令">
          <el-input
            v-model="cmdForm.command"
            type="textarea"
            :rows="3"
            placeholder="请输入要执行的命令"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="cmdVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="cmdLoading"
          @click="submitCommand"
        >
          执 行
        </el-button>
      </div>
    </el-dialog>

    <!-- 文件创建对话框 -->
    <el-dialog
      title="创建文件"
      :visible.sync="fileVisible"
      width="50%"
    >
      <el-form :model="fileForm" label-width="80px">
        <el-form-item label="目标主机">
          <el-tag>{{ currentHost ? currentHost.hostname : '' }}</el-tag>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input v-model="fileForm.filename" placeholder="请输入文件名">
            <template slot="prepend">/</template>
          </el-input>
        </el-form-item>
        <el-form-item label="文件内容">
          <el-input
            v-model="fileForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入文件内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="fileVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="fileLoading"
          @click="submitFile"
        >
          创 建
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getHosts } from '@/api/host'
import { getHostGroups } from '@/api/hostGroup'
import { executeCommand, createFile, getWebSSHUrl } from '@/api/ssh'
import SshTerminal from './components/Terminal'

export default {
  name: 'SshManager',
  components: {
    SshTerminal
  },
  data() {
    return {
      // 主机组相关
      hostGroups: [],
      // 搜索表单
      searchForm: {
        hostGroupId: '',
        keyword: '',
        status: ''
      },
      // 表格数据
      loading: false,
      tableData: [],
      page: 1,
      pageSize: 10,
      total: 0,

      // 终端相关
      terminalVisible: false,
      currentHost: null,
      connecting: false,

      // 新建终端相关
      newTerminalVisible: false,
      newTerminalForm: {
        host: '',
        port: 22,
        username: 'root',
        authType: 'password',
        password: '',
        privateKey: ''
      },
      newTerminalRules: {
        host: [
          { required: true, message: '请输入主机地址', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入SSH端口', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        privateKey: [
          { required: true, message: '请输入私钥', trigger: 'blur' }
        ]
      },

      // 命令执行相关
      cmdVisible: false,
      cmdLoading: false,
      cmdForm: {
        command: ''
      },

      // 文件创建相关
      fileVisible: false,
      fileLoading: false,
      fileForm: {
        filename: '',
        content: ''
      }
    }
  },
  created() {
    this.fetchHostGroups()
    this.fetchHosts()
  },
  methods: {
    // 获取WebSocket URL
    // 获取WebSocket URL
    getWebSocketUrl(host) {
      const params = {
        id: host.id,
        hostname: host.hostname,
        port: host.sshPort,
        username: host.sshUser
      }
      return getWebSSHUrl(params)
    },

    // 获取主机组列表
    async fetchHostGroups() {
      try {
        const { data } = await getHostGroups()
        this.hostGroups = data.items || []
      } catch (error) {
        this.$message.error('获取主机组失败')
      }
    },

    // 获取主机列表
    async fetchHosts() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          page: this.page,
          pageSize: this.pageSize
        }
        const { data } = await getHosts(params)
        this.tableData = data.items || []
        this.total = data.total || 0
      } catch (error) {
        this.$message.error('获取主机列表失败')
      } finally {
        this.loading = false
      }
    },

    // 格式化主机组名称
    formatHostGroupName(row) {
      if (!row.hostGroupId) return '-'
      const group = this.hostGroups.find(g => g.id === row.hostGroupId)
      return group ? group.name : '-'
    },

    // 处理搜索
    handleSearch() {
      this.page = 1
      this.fetchHosts()
    },

    // 重置搜索
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.handleSearch()
    },

    // 处理分页
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchHosts()
    },
    handleCurrentChange(val) {
      this.page = val
      this.fetchHosts()
    },

    // 新建终端相关方法
    handleNewTerminal() {
      this.newTerminalVisible = true
    },
    resetNewTerminalForm() {
      if (this.$refs.newTerminalForm) {
        this.$refs.newTerminalForm.resetFields()
      }
      this.newTerminalForm = {
        host: '',
        port: 22,
        username: 'root',
        authType: 'password',
        password: '',
        privateKey: ''
      }
    },
    async handleNewTerminalSubmit() {
      this.$refs.newTerminalForm.validate(async valid => {
        if (!valid) return

        this.connecting = true
        try {
          // 创建新的终端连接
          this.currentHost = {
            hostname: this.newTerminalForm.host,
            sshPort: this.newTerminalForm.port,
            sshUser: this.newTerminalForm.username,
            sshPassword: this.newTerminalForm.password,
            sshKey: this.newTerminalForm.privateKey
          }
          this.newTerminalVisible = false
          this.terminalVisible = true
        } catch (error) {
          this.$message.error('连接失败: ' + error.message)
        } finally {
          this.connecting = false
        }
      })
    },

    // 终端相关方法
    handleOpenTerminal(row) {
      this.currentHost = row
      this.terminalVisible = true
    },
    handleCloseTerminal() {
      this.terminalVisible = false
      this.currentHost = null
    },

    // 命令执行相关方法
    handleCommand(row) {
      this.currentHost = row
      this.cmdVisible = true
    },
    async submitCommand() {
      if (!this.cmdForm.command) {
        this.$message.error('请输入要执行的命令')
        return
      }

      this.cmdLoading = true
      try {
        await executeCommand({
          hostId: this.currentHost.id,
          command: this.cmdForm.command
        })
        this.$message.success('命令执行成功')
        this.cmdVisible = false
      } catch (error) {
        this.$message.error('命令执行失败')
      } finally {
        this.cmdLoading = false
      }
    },

    // 文件创建相关方法
    handleFile(row) {
      this.currentHost = row
      this.fileVisible = true
    },
    async submitFile() {
      if (!this.fileForm.filename || !this.fileForm.content) {
        this.$message.error('请填写完整信息')
        return
      }

      this.fileLoading = true
      try {
        await createFile({
          hostId: this.currentHost.id,
          filename: this.fileForm.filename,
          content: this.fileForm.content
        })
        this.$message.success('文件创建成功')
        this.fileVisible = false
      } catch (error) {
        this.$message.error('文件创建失败')
      } finally {
        this.fileLoading = false
      }
    },

    // 工具方法
    getStatusType(status) {
      const map = {
        online: 'success',
        offline: 'danger',
        unknown: 'info'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        online: '在线',
        offline: '离线',
        unknown: '未知'
      }
      return map[status] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.ssh-manager {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      margin: 0 0 10px;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .ip-info {
      .ip-item {
        display: flex;
        align-items: center;
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        i {
          margin-right: 8px;
          font-size: 14px;
          color: #909399;
        }

        .ip-text {
          color: #606266;
        }
      }
    }
  }

  .terminal-header {
    padding: 10px;
    background: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    margin-bottom: 10px;

    .terminal-title {
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }

  .ssh-terminal-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>

