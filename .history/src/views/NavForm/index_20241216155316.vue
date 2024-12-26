<template>
  <el-card class="nav-container" header="便捷导航">
    <template #header>
      <div class="nav-header">
        <span>便捷导航</span>
        <el-button
          type="primary"
          size="small"
          @click="toggleEditMode"
        >{{ isEdit ? '完成' : '编辑' }}</el-button>
      </div>
    </template>

    <el-row :gutter="20">
      <el-col v-if="isEdit" :span="6">
        <el-card
          class="add-card"
          @click="addNewRecord"
        >
          <div class="add-icon">+</div>
          <div class="add-icon">新建</div>
        </el-card>
      </el-col>

      <el-col v-for="(record) in records" :key="record.id" :span="6">
        <el-card
          class="record-card"
          :hoverable="true"
        >
          <template #header>
            <div class="record-header">
              <el-avatar :src="record.logo" />
              <span>{{ record.title }}</span>
            </div>
          </template>

          <div>{{ record.desc }}</div>

          <template v-if="isEdit">
            <div class="actions">
              <el-button icon="el-icon-arrow-up" size="mini" @click="sortRecord(record.id, 'up')" />
              <el-button icon="el-icon-arrow-down" size="mini" @click="sortRecord(record.id, 'down')" />
              <el-button icon="el-icon-edit" size="mini" @click="editRecord(record)" />
              <el-button icon="el-icon-delete" size="mini" type="danger" @click="deleteRecord(record.id)" />
            </div>
          </template>

          <template v-else>
            <el-button v-for="link in record.links" :key="link.url" type="text">
              <a :href="link.url" target="_blank">{{ link.name }}</a>
            </el-button>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- 显示表单，基于 currentRecord -->
    <el-dialog :visible.sync="visible" :title="currentRecord.id ? '编辑导航' : '新建导航'" width="50%">
      <el-form :model="currentRecord" label-width="100px">
        <el-form-item label="导航图标">
          <el-input v-model="currentRecord.logo" placeholder="请输入图片链接地址" />
        </el-form-item>

        <el-form-item label="导航标题">
          <el-input v-model="currentRecord.title" placeholder="请输入导航标题" />
        </el-form-item>

        <el-form-item label="导航描述">
          <el-input v-model="currentRecord.desc" placeholder="请输入导航描述" />
        </el-form-item>

        <el-form-item label="导航链接">
          <div v-for="(link, index) in currentRecord.links" :key="index" class="link-item">
            <el-input v-model="link.name" placeholder="链接名称" style="width: 30%; margin-right: 10px;" />
            <el-input v-model="link.url" placeholder="链接地址" style="width: 60%; margin-right: 10px;" />
            <el-button v-if="currentRecord.links.length > 1" type="danger" icon="el-icon-minus" @click="removeLink(index)" />
          </div>
          <el-button type="primary" icon="el-icon-plus" @click="addLink">添加链接</el-button>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="saveRecord">保存</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import { fetchNavigationRecords, createNavigationRecord, updateNavigationRecord, deleteNavigationRecord, sortNavigationRecord } from '@/api/navigation'

export default {
  data() {
    return {
      isEdit: false,
      records: [],
      currentRecord: {
        id: null,
        title: '',
        desc: '',
        logo: '',
        links: [{ name: '', url: '' }] // 默认一个空的链接
      },
      visible: false // 控制表单显示与否
    }
  },

  mounted() {
    this.fetchRecords()
  },

  methods: {
    // 切换编辑模式
    toggleEditMode() {
      this.isEdit = !this.isEdit
    },

    // 获取导航记录
    async fetchRecords() {
      try {
        const response = await fetchNavigationRecords()
        this.records = response.data
      } catch (error) {
        this.$message.error('获取导航数据失败')
      }
    },

    // 新建记录
    addNewRecord() {
      this.currentRecord = {
        id: null,
        title: '',
        desc: '',
        logo: '',
        links: [{ name: '', url: '' }] // 默认一个空的链接
      }
      this.visible = true
    },

    // 编辑记录
    editRecord(record) {
      this.currentRecord = { ...record }
      this.visible = true
    },

    // 取消编辑
    cancel() {
      this.visible = false
      this.currentRecord = {
        id: null,
        title: '',
        desc: '',
        logo: '',
        links: [{ name: '', url: '' }] // 默认一个空的链接
      }
    },

    // 保存记录
    async saveRecord() {
      try {
        if (this.currentRecord.id) {
          await updateNavigationRecord(this.currentRecord) // 更新已有记录
        } else {
          await createNavigationRecord(this.currentRecord) // 新建记录
        }
        this.$message.success('保存成功')
        this.fetchRecords() // 刷新记录列表
        this.cancel() // 取消编辑状态
      } catch (error) {
        this.$message.error('保存失败')
      }
    },

    // 删除记录
    async deleteRecord(id) {
      try {
        await deleteNavigationRecord(id)
        this.$message.success('删除成功')
        this.fetchRecords() // 刷新记录列表
      } catch (error) {
        this.$message.error('删除失败')
      }
    },

    // 排序记录
    async sortRecord(id, direction) {
      try {
        await sortNavigationRecord(id, direction)
        this.$message.success('排序成功')
        this.fetchRecords() // 刷新记录列表
      } catch (error) {
        this.$message.error('排序失败')
      }
    },

    // 添加链接
    addLink() {
      this.currentRecord.links.push({ name: '', url: '' })
    },

    // 移除链接
    removeLink(index) {
      this.currentRecord.links.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.nav-container {
  padding: 20px;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  cursor: pointer;
}

.record-card {
  position: relative;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.link-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
