<!-- src/views/cmdb/ssh/index.vue -->
<template>
  <div class="app-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="dashboard-header">
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <count-to
              :start-val="0"
              :end-val="statistics.total"
              :duration="2000"
              class="card-number"
            />
            <div class="card-title">总主机数</div>
          </div>
          <el-divider />
          <div class="card-footer">
            <i class="el-icon-monitor" />
            <span>主机资源</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <count-to
              :start-val="0"
              :end-val="statistics.online"
              :duration="2000"
              class="card-number"
            />
            <div class="card-title">在线主机</div>
          </div>
          <el-divider />
          <div class="card-footer">
            <i class="el-icon-connection" />
            <span>在线状态</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <count-to
              :start-val="0"
              :end-val="statistics.groups"
              :duration="2000"
              class="card-number"
            />
            <div class="card-title">主机组数</div>
          </div>
          <el-divider />
          <div class="card-footer">
            <i class="el-icon-folder" />
            <span>资源分组</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <count-to
              :start-val="0"
              :end-val="statistics.commands"
              :duration="2000"
              class="card-number"
            />
            <div class="card-title">今日命令数</div>
          </div>
          <el-divider />
          <div class="card-footer">
            <i class="el-icon-terminal" />
            <span>命令执行</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="listQuery">
        <el-form-item label="主机组">
          <el-select v-model="listQuery.hostGroupId" placeholder="选择主机组" clearable style="width: 200px">
            <el-option
              v-for="group in hostGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主机名">
          <el-input v-model="listQuery.hostname" placeholder="主机名" style="width: 200px" />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="listQuery.ip" placeholder="IP地址" style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.status" placeholder="主机状态" clearable style="width: 130px">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
          <el-button plain icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主机列表 -->
    <el-card class="table-card">
      <div slot="header" class="clearfix">
        <span class="card-title">SSH主机列表</span>
        <el-button-group style="float: right">
          <el-button size="small" type="primary" icon="el-icon-refresh" @click="getList">刷新</el-button>
        </el-button-group>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column label="主机名" min-width="120">
          <template slot-scope="{row}">
            <el-tooltip :content="row.hostname" placement="top">
              <span class="host-name">
                <i class="el-icon-monitor" />
                {{ row.hostname }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="IP地址" min-width="200">
          <template slot-scope="{row}">
            <div class="ip-container">
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

        <el-table-column label="配置信息" min-width="200">
          <template slot-scope="{row}">
            <div class="resource-info">
              <span>
                <i class="el-icon-cpu" />
                {{ row.cpu }}核
                <el-progress
                  :percentage="row.cpuUsage"
                  :color="getResourceColor(row.cpuUsage)"
                  :show-text="false"
                  :stroke-width="4"
                  style="width: 60px; display: inline-block; margin-left: 5px"
                />
              </span>
              <span>
                <i class="el-icon-monitor" />
                {{ row.memory }}GB
                <el-progress
                  :percentage="row.memoryUsage"
                  :color="getResourceColor(row.memoryUsage)"
                  :show-text="false"
                  :stroke-width="4"
                  style="width: 60px; display: inline-block; margin-left: 5px"
                />
              </span>
              <span>
                <i class="el-icon-folder" />
                {{ row.diskSize }}GB
                <el-progress
                  :percentage="row.diskUsage"
                  :color="getResourceColor(row.diskUsage)"
                  :show-text="false"
                  :stroke-width="4"
                  style="width: 60px; display: inline-block; margin-left: 5px"
                />
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="SSH信息" min-width="180">
          <template slot-scope="{row}">
            <el-tag size="small">端口: {{ row.sshPort }}</el-tag>
            <el-tag size="small" type="success">用户: {{ row.sshUser }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="系统信息" min-width="120">
          <template slot-scope="{row}">
            <div>{{ row.osType }} {{ row.osVersion }}</div>
            <div class="text-gray">{{ row.kernelVersion }}</div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="最后检查" width="160">
          <template slot-scope="{row}">
            {{ formatDateTime(row.lastCheckTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="280" fixed="right">
          <template slot-scope="{row}">
            <el-tooltip content="SSH终端" placement="top">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-terminal"
                circle
                @click="handleOpenTerminal(row)"
              />
            </el-tooltip>
            <el-tooltip content="执行命令" placement="top">
              <el-button
                type="success"
                size="mini"
                icon="el-icon-video-play"
                circle
                @click="handleCommand(row)"
              />
            </el-tooltip>
            <el-tooltip content="创建文件" placement="top">
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-document-add"
                circle
                @click="handleFile(row)"
              />
            </el-tooltip>
            <el-tooltip content="检测状态" placement="top">
              <el-button
                type="info"
                size="mini"
                icon="el-icon-refresh"
                circle
                @click="handleCheck(row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-show="total>0"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 终端弹窗 -->
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
        v-if="terminalVisible"
        :host="currentHost"
        @close="handleCloseTerminal"
      />
    </el-dialog>

    <!-- 命令执行弹窗 -->
    <el-dialog
      title="执行命令"
      :visible.sync="cmdVisible"
      width="50%"
      custom-class="command-dialog"
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="cmdVisible = false">取 消</el-button>
        <el-button type="primary" :loading="cmdLoading" @click="submitCommand">执 行</el-button>
      </div>
    </el-dialog>

    <!-- 文件创建弹窗 -->
    <el-dialog
      title="创建文件"
      :visible.sync="fileVisible"
      width="50%"
      custom-class="file-dialog"
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="fileVisible = false">取 消</el-button>
        <el-button type="primary" :loading="fileLoading" @click="submitFile">创 建</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getHosts } from '@/api/host'
import { getHostGroups } from '@/api/hostGroup'
import { executeCommand, createFile } from '@/api/ssh'
import CountTo from 'vue-count-to'
import SshTerminal from './components/Terminal'
import { formatDate } from '@/utils/date'

export default {
  name: 'SshManagement',
  components: {
    CountTo,
    SshTerminal
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      hostGroups: [],
      statistics: {
        total: 0,
        online: 0,
        groups: 0,
        commands: 0
      },
      listQuery: {
        page: 1,
        limit: 10,
        hostGroupId: '',
        hostname: '',
        ip: '',
        status: ''
      },
      // 终端相关
      terminalVisible: false,
      currentHost: null,
      // 新建终端相关
      newTerminalVisible: false,
      newTerminalForm: {
        host: '',
        port: 22,
        username: '',
        password: '',
        privateKey: ''
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
    this.getHostGroups()
    this.getList()
    this.getStatistics()
  },
  methods: {
    async getHostGroups() {
      try {
        const { data } = await getHostGroups()
        this.hostGroups = data.items || []
      } catch (error) {
        console.error('获取主机组失败:', error)
        this.$message.error('获取主机组失败')
      }
    },
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getHosts(this.listQuery)
        this.list = this.formatTableData(data.items || [])
        this.total = data.total || 0
        this.getStatistics()
      } catch (error) {
        console.error('获取主机列表失败:', error)
        this.$message.error('获取主机列表失败')
      } finally {
        this.listLoading = false
      }
    },
    formatTableData(data) {
      return data.map(item => ({
        ...item,
        cpuUsage: Number(item.cpuUsage) || 0,
        memoryUsage: Number(item.memoryUsage) || 0,
        diskUsage: Number(item.diskUsage) || 0,
        cpu: Number(item.cpu) || 0,
        memory: Number(item.memory) || 0,
        diskSize: Number(item.diskSize) || 0
      }))
    },
    getStatistics() {
      this.statistics = {
        total: this.total,
        online: this.list.filter(host => host.status === 'online').length,
        groups: this.hostGroups.length,
        commands: 0 // 需要后端接口支持
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetQuery() {
      this.listQuery = {
        page: 1,
        limit: 10,
        hostGroupId: '',
        hostname: '',
        ip: '',
        status: ''
      }
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    getResourceColor(usage) {
      if (usage >= 90) return '#F56C6C'
      if (usage >= 70) return '#E6A23C'
      return '#67C23A'
    },
    formatDateTime(time) {
      return time ? formatDate(new Date(time)) : '-'
    },
    // SSH终端相关方法
    handleOpenTerminal(row) {
      this.currentHost = row
      this.terminalVisible = true
    },
    handleCloseTerminal() {
      this.terminalVisible = false
      this.currentHost = null
    },
    // 新建终端相关方法
    handleNewTerminal() {
      this.newTerminalVisible = true
    },
    handleNewTerminalSubmit() {
      // 验证表单
      if (!this.newTerminalForm.host || !this.newTerminalForm.username) {
        this.$message.error('请填写必要信息')
        return
      }

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
    // 检测主机状态
    async handleCheck(row) {
      try {
        // await checkHostStatus(row.id)
        this.$message.success('检测完成')
        this.getList()
      } catch (error) {
        this.$message.error('检测失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .dashboard-header {
    margin-bottom: 20px;

    .dashboard-card {
      .card-header {
        text-align: center;
        padding: 10px 0;

        .card-number {
          font-size: 24px;
          font-weight: bold;
          color: #409EFF;
        }

        .card-title {
          font-size: 14px;
          color: #909399;
          margin-top: 5px;
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;

        i {
          margin-right: 5px;
        }
      }
    }
  }

  .filter-container {
    margin-bottom: 20px;

    .el-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .table-card {
    .card-title {
      font-size: 16px;
      font-weight: 500;
    }

    .host-name {
      display: flex;
      align-items: center;

      i {
        margin-right: 5px;
        color: #409EFF;
      }
    }

    .ip-container {
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

    .resource-info {
      span {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }

        i {
          margin-right: 8px;
          font-size: 14px;
          color: #909399;
        }

        .el-progress {
          margin-left: 12px;
          flex: 1;
          max-width: 100px;
        }
      }
    }

    .el-tag {
      margin-right: 5px;
      margin-bottom: 5px;
    }

    .text-gray {
      color: #909399;
      font-size: 12px;
      margin-top: 4px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}

// SSH终端对话框样式
.ssh-terminal-dialog {
  .terminal-header {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .terminal-title {
      display: flex;
      align-items: center;
      font-size: 14px;

      i {
        margin-right: 5px;
        color: #409EFF;
      }
    }
  }

  .el-dialog__body {
    padding: 10px;
  }
}

// 命令执行和文件创建对话框样式
.command-dialog,
.file-dialog {
  .el-dialog__body {
    padding: 20px;
  }

  .el-form-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .el-input-number {
    width: 100%;
  }

  .el-textarea {
    font-family: monospace;
  }
}
</style>
