<!-- src/views/cmdb/ssh/index.vue -->
<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.hostname"
        placeholder="主机名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.ip"
        placeholder="IP地址"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <!-- 主机列表 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="主机名" prop="hostname" align="center" />
      <el-table-column label="私有IP" prop="privateIp" align="center" />
      <el-table-column label="公网IP" prop="publicIp" align="center" />
      <el-table-column label="SSH端口" prop="sshPort" align="center" width="100" />
      <el-table-column label="SSH用户" prop="sshUser" align="center" width="100" />
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
            {{ row.status === 'online' ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300">
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-terminal"
            @click="handleOpenTerminal(row)"
          >
            终端
          </el-button>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-video-play"
            @click="handleCommand(row)"
          >
            执行命令
          </el-button>
          <el-button
            type="warning"
            size="mini"
            icon="el-icon-document-add"
            @click="handleFile(row)"
          >
            创建文件
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 终端弹窗 -->
    <el-dialog
      title="SSH终端"
      :visible.sync="terminalVisible"
      width="80%"
      :before-close="handleCloseTerminal"
      custom-class="ssh-terminal-dialog"
    >
      <ssh-terminal
        v-if="terminalVisible"
        :host="currentHost"
        @close="handleCloseTerminal"
      />
    </el-dialog>

    <!-- 命令执行弹窗 -->
    <el-dialog title="执行命令" :visible.sync="cmdVisible" width="50%">
      <el-form :model="cmdForm" label-width="80px">
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
        <el-button type="primary" @click="submitCommand">执 行</el-button>
      </div>
    </el-dialog>

    <!-- 文件创建弹窗 -->
    <el-dialog title="创建文件" :visible.sync="fileVisible" width="50%">
      <el-form :model="fileForm" label-width="80px">
        <el-form-item label="文件名">
          <el-input v-model="fileForm.filename" placeholder="请输入文件名" />
        </el-form-item>
        <el-form-item label="文件内容">
          <el-input
            v-model="fileForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入文件内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fileVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitFile">创 建</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getHosts } from '@/api/host'
import { executeCommand, createFile } from '@/api/ssh'
import Pagination from '@/components/Pagination'
import SshTerminal from './components/Terminal'

export default {
  name: 'SshManagement',
  components: {
    Pagination,
    SshTerminal
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        hostname: '',
        ip: ''
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
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
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
      }
    },
    handleFilter() {
      this.listQuery.page = 1
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
    async submitCommand() {
      if (!this.cmdForm.command) {
        this.$message.warning('请输入要执行的命令')
        return
      }

      try {
        const params = {
          ip: this.currentHost.privateIp || this.currentHost.publicIp,
          port: this.currentHost.sshPort,
          username: this.currentHost.sshUser,
          authmodel: this.currentHost.sshAuthType,
          command: this.cmdForm.command
        }

        await executeCommand(params)
        this.$message.success('命令执行成功')
        this.cmdVisible = false
        this.cmdForm.command = ''
      } catch (error) {
        this.$message.error('命令执行失败')
      }
    },
    async submitFile() {
      if (!this.fileForm.filename || !this.fileForm.content) {
        this.$message.warning('请填写完整的文件信息')
        return
      }

      try {
        const params = {
          ip: this.currentHost.privateIp || this.currentHost.publicIp,
          port: this.currentHost.sshPort,
          username: this.currentHost.sshUser,
          authmodel: this.currentHost.sshAuthType,
          filename: this.fileForm.filename,
          content: this.fileForm.content
        }

        await createFile(params)
        this.$message.success('文件创建成功')
        this.fileVisible = false
        this.fileForm.filename = ''
        this.fileForm.content = ''
      } catch (error) {
        this.$message.error('文件创建失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
  .filter-item {
    margin-right: 10px;
  }
}

.ssh-terminal-dialog {
  .el-dialog__body {
    padding: 10px;
  }
}
</style>
