<!-- views/host/index.vue -->
<template>
  <div class="host-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">主机管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>主机管理</el-breadcrumb-item>
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
            <el-option label="未知" value="unknown" />
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

    <!-- 操作按钮区 -->
    <div class="table-operations">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
        新增主机
      </el-button>
      <el-button type="success" icon="el-icon-upload2" @click="handleImport">
        导入主机
      </el-button>
      <el-button type="warning" icon="el-icon-refresh" @click="handleSync">
        同步云主机
      </el-button>
      <el-button
        type="danger"
        icon="el-icon-delete"
        :disabled="!selectedHosts.length"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </div>

    <!-- 主机列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="主机名" prop="hostname" min-width="120">
          <template slot-scope="{ row }">
            <el-link type="primary" @click="handleDetail(row)">
              {{ row.hostname }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="IP地址" min-width="200">
          <template slot-scope="{ row }">
            <div class="ip-info">
              <span v-if="row.privateIP">
                <i class="el-icon-office-building" /> {{ row.privateIP }}
              </span>
              <span v-if="row.publicIP">
                <i class="el-icon-connection" /> {{ row.publicIP }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="配置信息" min-width="280">
          <template slot-scope="{ row }">
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
        <el-table-column label="系统信息" min-width="150">
          <template slot-scope="{ row }">
            <div>{{ row.osType }} {{ row.osVersion }}</div>
            <div class="text-gray">{{ row.kernelVersion }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="主机组" prop="hostGroup.name" min-width="120" />
        <el-table-column
          label="最后检查时间"
          prop="lastCheckTime"
          width="180"
          :formatter="formatDate"
        />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="{ row }">
            <el-button-group>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="success"
                icon="el-icon-refresh"
                @click="handleCheck(row)"
              >
                检测
              </el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(row)"
              >
                删除
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

    <!-- 新增/编辑主机对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="650px"
      @close="resetForm"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主机组" prop="hostGroupId">
              <el-select
                v-model="form.hostGroupId"
                placeholder="请选择主机组"
                style="width: 100%"
              >
                <el-option
                  v-for="group in hostGroups"
                  :key="group.id"
                  :label="group.name"
                  :value="group.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主机名" prop="hostname">
              <el-input v-model="form.hostname" placeholder="请输入主机名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="内网IP" prop="privateIP">
              <el-input v-model="form.privateIP" placeholder="请输入内网IP" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公网IP" prop="publicIP">
              <el-input v-model="form.publicIP" placeholder="请输入公网IP" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SSH端口" prop="sshPort">
              <el-input-number
                v-model="form.sshPort"
                :min="1"
                :max="65535"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SSH用户" prop="sshUser">
              <el-input v-model="form.sshUser" placeholder="请输入SSH用户名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="认证方式" prop="sshAuthType">
          <el-radio-group v-model="form.sshAuthType">
            <el-radio label="password">密码认证</el-radio>
            <el-radio label="key">密钥认证</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="form.sshAuthType === 'password'"
          label="SSH密码"
          prop="sshPassword"
        >
          <el-input
            v-model="form.sshPassword"
            type="password"
            placeholder="请输入SSH密码"
            show-password
          />
        </el-form-item>

        <el-form-item
          v-if="form.sshAuthType === 'key'"
          label="SSH密钥"
          prop="sshKey"
        >
          <el-input
            v-model="form.sshKey"
            type="textarea"
            :rows="4"
            placeholder="请输入SSH私钥"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="操作系统" prop="osType">
              <el-select v-model="form.osType" style="width: 100%">
                <el-option label="Linux" value="Linux" />
                <el-option label="Windows" value="Windows" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统版本" prop="osVersion">
              <el-input
                v-model="form.osVersion"
                placeholder="请输入操作系统版本"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标签" prop="tags">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            style="margin-right: 10px"
            @close="handleRemoveTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInput"
            v-model="tagInputValue"
            size="small"
            style="width: 100px"
            @keyup.enter.native="handleAddTag"
            @blur="handleAddTag"
          />
          <el-button v-else size="small" @click="showTagInput">
            + 新增标签
          </el-button>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确 定
        </el-button>
      </div>
    </el-dialog>

    <!-- 导入主机对话框 -->
    <el-dialog title="导入主机" :visible.sync="importVisible" width="500px">
      <el-upload
        class="upload-demo"
        drag
        action="/api/v1/hosts/import"
        :headers="uploadHeaders"
        :before-upload="beforeUpload"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          只能上传xlsx/csv文件，且不超过10MB
        </div>
      </el-upload>
      <div class="import-template" style="margin-top: 20px">
        <el-button type="text" @click="downloadTemplate">
          <i class="el-icon-download" /> 下载导入模板
        </el-button>
      </div>
    </el-dialog>

    <!-- 同步云主机对话框 -->
    <el-dialog
      title="同步云主机"
      :visible.sync="syncVisible"
      width="500px"
    >
      <el-form ref="syncForm" :model="syncForm" label-width="100px">
        <el-form-item label="云服务商" prop="provider">
          <el-select v-model="syncForm.provider" style="width: 100%">
            <el-option label="阿里云" value="aliyun" />
            <el-option label="AWS" value="aws" />
          </el-select>
        </el-form-item>
        <el-form-item label="主机组" prop="hostGroupId">
          <el-select v-model="syncForm.hostGroupId" style="width: 100%">
            <el-option
              v-for="group in hostGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="AccessKey"
          prop="accessKey"
        >
          <el-input v-model="syncForm.accessKey" />
        </el-form-item>
        <el-form-item
          label="AccessSecret"
          prop="accessSecret"
        >
          <el-input v-model="syncForm.accessSecret" type="password" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="syncVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="syncing"
          @click="handleSyncSubmit"
        >
          开始同步
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getHostGroups } from '@/api/hostGroup'
import {
  getHosts,
  createHost,
  updateHost,
  deleteHost,
  batchDeleteHosts,
  checkHost,
  syncCloudHosts,
  downloadTemplate
} from '@/api/host'
import { formatDate } from '@/utils/date'

export default {
  name: 'HostManager',
  data() {
    return {
      // 主机组相关
      hostGroups: [],
      hostGroupsLoading: false,
      hostGroupsQuery: {
        page: 1,
        pageSize: 100 // 获取较多的主机组数据用于选择
      },
      // 搜索表单
      searchForm: {
        hostGroupId: '',
        keyword: '',
        status: ''
      },
      // 表格数据
      loading: false,
      tableData: [],
      selectedHosts: [],
      page: 1,
      pageSize: 10,
      total: 0,
      // 对话框控制
      dialogVisible: false,
      dialogTitle: '新增主机',
      importVisible: false,
      syncVisible: false,
      // 表单数据
      form: this.getInitialForm(),
      syncForm: {
        provider: [
          { required: true, message: '请选择云服务商', trigger: 'change' }
        ],
        hostGroupId: [
          { required: true, message: '请选择主机组', trigger: 'change' }
        ],
        accessKey: [
          { required: true, message: '请输入AccessKey', trigger: 'blur' }
        ],
        accessSecret: [
          { required: true, message: '请输入AccessSecret', trigger: 'blur' }
        ]
      },
      // 标签输入
      tagInputVisible: false,
      tagInputValue: '',
      // 状态控制
      submitting: false,
      syncing: false,
      // 表单校验规则
      rules: {
        hostGroupId: [
          { required: true, message: '请选择主机组', trigger: 'change' }
        ],
        hostname: [
          { required: true, message: '请输入主机名', trigger: 'blur' }
        ],
        privateIP: [
          { required: true, message: '请输入内网IP', trigger: 'blur' },
          { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'IP格式不正确' }
        ],
        publicIP: [
          { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'IP格式不正确' }
        ],
        sshPort: [
          { required: true, message: '请输入SSH端口', trigger: 'blur' }
        ],
        sshUser: [
          { required: true, message: '请输入SSH用户名', trigger: 'blur' }
        ],
        sshAuthType: [
          { required: true, message: '请选择认证方式', trigger: 'change' }
        ],
        sshPassword: [
          { required: true, message: '请输入SSH密码', trigger: 'blur' }
        ],
        sshKey: [
          { required: true, message: '请输入SSH密钥', trigger: 'blur' }
        ],
        osType: [
          { required: true, message: '请选择操作系统', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchHostGroups()
    this.fetchHosts()
  },
  methods: {
  // 初始化表单数据
    getInitialForm() {
      return {
        id: '',
        hostGroupId: undefined,
        hostname: '',
        privateIP: '',
        publicIP: '',
        sshPort: 22,
        sshUser: 'root',
        sshAuthType: 'password',
        sshPassword: '',
        sshKey: '',
        osType: 'Linux',
        osVersion: '',
        tags: [],
        description: ''
      }
    },
    // 获取主机组列表
    async fetchHostGroups() {
      this.hostGroupsLoading = true
      try {
        const { data } = await getHostGroups(this.hostGroupsQuery)
        this.hostGroups = data.items || []
      } catch (error) {
        this.$message.error('获取主机组列表失败')
      } finally {
        this.hostGroupsLoading = false
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
        this.tableData = data.data.list
        this.total = data.data.total
      } catch (error) {
        this.$message.error('获取主机列表失败')
      } finally {
        this.loading = false
      }
    },
    // 格式化标签
    formatTags(tags) {
      if (!tags) return []
      return typeof tags === 'string' ? tags.split(',') : tags
    },
    // 格式化主机组名称
    formatHostGroupName(row) {
      if (!row.hostGroupId) return '-'
      const group = this.hostGroups.find(g => g.id === row.hostGroupId)
      return group ? group.name : '-'
    },

    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '编辑主机'
      this.form = {
        ...row,
        tags: this.formatTags(row.tags)
      }
      this.dialogVisible = true
    },
    // 下载模板
    async downloadTemplate() {
      try {
        const response = await downloadTemplate()
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'host_import_template.xlsx'
        link.click()
      } catch (error) {
        this.$message.error('下载模板失败')
      }
    },
    // 处理表单提交
    async handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.submitting = true
        try {
          if (this.form.id) {
            await updateHost(this.form.id, this.form)
            this.$message.success('更新成功')
          } else {
            await createHost(this.form)
            this.$message.success('创建成功')
          }
          this.dialogVisible = false
          this.fetchHosts()
        } catch (error) {
          this.$message.error(error.message || '操作失败')
        } finally {
          this.submitting = false
        }
      })
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
    // 处理选择
    handleSelectionChange(val) {
      this.selectedHosts = val
    },
    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增主机'
      this.form = this.getInitialForm()
      this.dialogVisible = true
    },
    // 处理编辑
    // handleEdit(row) {
    //   this.dialogTitle = '编辑主机'
    //   this.form = {
    //     ...row,
    //     tags: row.tags ? row.tags.split(',') : []
    //   }
    //   this.dialogVisible = true
    // },
    // 处理删除
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该主机?', '提示', {
          type: 'warning'
        })
        await deleteHost(row.id)
        this.$message.success('删除成功')
        this.fetchHosts()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    // 处理批量删除
    async handleBatchDelete() {
      if (!this.selectedHosts.length) {
        return this.$message.warning('请选择要删除的主机')
      }
      try {
        await this.$confirm(
          `确认删除选中的 ${this.selectedHosts.length} 个主机?`,
          '提示',
          { type: 'warning' }
        )
        const ids = this.selectedHosts.map(item => item.id)
        await batchDeleteHosts(ids)
        this.$message.success('删除成功')
        this.fetchHosts()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    // 处理主机检测
    async handleCheck(row) {
      try {
        await checkHost(row.id)
        this.$message.success('检测完成')
        this.fetchHosts()
      } catch (error) {
        this.$message.error('检测失败')
      }
    },
    // 处理标签
    handleRemoveTag(tag) {
      this.form.tags.splice(this.form.tags.indexOf(tag), 1)
    },
    showTagInput() {
      this.tagInputVisible = true
      this.$nextTick(() => {
        this.$refs.tagInput.$refs.input.focus()
      })
    },
    handleAddTag() {
      const value = this.tagInputValue.trim()
      if (value && !this.form.tags.includes(value)) {
        this.form.tags.push(value)
      }
      this.tagInputVisible = false
      this.tagInputValue = ''
    },
    // 处理导入
    handleImport() {
      this.importVisible = true
    },
    beforeUpload(file) {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'text/csv'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isExcel) {
        this.$message.error('只能上传 Excel/CSV 文件!')
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB!')
      }
      return isExcel && isLt10M
    },
    handleImportSuccess() {
      this.$message.success('导入成功')
      this.importVisible = false
      this.fetchHosts()
    },
    handleImportError() {
      this.$message.error('导入失败')
    },
    // 处理同步
    handleSync() {
      this.syncVisible = true
    },
    async handleSyncSubmit() {
      this.$refs.syncForm.validate(async valid => {
        if (!valid) return
        this.syncing = true
        try {
          await syncCloudHosts(this.syncForm)
          this.$message.success('同步成功')
          this.syncVisible = false
          this.fetchHosts()
        } catch (error) {
          this.$message.error(error.message || '同步失败')
        } finally {
          this.syncing = false
        }
      })
    },
    // 工具方法
    formatDate,
    getStatusType(status) {
      const map = {
        online: 'success',
        offline: 'danger',
        unknown: 'info'
      }
      return map[status] || 'info'
    },
    resetForm() {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
      this.form = this.getInitialForm()
    },
    getStatusText(status) {
      const map = {
        online: '在线',
        offline: '离线',
        unknown: '未知'
      }
      return map[status] || '未知'
    },
    getResourceColor(usage) {
      if (usage >= 90) return '#F56C6C'
      if (usage >= 70) return '#E6A23C'
      return '#67C23A'
    }
  }
}
</script>

<style lang="scss" scoped>
.host-manager {
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

    .el-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .table-operations {
    margin-bottom: 20px;

    .el-button {
      margin-right: 10px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .table-card {
    .ip-info {
      span {
        display: block;
        line-height: 1.5;

        .el-icon-office-building,
        .el-icon-connection {
          margin-right: 5px;
          color: #909399;
        }
      }
    }

    .resource-info {
      span {
        display: block;
        margin-bottom: 8px;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }

        .el-icon-cpu,
        .el-icon-monitor,
        .el-icon-folder {
          margin-right: 5px;
          color: #909399;
        }

        .el-progress {
          margin-left: 8px;
        }
      }
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

  .el-dialog {
    .el-upload {
      width: 100%;

      .el-upload-dragger {
        width: 100%;
      }
    }

    .import-template {
      text-align: center;
      margin-top: 20px;

      .el-button {
        font-size: 14px;
      }
    }
  }

  // 标签样式
  .el-tag {
    margin-right: 8px;
    margin-bottom: 8px;

    &:last-child {
      margin-right: 0;
    }
  }

  // 表单样式优化
  .el-form {
    .el-input-number {
      width: 100%;
    }

    .el-textarea {
      font-family: monospace;
    }
  }
}
</style>
