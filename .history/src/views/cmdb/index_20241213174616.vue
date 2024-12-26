<template>
  <div class="app-container">

    <el-form class="filter-form" inline>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" @click="openAddFrom()">新增 CMDB 主机</el-button>
      </el-form-item>

      <el-form-item label="搜索">
        <el-input v-model="searchKeyword" placeholder="请输入搜索关键字" @keyup.enter="search" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button @click="clearSearch">清除搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="加载中..."
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="CMDB ID" width="100">
        <template slot-scope="scope">
          {{ scope.row.cmdbid }}
        </template>
      </el-table-column>
      <el-table-column label="CMDB 名称" width="150">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.cmdbname" placement="top">
            <span>{{ scope.row.cmdbname }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="公网 IP" width="120">
        <template slot-scope="scope">
          {{ scope.row.public_ip }}
        </template>
      </el-table-column>
      <el-table-column label="内网 IP" width="120">
        <template slot-scope="scope">
          {{ scope.row.private_ip }}
        </template>
      </el-table-column>
      <el-table-column label="管理用户" width="120">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="密码" width="120">
        <template slot-scope="scope">
          {{ maskSensitiveData(scope.row.password) }}
        </template>
      </el-table-column>
      <el-table-column label="私钥" width="120">
        <template slot-scope="scope">
          {{ maskSensitiveData(scope.row.private_key) }}
        </template>
      </el-table-column>
      <el-table-column label="SSH 端口" width="100">
        <template slot-scope="scope">
          {{ scope.row.ssh_port }}
        </template>
      </el-table-column>
      <el-table-column label="标签" width="100">
        <template slot-scope="scope">
          {{ scope.row.label }}
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <div class="flex-btns">
            <el-button type="primary" @click="bindEdit(scope.row)">编辑</el-button>
            <el-button type="danger" @click="deteleType(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加 CMDB 主机 -->
    <el-dialog title="添加 CMDB 主机" :visible.sync="formAddVisible" width="450px" center>
      <el-form ref="addform">
        <el-form-item label="CMDB 名称">
          <el-input v-model="addForm.cmdbname" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="公网 IP">
          <el-input v-model="addForm.public_ip" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="内网 IP">
          <el-input v-model="addForm.private_ip" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="管理用户">
          <el-input v-model="addForm.username" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="addForm.password" placeholder="请输入内容" type="password" />
        </el-form-item>
        <el-form-item label="私钥">
          <el-input v-model="addForm.private_key" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="SSH 端口">
          <el-input v-model="addForm.ssh_port" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="addForm.label" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitAdd">确认添加</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑 CMDB 主机 -->
    <el-dialog title="编辑 CMDB 主机" :visible.sync="formEditVisible" width="450px" center>
      <el-form ref="editform">
        <el-form-item label="CMDB 名称">
          <el-input v-model="editForm.cmdbname" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="CMDB ID">
          <el-input v-model="editForm.cmdbid" placeholder="" :disabled="true" />
        </el-form-item>
        <el-form-item label="公网 IP">
          <el-input v-model="editForm.public_ip" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="内网 IP">
          <el-input v-model="editForm.private_ip" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="管理用户">
          <el-input v-model="editForm.username" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="editForm.password" placeholder="请输入内容" type="password" />
        </el-form-item>
        <el-form-item label="私钥">
          <el-input v-model="editForm.private_key" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="SSH 端口">
          <el-input v-model="editForm.ssh_port" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="editForm.label" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitEdit">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { getCmdb, delCmdb, addCmdb, editCmdb, getSearchCmdb } from '@/api/cmdb'

export default {
  data() {
    return {
      searchKeyword: '',
      originalList: [],
      list: null,
      listLoading: true,
      formAddVisible: false,
      formEditVisible: false,
      addForm: {
        cmdbname: '',
        public_ip: '',
        private_ip: '',
        username: '',
        password: '',
        private_key: '',
        ssh_port: 22,
        label: ''
      },
      editForm: {
        id: 0,
        cmdbid: 0,
        cmdbname: '',
        public_ip: '',
        private_ip: '',
        username: '',
        password: '',
        private_key: '',
        ssh_port: 22,
        label: ''
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getCmdb({ id: 0 }).then(response => {
        this.originalList = response.data
        this.list = this.originalList
        this.listLoading = false
      })
    },
    openAddFrom() {
      this.formAddVisible = true
    },
    bindEdit(data) {
      Object.assign(this.editForm, data)
      this.formEditVisible = true
    },
    deteleType(data) {
      this.$confirm('是否删除 CMDB 标签?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        delCmdb({ cmdbid: data.cmdbid }).then(() => {
          this.$message({ type: 'success', message: '删除成功' })
          this.fetchData()
        })
      }).catch(() => {
        this.$message({ type: 'info', message: '取消删除' })
      })
    },
    search() {
      if (this.searchKeyword) {
        getSearchCmdb({ Keyword: this.searchKeyword }).then(response => {
          this.list = response.data
        }).catch(() => {
          this.$message.error('搜索失败，请稍后再试或联系管理员。')
        })
      } else {
        this.list = [...this.originalList]
      }
    },
    clearSearch() {
      this.searchKeyword = ''
      this.list = [...this.originalList]
    },
    maskSensitiveData(data) {
      if (!data) return ''
      return '*'.repeat(data.length)
    },
    onSubmitAdd() {
      addCmdb(this.addForm).then(() => {
        this.$message({ type: 'success', message: '添加成功' })
        this.fetchData()
        this.formAddVisible = false
      })
    },
    onSubmitEdit() {
      editCmdb(this.editForm).then(() => {
        this.$message({ type: 'success', message: '修改成功' })
        this.fetchData()
        this.formEditVisible = false
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.flex-btns {
  display: flex;
  justify-content: space-between;
}

.el-table th,
.el-table td {
  text-align: center;
}

.el-form-item {
  margin-bottom: 15px;
}
</style>
