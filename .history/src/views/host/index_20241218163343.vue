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
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
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
        <el-table-column label="主机组" min-width="120">
          <template slot-scope="{ row }">
            {{ formatHostGroupName(row) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
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
                icon="el-icon-edit"
                @click="handleEdit(row)"
              >
                编辑
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
          :current-page.sync="page"
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
      @close="handleDialogClose"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
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
    </el-dialog>

    <!-- 同步云主机对话框 -->
    <el-dialog title="同步云主机" :visible.sync="syncVisible" width="500px">
      <el-form ref="syncForm" :model="syncForm" label-width="100px">
        <el-form-item label="云服务商" prop="provider">
          <el-select v-model="syncForm.provider" style="width: 100%">
            <el-option label="阿里云" value="aliyun" />
            <el-option label="腾讯云" value="tencent" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="syncVisible = false">取 消</el-button>
        <el-button type="primary" :loading="syncing" @click="handleSyncSubmit">
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
  batchDeleteHosts
} from '@/api/host'

export default {
  name: 'HostManager',
  data() {
    return {
      // 搜索表单
      searchForm: {
        hostGroupId: undefined,
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

      // 主机组数据
      hostGroups: [],
      hostGroupsLoading: false,

      // 对话框控制
      dialogVisible: false,
      dialogTitle: '新增主机',
      importVisible: false,
      syncVisible: false,

      // 表单数据
      form: this.getInitialForm(),
      submitting: false,

      // 同步表单
      syncForm: {
        provider: 'aliyun'
      },
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
        ]
      }
    }
  },
  computed: {
    uploadHeaders() {
      return {
        Authorization: `Bearer ${this.$store.getters.token}`
      }
    }
  },
  created() {
    this.fetchHostGroups()
    this.fetchHosts()
  },
  methods: {
    // 初始化表单
    getInitialForm() {
      return {
        hostGroupId: undefined,
        hostname: '',
        privateIP: '',
        publicIP: '',
        description: ''
      }
    },

    // 获取主机组列表
    async fetchHostGroups() {
      this.hostGroupsLoading = true
      try {
        const { data } = await getHostGroups({
          page: 1,
          pageSize: 100
        })
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
        this.tableData = data.items || []
        this.total = data.total || 0
      } catch (error) {
        this.$message.error('获取主机列表失败')
      } finally {
        this.loading = false
      }
    },

    // 处理搜索
    handleSearch() {
      this.page = 1
      this.fetchHosts()
    },

    // 处理重置
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.handleSearch()
    },

    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增主机'
      this.form = this.getInitialForm()
      this.dialogVisible = true
    },

    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '编辑主机'
      this.form = { ...row }
      this.dialogVisible = true
    },

    // 处理删除
    handleDelete(row) {
      this.$confirm('确认删除该主机?', '提示', {
        type: 'warning'
      }).then(async() => {
        try {
          await deleteHost(row.id)
          this.$message.success('删除成功')
          this.fetchHosts()
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    // 处理批量删除
    handleBatchDelete() {
      const ids = this.selectedHosts.map(item => item.id)
      this.$confirm(`确认删除选中的 ${ids.length} 个主机?`, '提示', {
        type: 'warning'
      }).then(async() => {
        try {
          await batchDeleteHosts(ids)
          this.$message.success('批量删除成功')
          this.fetchHosts()
        } catch (error) {
          this.$message.error('批量删除失败')
        }
      }).catch(() => {})
    },
    // 处理表单提交
    handleSubmit() {
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

    // 处理对话框关闭
    handleDialogClose() {
      this.$refs.form && this.$refs.form.resetFields()
      this.form = this.getInitialForm()
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedHosts = selection
    },

    // 处理分页大小变化
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchHosts()
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.page = val
      this.fetchHosts()
    },

    // 处理导入
    handleImport() {
      this.importVisible = true
    },

    // 处理同步
    handleSync() {
      this.syncVisible = true
    },

    // 上传前校验
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.type === 'application/vnd.ms-excel' ||
                      file.type === 'text/csv'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isExcel) {
        this.$message.error('只能上传 xlsx/csv 格式的文件!')
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB!')
      }
      return isExcel && isLt10M
    },

    // 导入成功处理
    handleImportSuccess(response) {
      this.$message.success('导入成功')
      this.importVisible = false
      this.fetchHosts()
    },

    // 导入失败处理
    handleImportError() {
      this.$message.error('导入失败')
    },

    // 处理同步提交
    async handleSyncSubmit() {
      this.syncing = true
      try {
        await this.$refs.syncForm.validate()
        // 调用同步API
        this.$message.success('同步任务已提交')
        this.syncVisible = false
      } catch (error) {
        this.$message.error(error.message || '提交失败')
      } finally {
        this.syncing = false
      }
    },

    // 格式化主机组名称
    formatHostGroupName(row) {
      if (!row.hostGroupId) return '-'
      const group = this.hostGroups.find(g => g.id === row.hostGroupId)
      return group ? group.name : '-'
    },

    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        online: 'success',
        offline: 'danger',
        unknown: 'info'
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        online: '在线',
        offline: '离线',
        unknown: '未知'
      }
      return statusMap[status] || '未知'
    },

    // 处理详情
    handleDetail(row) {
      // 跳转到详情页面
      this.$router.push(`/host/detail/${row.id}`)
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
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-operations {
    margin-bottom: 20px;

    .el-button {
      margin-right: 10px;
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
        }
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .el-dialog {
    .el-upload {
      width: 100%;
    }

    .el-upload-dragger {
      width: 100%;
    }
  }
}
</style>

