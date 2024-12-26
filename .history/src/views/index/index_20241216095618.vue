<template>
  <div class="container">
    <div class="container-header">内部系统导航</div>
    <div class="container-body">
      <div v-for="section in sections" :key="section.title" class="item-block">
        <a :href="section.url" target="_blank">
          <div class="item-top">
            <div class="item-logo">
              <img :src="section.icon" alt="图标">
            </div>
            <div class="item-body">
              <span class="title">{{ section.title }}</span>
              <span class="notice">{{ section.description }}</span>
            </div>
          </div>
        </a>
        <div class="item-bottom">
          <a :href="section.url" target="_blank">
            <div>官网地址</div>
          </a>
          <div class="divider" />
          <a :href="section.url" target="_blank">
            <div>帮助文档</div>
          </a>
        </div>
      </div>
    </div>

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
          title: 'Gitlab系统',
          icon: 'https://via.placeholder.com/60',
          url: 'https://about.gitlab.com/',
          description: 'Gitlab内部代码仓库'
        },
        {
          title: 'WIKI系统',
          icon: 'https://via.placeholder.com/60',
          url: 'https://www.atlassian.com/',
          description: '文档系统'
        },
        {
          title: '服务系统',
          icon: 'https://via.placeholder.com/60',
          url: '/services',
          description: '我们提供的服务'
        },
        {
          title: '联系我们',
          icon: 'https://via.placeholder.com/60',
          url: '/contact',
          description: '与我们取得联系'
        }
      ],
      formAddVisible: false,
      formEditVisible: false,
      addForm: {
        title: '',
        icon: '',
        url: '',
        description: ''
      },
      editForm: {
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
    onSubmitAdd() {
      this.sections.push({ ...this.addForm })
      this.formAddVisible = false
    },
    onSubmitEdit() {
      const index = this.sections.findIndex(section => section.title === this.editForm.title)
      if (index !== -1) {
        this.sections.splice(index, 1, this.editForm)
      }
      this.formEditVisible = false
    }
  }
}
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #f7f7f7;
}

.container {
  background-color: #fff;
  padding: 10px;
}

.container-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  height: 40px;
  padding-left: 10px;
}

.container-body {
  display: flex;
  border-top: 1px solid #dfdfdf;
  padding: 20px 10px 0 10px;
  flex-wrap: wrap;
}

.item-block {
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  flex-direction: column;
  height: 160px;
  width: 24%;
  margin-bottom: 20px;
  margin-right: 10px;
  display: flex;
  background-color: #fff;
  transition: box-shadow 0.3s;
}

.item-block:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

a {
  color: #000;
  text-decoration: none;
}

.item-top {
  height: 80px;
  padding: 20px;
  display: flex;
}

.item-logo {
  width: 21%;
  height: 60px;
  margin-right: 20px;
}

.item-logo img {
  width: 100%;
  height: 100%;
}

.item-body {
  flex-direction: column;
  width: 79%;
}

.item-bottom {
  height: 40px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: #888888;
  background-color: #f7f7f7;
  font-size: 13px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 5px; /* 调整标题和描述之间的间距 */
}

.notice {
  font-size: 12px;
  color: #888;
}

.divider {
  height: 20px;
  width: 1px;
  background-color: #dfdfdf;
}
</style>
