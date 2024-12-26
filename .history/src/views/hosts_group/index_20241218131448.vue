<!-- views/host-group/index.vue -->
<template>
  <div class="host-group-manager">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">主机组管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>主机管理</el-breadcrumb-item>
        <el-breadcrumb-item>主机组管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" size="small">
        <el-form-item label="主机组名称">
          <el-input
            v-model.trim="searchForm.name"
            placeholder="请输入主机组名称"
            clearable
            prefix-icon="el-icon-search"
            @keyup.enter.native="handleSearch"
          />
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
      <el-button
        type="primary"
        icon="el-icon-plus"
        size="small"
        @click="handleAdd"
      >
        新增主机组
      </el-button>
      <el-button
        type="danger"
        icon="el-icon-delete"
        size="small"
        :disabled="selectedRows.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="主机组名称" min-width="150">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.name" placement="top">
              <span class="ellipsis">{{ scope.row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.description" placement="top">
              <span class="ellipsis">{{ scope.row.description || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="hostCount"
          label="主机数量"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.hostCount > 0 ? 'success' : 'info'" size="small">
              {{ scope.row.hostCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
          align="center"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              plain
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              plain
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
        size="small"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model.trim="form.name"
            placeholder="请输入主机组名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model.trim="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述信息"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" :loading="submitLoading" @click="handleSubmit">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { formatDate } from '@/utils/date'
import { getHostGroups, createHostGroup, updateHostGroup, deleteHostGroup } from '@/api/hostGroup'

export default {
  name: 'HostGroupManager',
  data() {
    return {
      loading: false,
      submitLoading: false,
      searchForm: {
        name: ''
      },
      tableData: [],
      selectedRows: [],
      page: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入主机组名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { max: 255, message: '描述最多 255 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取表格数据
    async fetchData() {
      try {
        this.loading = true
        const { data } = await getHostGroups({
          page: this.page,
          pageSize: this.pageSize,
          name: this.searchForm.name
        })
        this.tableData = data.items
        this.total = data.total
      } catch (error) {
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 表格多选
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },

    // 搜索相关
    handleSearch() {
      this.page = 1
      this.fetchData()
    },

    resetSearch() {
      this.searchForm.name = ''
      this.handleSearch()
    },

    // 分页相关
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },

    handleCurrentChange(val) {
      this.page = val
      this.fetchData()
    },

    // 表单操作
    handleAdd() {
      this.dialogTitle = '新增主机组'
      this.dialogVisible = true
      this.form = {
        name: '',
        description: ''
      }
    },

    handleEdit(row) {
      this.dialogTitle = '编辑主机组'
      this.dialogVisible = true
      this.form = {
        id: row.id,
        name: row.name,
        description: row.description
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该主机组吗？', '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })

        await deleteHostGroup(row.id)
        this.$message.success('删除成功')
        if (this.tableData.length === 1 && this.page > 1) {
          this.page--
        }
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '删除失败')
        }
      }
    },

    async handleBatchDelete() {
      try {
        await this.$confirm(
          `确认删除选中的 ${this.selectedRows.length} 个主机组吗？`,
          '提示',
          {
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          }
        )

        // 实现批量删除逻辑
        const promises = this.selectedRows.map(row => deleteHostGroup(row.id))
        await Promise.all(promises)

        this.$message.success('批量删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '批量删除失败')
        }
      }
    },

    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        this.submitLoading = true

        if (this.form.id) {
          await updateHostGroup(this.form.id, this.form)
          this.$message.success('更新成功')
        } else {
          await createHostGroup(this.form)
          this.$message.success('创建成功')
        }

        this.dialogVisible = false
        this.fetchData()
      } catch (error) {
        this.$message.error(error.message || '操作失败')
      } finally {
        this.submitLoading = false
      }
    },

    resetForm() {
      this.$refs.form?.resetFields()
    },

    formatDate
  }
}
</script>

<style lang="scss" scoped>
.host-group-manager {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);

  .page-header {
    margin-bottom: 20px;

    .page-title {
      margin: 0 0 10px;
      font-size: 20px;
      font-weight: 500;
      color: #1f2f3d;
    }
  }

  .search-card {
    margin-bottom: 20px;

    .el-form {
      margin-bottom: -18px;
    }
  }

  .table-operations {
    margin-bottom: 20px;

    .el-button {
      margin-right: 10px;
    }
  }

  .table-card {
    .ellipsis {
      display: inline-block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}

// 弹窗样式优化
::v-deep .el-dialog {
  border-radius: 8px;

  .el-dialog__header {
    padding: 20px;
    border-bottom: 1px solid #dcdfe6;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .el-dialog__body {
    padding: 30px 20px;
  }

  .el-dialog__footer {
    padding: 20px;
    border-top: 1px solid #dcdfe6;
  }
}
</style>
