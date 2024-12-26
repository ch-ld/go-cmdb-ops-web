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
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.ID }}
        </template>
      </el-table-column>
      <el-table-column label="角色名称">
        <template slot-scope="scope">
          {{ scope.row.role_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="190px">
        <template slot-scope="scope">
          <div class="flex-btns">
            <el-button type="primary" @click="bindEdit(scope.row)">编辑</el-button>
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

    <!-- 编辑角色 -->
    <el-dialog title="编辑角色" :visible.sync="formEditVisible" width="450px" center>
      <el-form ref="editForm">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.role_name" placeholder="" />
        </el-form-item>
        <el-form-item label="角色 ID">
          <el-input v-model="editForm.ID" disabled placeholder="" />
        </el-form-item>
        <el-form-item>
          <el-button native-type="primary" @click="onSubmitEdit">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { getRoles, addRole, editRole, deleteRole } from '@/api/roles' // 假定有这个 API

export default {
  data() {
    return {
      list: null,
      listLoading: true,
      formAddVisible: false,
      formEditVisible: false,
      addForm: {
        role_name: ''
      },
      editForm: {
        ID: 0,
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

    bindEdit(data) {
      this.editForm = {
        ID: data.ID,
        role_name: data.role_name
      }
      this.formEditVisible = true
    },

    async deleteRole(data) {
      this.$confirm('是否删除角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(async() => {
        await deleteRole(data.ID)
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
    },

    async onSubmitEdit() {
      try {
        await editRole(this.editForm)
        this.$message({ type: 'success', message: '修改成功' })
        this.fetchData() // 刷新角色列表
      } catch (error) {
        console.error('修改角色失败:', error)
      } finally {
        this.formEditVisible = false
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
