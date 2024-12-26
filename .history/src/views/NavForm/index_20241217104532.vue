<template>
  <el-card class="nav-container" header="便捷导航">
    <template #header>
      <div class="nav-header">
        <span class="nav-title">便捷导航</span>
        <el-button
          type="primary"
          size="small"
          class="edit-mode-btn"
          @click="toggleEditMode"
        >{{ isEdit ? '完成' : '编辑' }}</el-button>
      </div>
    </template>

    <el-row :gutter="20" class="card-row">
      <el-col v-if="isEdit" :span="6">
        <!-- 新建按钮 -->
        <div class="add-record-btn" @click="addNewRecord">
          <el-card class="add-card">
            <div class="add-icon">+</div>
            <div class="add-text">新建</div>
          </el-card>
        </div>
      </el-col>

      <el-col v-for="(record) in records" :key="record.id" :span="6">
        <el-card class="record-card" :hoverable="true">
          <template #header>
            <div class="record-header">
              <el-avatar :src="record.logo" size="large" />
              <span class="record-title">{{ record.title }}</span>
            </div>
          </template>

          <div class="record-desc">{{ record.desc }}</div>

          <template v-if="isEdit">
            <div class="actions">
              <el-button icon="el-icon-arrow-left" size="mini" class="sort-btn" @click="sortRecord(record.id, 'left')" />
              <el-button icon="el-icon-arrow-right" size="mini" class="sort-btn" @click="sortRecord(record.id, 'right')" />
              <el-button icon="el-icon-edit" size="mini" class="edit-btn" @click="editRecord(record)" />
              <el-button icon="el-icon-delete" size="mini" type="danger" class="delete-btn" @click="deleteRecord(record.id)" />
            </div>
          </template>

          <template v-else>
            <el-button v-for="link in record.links" :key="link.url" type="text" class="link-btn">
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
            <el-input v-model="link.name" placeholder="链接名称" class="link-input" />
            <el-input v-model="link.url" placeholder="链接地址" class="link-input" />
            <el-button v-if="currentRecord.links.length > 1" type="danger" icon="el-icon-minus" @click="removeLink(index)" />
          </div>
          <el-button type="primary" icon="el-icon-plus" class="add-link-btn" @click="addLink">添加链接</el-button>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button class="cancel-btn" @click="cancel">取消</el-button>
        <el-button type="primary" class="save-btn" @click="saveRecord">保存</el-button>
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
        links: [{ name: '', url: '' }]
      },
      visible: false
    }
  },

  mounted() {
    this.fetchRecords()
  },

  methods: {
    toggleEditMode() {
      this.isEdit = !this.isEdit
    },

    async fetchRecords() {
      try {
        const response = await fetchNavigationRecords()
        this.records = response.data
      } catch (error) {
        this.$message.error('获取导航数据失败')
      }
    },

    addNewRecord() {
      this.currentRecord = {
        id: null,
        title: '',
        desc: '',
        logo: '',
        links: [{ name: '', url: '' }]
      }
      this.visible = true
    },

    editRecord(record) {
      this.currentRecord = {
        id: record.id,
        title: record.title,
        desc: record.desc,
        logo: record.logo,
        links: record.links ? [...record.links] : [{ name: '', url: '' }]
      }
      this.visible = true
    },

    cancel() {
      this.visible = false
      this.currentRecord = {
        id: null,
        title: '',
        desc: '',
        logo: '',
        links: [{ name: '', url: '' }]
      }
    },

    async saveRecord() {
      try {
        if (this.currentRecord.id) {
          await updateNavigationRecord(this.currentRecord)
        } else {
          await createNavigationRecord(this.currentRecord)
        }
        this.$message.success('保存成功')
        this.fetchRecords()
        this.cancel()
      } catch (error) {
        this.$message.error('保存失败')
      }
    },

    async deleteRecord(id) {
      try {
        await this.$confirm('确定删除该记录吗?', '删除确认', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteNavigationRecord(id)
        this.$message.success('删除成功')
        this.fetchRecords()
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消删除')
        } else {
          this.$message.error('删除失败')
        }
      }
    },

    async sortRecord(id, direction) {
      try {
        const payload = { id, direction }
        await sortNavigationRecord(payload)
        this.$message.success('排序成功')
        this.fetchRecords()
      } catch (error) {
        this.$message.error('排序失败')
      }
    },

    addLink() {
      this.currentRecord.links.push({ name: '', url: '' })
    },

    removeLink(index) {
      this.currentRecord.links.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.nav-container {
  padding: 0;  /* 移除内边距 */
  background-color: #ffffff;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.edit-mode-btn {
  padding: 4px 16px;
  background: #1890ff;
  color: white;
  border-radius: 2px;
  font-size: 14px;
}

.card-row {
  display: flex;
  flex-wrap: wrap;
  padding: 24px;
  gap: 24px;
}

.add-card {
  background: #fdfdfd;
  border: 1px dashed #d9d9d9;
  border-radius: 2px;
  padding: 24px;
  text-align: center;
  height: 167px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s;
}

.add-card:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.add-icon {
  font-size: 24px;
  color: #bfbfbf;
}

.add-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 8px;
}

.record-card {
  background-color: #fdfdfd;
  border-radius: 2px;
  height: 167px;
  transition: all 0.3s;
}

.record-header {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.record-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.record-desc {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  margin: 0 16px;
  height: 44px;
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.sort-btn,
.edit-btn,
.delete-btn {
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 2px;
}

.link-btn {
  padding: 0;
  font-size: 14px;
  color: #1890ff;

  a {
    color: inherit;
    text-decoration: none;
  }

  &:hover {
    color: #40a9ff;
  }
}

.dialog-footer {
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn,
.save-btn {
  padding: 4px 16px;
  font-size: 14px;
  border-radius: 2px;
}

.link-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.link-input {
  width: 45%;
}

/* 新增图标样式 */
:deep(.el-avatar) {
  border-radius: 4px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  background: #f5f5f5;
  color: rgba(0, 0, 0, 0.65);
}

/* 描述文字样式 */
.desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
}

/* 链接按钮样式 */
.action-link {
  padding: 8px 16px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  text-align: center;
  cursor: pointer;

  &:hover {
    color: #1890ff;
  }
}
</style>
