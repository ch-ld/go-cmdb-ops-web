<template>
  <div>
    <div v-for="(section, index) in sections" :key="index" class="container">
      <div class="container-header">
        {{ section.title }}
        <el-button size="mini" type="primary" @click="editSection(index)">编辑</el-button>
        <el-button size="mini" type="danger" @click="deleteSection(section.id)">删除</el-button>
      </div>
      <div class="container-body">
        <div v-for="(item, itemIndex) in section.items" :key="itemIndex" class="item-block">
          <a :href="item.url" target="_blank">
            <div class="item-top">
              <div class="item-logo"><img :src="item.logo" alt="Logo"></div>
              <div class="item-body">
                <span class="title">{{ item.name }}</span>
                <span class="notice">{{ item.notice }}</span>
              </div>
            </div>
          </a>
          <div class="item-bottom">
            <a v-for="(link, linkIndex) in item.links" :key="linkIndex" :href="link.url" target="_blank">
              <div>{{ link.text }}</div>
              <div v-if="linkIndex < item.links.length - 1" class="divider" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="isEditDialogVisible" title="编辑导航">
      <el-form :model="currentSection">
        <el-form-item label="标题">
          <el-input v-model="currentSection.title" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="currentSection.items[0].url" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="currentSection.items[0].name" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="currentSection.items[0].notice" />
        </el-form-item>
        <el-form-item label="Logo">
          <el-input v-model="currentSection.items[0].logo" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChanges">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      sections: [],
      isEditDialogVisible: false,
      currentSection: {}
    }
  },
  created() {
    this.fetchSections()
  },
  methods: {
    async fetchSections() {
      try {
        const response = await axios.get('/api/navigation')
        this.sections = response.data
      } catch (error) {
        console.error('获取导航数据失败:', error)
      }
    },
    editSection(index) {
      this.currentSection = { ...this.sections[index] }
      this.isEditDialogVisible = true
    },
    async saveChanges() {
      try {
        await axios.put(`/api/navigation/${this.currentSection.id}`, this.currentSection)
        this.fetchSections()
        this.isEditDialogVisible = false
      } catch (error) {
        console.error('保存失败:', error)
      }
    },
    async deleteSection(id) {
      try {
        await axios.delete(`/api/navigation/${id}`)
        this.fetchSections()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #fff;
  margin-bottom: 20px;
}

.container-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  flex-direction: column;
  height: 160px;
  width: 24%;
  margin-bottom: 20px;
  margin-right: 10px;
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
  background-color: #F7F7F7;
  font-size: 13px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 10px;
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
