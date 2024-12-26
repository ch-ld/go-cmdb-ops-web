<template>
  <div class="app-container">

    <el-form class="filter-form">
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" @click="openAddFrom()">新增cmdb主机</el-button>
      </el-form-item>

      <el-form-item label="可根据ip、cmdbname、label标签的关键字来进行搜索">
        <el-input v-model="searchKeyword" placeholder="请输入搜索关键字" @keyup.enter="search"></el-input>

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
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="cmdbid">
        <template slot-scope="scope">
          {{ scope.row.cmdbid }}
        </template>
      </el-table-column>
      <el-table-column label="cmdbname">
        <template slot-scope="scope">
          {{ scope.row.cmdbname }}
        </template>
      </el-table-column>

      <el-table-column label="公网ip">
        <template slot-scope="scope">
          {{ scope.row.public_ip }}
        </template>
      </el-table-column>

      <el-table-column label="内网ip">
        <template slot-scope="scope">
          {{ scope.row.private_ip }}
        </template>
      </el-table-column>

      <el-table-column label="服务器管理用户">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>

      <el-table-column label="password">
        <template slot-scope="scope">
          <!-- {{ scope.row.password }} -->

          {{ scope.row.password }}
        </template>
      </el-table-column>

      <el-table-column label="private_key">
        <template slot-scope="scope">
          {{ scope.row.private_key }}
        </template>
      </el-table-column>


      <el-table-column label="ssh_port">
        <template slot-scope="scope">
          {{ scope.row.ssh_port }}
        </template>
      </el-table-column>
      <el-table-column label="label">
        <template slot-scope="scope">
          {{ scope.row.label }}
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
    <!--  添加cmdb标签  -->
    <el-dialog title="添加cmdb主机" :visible.sync="formAddVisible" width="450px" center>
      <el-form ref="addform">
        <el-form-item label="cmdbname">
          <el-input v-model="addForm.cmdbname" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="公网ip">
          <el-input v-model="addForm.public_ip" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="内网ip">
          <el-input v-model="addForm.private_ip" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="服务器管理用户">
          <el-input v-model="addForm.username" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="addForm.password" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="private_key">
          <el-input v-model="addForm.private_key" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="ssh_port">
          <el-input v-model="addForm.ssh_port" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="label">
          <el-input v-model="addForm.label" placeholder="请输入内容"></el-input>
        </el-form-item>


        <el-form-item>
          <el-button native-type="primary" @click="onSubmitAdd">确认添加</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--  修改cmdb标签  -->
    <el-dialog title="编辑cmdb主机" :visible.sync="formEditVisible" width="450px" center>
      <el-form ref="addform">
        <el-form-item label="cmdbname">
          <el-input v-model="editForm.cmdbname" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="cmdbid">
          <el-input v-model="editForm.cmdbid"   placeholder="" :disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="公网ip">
          <el-input v-model="editForm.public_ip" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="内网ip">
          <el-input v-model="editForm.private_ip" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="服务器管理用户">
          <el-input v-model="editForm.username" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="editForm.password" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="private_key">
          <el-input v-model="editForm.private_key" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="ssh_port">
          <el-input v-model="editForm.ssh_port" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="label">
          <el-input v-model="editForm.label" placeholder="请输入内容"></el-input>
        </el-form-item>


        <el-form-item>
          <el-button native-type="primary" @click="onSubmitEdit">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
  </div>
</template>
<script>
import { getCmdb, delCmdb, addCmdb, editCmdb,getSearchCmdb} from '@/api/cmdb'
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
      searchKeyword: '', // 搜索关键字属性
      originalList: [], // 原始列表数据备份
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
        label:'',
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
        label:'',
      }
    }
  },
  created() {
    this.fetchData();
    this.$nextTick(() => {
    this.$refs.searchInput.focus();
  });

  },
  methods: {
    fetchData() {
      this.listLoading = true
      getCmdb({ id: 0 }).then(response => {
        console.log('getCmdb response:', response);
        this.originalList  = response.data
        this.list = this.originalList; // 初始化列表为原始列表数据
        this.listLoading = false
      })
    },

    openAddFrom() {
      this.formAddVisible = true
    },
    bindEdit(data) {
      this.editForm.id = data.id
      this.editForm.cmdbid = data.cmdbid
      this.editForm.public_ip = data.public_ip
      this.editForm.private_ip =data.private_ip
      this.editForm.username = data.username
      this.editForm.password = data.password
      this.editForm.private_key = data.private_key
      this.editForm.ssh_port = data.ssh_port
      this.editForm.cmdbname = data.cmdbname
      this.editForm.label = data.label
      this.formEditVisible = true
    },
    deteleType(data) {
      this.$confirm('是否删除cmdb标签?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        console.log(data)
        delCmdb({
          cmdbid: data.cmdbid
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
    search() {
      if (this.searchKeyword) {
        getSearchCmdb({ Keyword: this.searchKeyword }).then(response => {
          console.log('Search result:', response);
          this.list = response.data; // 更新列表为搜索结果
        }).catch(error => {
          console.error('Search error:', error);
          this.$message.error('搜索失败，请稍后再试或联系管理员。');
        });
      } else {
        // 如果搜索关键字为空，恢复原始列表
        this.list = [...this.originalList];
      }
    },
    clearSearch() {
      console.log('Clearing search...');
      this.searchKeyword = ''; // 清空搜索关键字
      this.list = [...this.originalList]; // 恢复原始列表
      console.log('List after clearing search:', this.list);

    },


    onSubmitAdd() {
      const ssh_Port = parseInt(this.addForm.ssh_port);
      addCmdb({
        cmdbname: this.addForm.cmdbname,
        public_ip: this.addForm.public_ip,
        private_ip: this.addForm.private_ip,
        username: this.addForm.username,
        password: this.addForm.password,
        private_key: this.addForm.private_key,
        ssh_port: ssh_Port,
        label: this.addForm.label,

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
      const ssh_Port = parseInt(this.editForm.ssh_port);
      const cmdbId = parseInt(this.editForm.cmdbid);

      editCmdb({
        cmdbid: cmdbId,
        cmdbname: this.editForm.cmdbname,
        public_ip: this.editForm.public_ip,
        private_ip: this.editForm.private_ip,
        username: this.editForm.username,
        password: this.editForm.password,
        private_key: this.editForm.private_key,
        ssh_port: ssh_Port,
        label: this.editForm.label,

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
