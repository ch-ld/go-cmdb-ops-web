<template>
  <div class="app-container">

    <el-form class="filter-form">
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" @click="openAddForm()">新增用户</el-button>
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
      <el-table-column label="userid">
        <template slot-scope="scope">
          {{ scope.row.userid }}
        </template>
      </el-table-column>

      <el-table-column label="Username">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>

      <el-table-column label="password">
        <template slot-scope="scope">
          {{ scope.row.password }}
        </template>
      </el-table-column>
      <el-table-column label="avatar">
        <template slot-scope="scope">
          {{ scope.row.avatar }}
        </template>
      </el-table-column>
      <el-table-column label="role">
        <template slot-scope="scope">
          {{ getRoleLabel(scope.row.role) }}
        </template>
      </el-table-column>

      <el-table-column align="center" fixed="right" label="操作" width="190px">
        <template slot-scope="scope">
          <div class="flex-btns">
            <el-button :loading="scope.row.loading" type="primary" @click="bindEdit(scope.row)">编辑</el-button>
            <el-button type="info" @click="deleteUser(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!--  添加用户  -->
    <el-dialog title="添加用户" :visible.sync="formAddVisible" width="450px" center>
      <el-form ref="addform">
        <el-form-item label="用户名称">
          <el-input v-model="addForm.username" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="用户密码">
          <el-input v-model="addForm.password" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item>
          <el-button native-type="primary" @click="onSubmitAdd">确认添加</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--  修改用户  -->
    <el-dialog title="编辑用户" :visible.sync="formEditVisible" width="450px" center>
      <el-form ref="editForm">
        <el-form-item label="用户名称">
          <el-input v-model="editForm.username" placeholder="" />
        </el-form-item>
        <el-form-item label="userid">
          <el-input v-model="editForm.userid" placeholder="" :disabled="true" />
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="editForm.password" placeholder="" />
        </el-form-item>
        <el-form-item label="avatar">
          <el-input v-model="editForm.avatar" placeholder="" />
        </el-form-item>
        <el-form-item label="用户权限">
          <el-select v-model="editForm.role" placeholder="请选择角色">
            <el-option
              v-for="option in roleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button native-type="primary" @click="onSubmitEdit">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { getUser, delUser, addUser, editUser, getRoles } from '@/api/user'

export default {
  data() {
    return {
      list: null,
      listLoading: true,
      formAddVisible: false,
      formEditVisible: false,
      addForm: {
        username: '',
        password: ''
      },
      roleOptions: [],
      editForm: {
        id: 0,
        username: '',
        userid: '',
        password: '',
        avatar: '',
        role: '2' // 默认角色
      }
    }
  },
  created() {
    this.fetchData()
    this.fetchRoles() // 加载角色数据
  },
  methods: {
    async fetchRoles() {
      try {
        const response = await getRoles()
        if (response.code === 200) {
          this.roleOptions = response.data.map(role => ({
            value: role.ID.toString(),
            label: role.role_name
          }))
        }
      } catch (error) {
        console.error('获取角色数据失败:', error)
      }
    },

    getRoleLabel(roleValue) {
      const role = this.roleOptions.find(option => option.value === roleValue.toString())
      return role ? role.label : '未知角色'
    },

    async fetchData() {
      this.listLoading = true
      try {
        const response = await getUser({ id: 0 })
        this.list = response.data
      } catch (error) {
        console.error('获取用户数据失败:', error)
      } finally {
        this.listLoading = false
      }
    },

    openAddForm() {
      this.formAddVisible = true
    },

    bindEdit(data) {
      this.editForm = {
        id: data.ID,
        username: data.username,
        userid: data.userid,
        password: data.password,
        avatar: data.avatar,
        role: data.role.toString() // 设置默认选中的角色值
      }
      this.formEditVisible = true
    },

    deleteUser(data) {
      this.$confirm('是否删除用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        return delUser({ userid: data.userid })
      }).then(() => {
        this.$message({ type: 'success', message: '删除成功' })
        this.fetchData() // 刷新用户列表
      }).catch(() => {
        this.$message({ type: 'info', message: '取消删除' })
      })
    },

    async onSubmitAdd() {
      try {
        await addUser({ username: this.addForm.username, password: this.addForm.password })
        this.$message({ type: 'success', message: '添加成功' })
        this.fetchData() // 刷新用户列表
      } catch (error) {
        console.error('添加用户失败:', error)
      } finally {
        this.formAddVisible = false
      }
    },

    async onSubmitEdit() {
      try {
        await editUser({
          username: this.editForm.username,
          userid: this.editForm.userid,
          password: this.editForm.password,
          avatar: this.editForm.avatar,
          role: parseInt(this.editForm.role)
        })
        this.$message({ type: 'success', message: '修改成功' })
        this.fetchData() // 刷新用户列表
      } catch (error) {
        console.error('修改用户失败:', error)
      } finally {
        this.formEditVisible = false
      }
    }
  }
}
</script>

<style scoped>
/* 添加一些基本样式 */
.flex-btns {
  display: flex;
  justify-content: space-around;
}
</style>
