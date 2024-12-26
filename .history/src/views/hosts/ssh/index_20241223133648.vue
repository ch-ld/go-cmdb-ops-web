<!-- src/views/cmdb/ssh/index.vue -->
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

    <!-- 搜索和筛选区 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="主机组">
          <el-select
            v-model="listQuery.hostGroupId"
            placeholder="选择主机组"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="group in hostGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            >
              <span style="float: left">{{ group.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ group.hostCount }}台
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input
            v-model="listQuery.keyword"
            placeholder="主机名/IP"
            style="width: 200px;"
            clearable
            @keyup.enter.native="handleFilter"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.status" placeholder="主机状态" clearable style="width: 130px">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
          <el-button plain icon="el-icon-refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主机列表 -->
    <el-card class="table-container">
      <div slot="header" class="clearfix">
        <span class="card-title">主机列表</span>
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
        <el-table-column type="index" width="50" align="center" />
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
        <el-table-column label="主机组" prop="groupName" min-width="120" />
        <el-table-column label="IP地址" min-width="200">
          <template slot-scope="{row}">
            <div class="ip-container">
              <el-tag v-if="row.privateIp" size="small" type="info">
                内网: {{ row.privateIp }}
              </el-tag>
              <el-tag v-if="row.publicIp" size="small" type="warning">
                公网: {{ row.publicIp }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="SSH信息" min-width="180">
          <template slot-scope="{row}">
            <el-tag size="small">端口: {{ row.sshPort }}</el-tag>
            <el-tag size="small" type="success">用户: {{ row.sshUser }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280">
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
            <el-tooltip content="查看详情" placement="top">
              <el-button
                type="info"
                size="mini"
                icon="el-icon-info"
                circle
                @click="handleDetail(row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.pageSize"
        @pagination="getList"
      />
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
import Pagination from '@/components/Pagination'
import SshTerminal from './components/Terminal'
// import CountTo from 'vue-count-to'

export default {
  name: 'SshManagement',
  components: {
    Pagination,
    SshTerminal
    // CountTo
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
        pageSize: 10,
        hostGroupId: '',
        keyword: '',
        status: ''
      },
      terminalVisible: false,
      cmdVisible: false,
      fileVisible: false,
      currentHost: null,
      cmdForm: {
        command: ''
      },
      fileForm: {
        filename: '',
        content: ''
      },
      cmdLoading: false,
      fileLoading: false
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
        const { data } = await getHostGroups({ page: 1, pageSize: 100 })
        this.hostGroups = data.items
      } catch (error) {
        console.error('获取主机组失败:', error)
        this.$message.error('获取主机组失败')
      }
    },
    async getList() {
      try {
        this.listLoading = true
        const { data } = await getHosts(this.listQuery)
        this.list = data.items
        this.total = data.total
        this.listLoading = false
      } catch (error) {
        console.error('获取主机列表失败:', error)
        this.$message.error('获取主机列表失败')
        this.listLoading = false
      }
    },
    async getStatistics() {
      // 这里可以添加获取统计数据的接口
      this.statistics = {
        total: this.total,
        online: this.list.filter(host => host.status === 'online').length,
        groups: this.hostGroups.length,
        commands: 0 // 这个需要后端提供接口
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetFilter() {
      this.listQuery = {
        page: 1,
        pageSize: 10,
        hostGroupId: '',
        keyword: '',
        status: ''
      }
      this.getList()
    },
    handleOpenTerminal(row) {
      this.currentHost = row
      this.terminalVisible = true
    },
    handleCloseTerminal() {
      this.terminalVisible = false
      this.currentHost = null
    },
    handleCommand(row) {
      this.currentHost = row
      this.cmdVisible = true
    },
    handleFile(row) {
      this.currentHost = row
      this.fileVisible = true
    },
    handleDetail(row) {
      // 跳转到主机详情页
      this.$router.push(`/cmdb/host/detail/${row.id}`)
    },
    async submitCommand() {
      if (!this.cmdForm.command) {
        this.$message.warning('请输入要执行的命令')
        return
      }

      try {
        this.cmdLoading = true
        const params = {
          ip: this.currentHost.privateIp || this.currentHost.publicIp,
          port: this.currentHost.sshPort,
          username: this.currentHost.sshUser,
          authmodel: this.currentHost.sshAuthType,
          command: this.cmdForm.command
        }

        const { data } = await executeCommand(params)
        this.$notify({
          title: '命令执行成功',
          message: `输出结果：${data.output || '无输出'}`,
          type: 'success',
          duration: 5000
        })
        this.cmdVisible = false
        this.cmdForm.command = ''
      } catch (error) {
        this.$message.error('命令执行失败：' + (error.message || '未知错误'))
      } finally {
        this.cmdLoading = false
      }
    },
    async submitFile() {
      if (!this.fileForm.filename || !this.fileForm.content) {
        this.$message.warning('请填写完整的文件信息')
        return
      }

      try {
        this.fileLoading = true
        const params = {
          ip: this.currentHost.privateIp || this.currentHost.publicIp,
          port: this.currentHost.sshPort,
          username: this.currentHost.sshUser,
          authmodel: this.currentHost.sshAuthType,
          filename: this.fileForm.filename,
          content: this.fileForm.content
        }

        await createFile(params)
        this.$notify({
          title: '文件创建成功',
          message: `文件 ${this.fileForm.filename} 已创建`,
          type: 'success'
        })
        this.fileVisible = false
        this.fileForm.filename = ''
        this.fileForm.content = ''
      } catch (error) {
        this.$message.error('文件创建失败：' + (error.message || '未知错误'))
      } finally {
        this.fileLoading = false
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
      align-items: center;
    }
  }

  .table-container {
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
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }
}

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

.command-dialog, .file-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}
</style>
