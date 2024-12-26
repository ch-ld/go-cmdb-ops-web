<template>
  <div class="app-container">

    <el-form class="filter-form">
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" @click="openAddFrom()">新增用户</el-button>
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
            <el-button type="info" @click="deteleType(scope.row)">删除</el-button>

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
      <el-form ref="addform">
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
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
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
      // { value: '1', label: '普通用户' },
      // { value: '2', label: '管理员' }
      editForm: {
        id: 0,
        username: '',
        userid: '',
        password: '',
        avatar: '',
        role: '2'
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // getRoleLabel(roleValue) {
    //   const roleMap = {
    //     '1': '普通用户',
    //     '2': '管理员'
    //   }
    //   return roleMap[roleValue] || '未知角色'
    // },
    async getRoleLabel(roleValue) {
      const roleMap = {}
      try {
        const response = await getRoles() // 请求角色数据
        if (response.code === 200) {
        // 将角色数据填充到 roleMap
          response.data.forEach(role => {
            roleMap[role.ID.toString()] = role.role_name // 使用角色 ID 作为键
          })
        }
      } catch (error) {
        console.error('获取角色数据失败:', error)
      }
      return roleMap[roleValue] || '未知角色' // 返回角色名称或默认值
    },
    fetchData() {
      this.listLoading = true
      getUser({ id: 0 }).then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    openAddFrom() {
      this.formAddVisible = true
    },
    bindEdit(data) {
      // eslint-disable-next-line no-sequences
      this.editForm.username = data.username,
      this.editForm.userid = data.userid,
      this.editForm.password = data.password,
      this.editForm.avatar = data.avatar,
      this.editForm.role = data.role.toString() // 设置默认选中的角色值

      this.formEditVisible = true
    },
    deteleType(data) {
      this.$confirm('是否删除用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        console.log(data)
        delUser({
          userid: data.userid
        }).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          setTimeout(() => {
            this.$router.go(0)
          }, 300)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消删除'
        })
      })
    },

    onSubmitAdd() {
      addUser({
        username: this.addForm.username,
        password: this.addForm.password
      }).then(res => {
        console.log()
        this.$message({
          type: 'success',
          message: '添加成功'
        })
        setTimeout(() => {
          this.$router.go(0)
        }, 300)
      })
      this.formAddVisible = false
    },

    onSubmitEdit() {
      const Int_role = parseInt(this.editForm.role)
      editUser({
        username: this.editForm.username,
        userid: this.editForm.userid,
        password: this.editForm.password,
        avatar: this.editForm.avatar,
        role: Int_role

      }).then(res => {
        console.log()
        this.$message({
          type: 'success',
          message: '修改成功'
        })
        setTimeout(() => {
          this.$router.go(0)
        }, 300)
      })
      this.formEditVisible = false
    }
  }
}
</script>
