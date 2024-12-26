<!-- views/host-group/index.vue -->
<template>
  <div class="host-group-manager">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="主机组名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入主机组名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区 -->
    <div class="table-operations">
      <el-button type="primary" @click="handleAdd">新增主机组</el-button>
    </div>

    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="主机组名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="hostCount" label="主机数量" width="100" />
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入主机组名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
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
      searchForm: {
        name: ''
      },
      tableData: [],
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

    handleSearch() {
      this.page = 1
      this.fetchData()
    },

    resetSearch() {
      this.searchForm.name = ''
      this.handleSearch()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },

    handleCurrentChange(val) {
      this.page = val
      this.fetchData()
    },

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
          type: 'warning'
        })

        await deleteHostGroup(row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '删除失败')
        }
      }
    },

    async handleSubmit() {
      try {
        await this.$refs.form.validate()

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

  .search-card {
    margin-bottom: 20px;
  }

  .table-operations {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
