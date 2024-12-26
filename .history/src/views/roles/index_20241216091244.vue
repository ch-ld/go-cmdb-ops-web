<template>
  <div class="app-container">

    <el-form class="filter-form">
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" @click="openAddForm()">新增角色</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="加载中..."
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column align="center" label="角色 ID" width="100">
        <template slot-scope="scope">
          {{ scope.row.ID }}
        </template>
      </el-table-column>
      <el-table-column label="角色名称" width="250">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.role_name" placement="top">
            <span>{{ scope.row.role_name }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="150">
        <template slot-scope="scope">
          <div class="flex-btns">
            <el-button type="danger" @click="deleteRole(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="formAddVisible" width="450px" center>
      <el-form ref="addform">
        <el-form-item label="角色名称">
          <el-input v-model="addForm.role_name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button native-type="primary" @click="onSubmitAdd">确认添加</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { getRoles, addRole, deleteRole } from '@/api/roles' // 确保有这些 API

export default {
  data() {
    return {
      list: null,
      listLoading: true,
      formAddVisible: false,
      addForm: {
        role_name: ''
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      try {
        const response = await getRoles() // 获取角色数据
        this.list = response.data
      } catch (error) {
        console.error('获取角色数据失败:', error)
      } finally {
        this.listLoading = false
      }
    },

    openAddForm() {
      this.formAddVisible = true
    },

    async deleteRole(data) {
      this.$confirm('是否删除角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(async() => {
        await deleteRole({ ID: data.ID })
        this.$message({ type: 'success', message: '删除成功' })
        this.fetchData() // 刷新角色列表
      }).catch(() => {
        this.$message({ type: 'info', message: '取消删除' })
      })
    },

    async onSubmitAdd() {
      try {
        await addRole({ role_name: this.addForm.role_name })
        this.$message({ type: 'success', message: '添加成功' })
        this.fetchData() // 刷新角色列表
      } catch (error) {
        console.error('添加角色失败:', error)
      } finally {
        this.formAddVisible = false
      }
    }
  }
}
</script>

<style scoped>
.flex-btns {
  display: flex;
  justify-content: space-around;
}
</style>
