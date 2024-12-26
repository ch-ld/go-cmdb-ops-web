<template>
  <div class="app-container">

    <el-form class="filter-form">
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" @click="openAddForm">新增导航</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="listLoading"
      :data="sections"
      element-loading-text="加载中..."
      border
      fit
      highlight-current-row
      class="navigation-table"
    >
      <el-table-column align="center" label="ID" width="95">
        <template v-slot="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="标题">
        <template v-slot="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="图标">
        <template v-slot="scope">
          <img :src="scope.row.icon" alt="图标" width="30" height="30" class="icon">
        </template>
      </el-table-column>
      <el-table-column label="链接">
        <template v-slot="scope">
          {{ scope.row.url }}
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template v-slot="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="190px">
        <template v-slot="scope">
          <div class="flex-btns">
            <el-button type="primary" @click="bindEdit(scope.row)">编辑</el-button>
            <el-button type="danger" @click="deleteSection(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加导航 -->
    <el-dialog title="添加导航" :visible.sync="formAddVisible" width="450px" center>
      <el-form ref="addForm" class="form">
        <el-form-item label="标题">
          <el-input v-model="addForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="addForm.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="addForm.url" placeholder="请输入链接" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="addForm.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item>
          <el-button native-type="primary" @click="onSubmitAdd">确认添加</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑导航 -->
    <el-dialog title="编辑导航" :visible.sync="formEditVisible" width="450px" center>
      <el-form ref="editForm" class="form">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" placeholder="" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="editForm.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="editForm.url" placeholder="" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" placeholder="" />
        </el-form-item>
        <el-form-item>
          <el-button native-type="primary" @click="onSubmitEdit">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      sections: [
        {
          id: 1,
          title: '首页',
          icon: 'https://via.placeholder.com/30',
          url: '/home',
          description: '网站首页'
        },
        {
          id: 2,
          title: '关于我们',
          icon: 'https://via.placeholder.com/30',
          url: '/about',
          description: '了解更多关于我们'
        },
        {
          id: 3,
          title: '服务',
          icon: 'https://via.placeholder.com/30',
          url: '/services',
          description: '我们提供的服务'
        },
        {
          id: 4,
          title: '联系我们',
          icon: 'https://via.placeholder.com/30',
          url: '/contact',
          description: '与我们取得联系'
        }
      ],
      listLoading: false,
      formAddVisible: false,
      formEditVisible: false,
      addForm: {
        title: '',
        icon: '',
        url: '',
        description: ''
      },
      editForm: {
        id: 0,
        title: '',
        icon: '',
        url: '',
        description: ''
      }
    }
  },
  methods: {
    openAddForm() {
      this.formAddVisible = true
    },

    bindEdit(data) {
      this.editForm = { ...data }
      this.formEditVisible = true
    },

    deleteSection(data) {
      this.$confirm('是否删除该导航?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        this.sections = this.sections.filter(section => section.id !== data.id)
        this.$message({ type: 'success', message: '删除成功' })
      }).catch(() => {
        this.$message({ type: 'info', message: '取消删除' })
      })
    },

    onSubmitAdd() {
      const newId = this.sections.length + 1
      this.sections.push({ ...this.addForm, id: newId })
      this.$message({ type: 'success', message: '添加成功' })
      this.formAddVisible = false
    },

    onSubmitEdit() {
      const index = this.sections.findIndex(section => section.id === this.editForm.id)
      if (index !== -1) {
        this.sections.splice(index, 1, this.editForm)
        this.$message({ type: 'success', message: '修改成功' })
      }
      this.formEditVisible = false
    }
  }
}
</script>

<style scoped>
.flex-btns {
  display: flex;
  justify-content: space-around;
}

.navigation-table {
  margin-top: 20px;
}

.icon {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form {
  padding: 20px;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-button {
  width: 100%;
}
</style>
