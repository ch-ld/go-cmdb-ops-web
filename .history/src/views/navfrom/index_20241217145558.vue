<template>
  <el-card class="nav-container">
    <template #header>
      <div class="nav-header">
        <span class="nav-title">内部导航</span>
        <el-button
          type="primary"
          size="small"
          :class="['edit-mode-btn', { 'is-editing': isEdit }]"
          @click="toggleEditMode"
        >
          {{ isEdit ? '完成' : '编辑' }}
        </el-button>
      </div>
    </template>

    <el-row :gutter="20">
      <!-- 新建按钮卡片 -->
      <el-col v-if="isEdit" :span="6" :xs="12" :sm="8" :md="6">
        <div class="nav-card add-card" @click="handleAdd">
          <el-card shadow="hover">
            <div class="add-content">
              <i class="el-icon-plus add-icon" />
              <span class="add-text">新建</span>
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 导航卡片列表 -->
      <el-col
        v-for="record in records"
        :key="record.id"
        :span="6"
        :xs="12"
        :sm="8"
        :md="6"
      >
        <el-card
          class="nav-card"
          :class="{ 'edit-mode': isEdit }"
          shadow="hover"
        >
          <!-- 卡片头部 -->
          <div class="nav-card-header">
            <el-avatar
              :size="40"
              :src="record.logo"
              class="nav-logo"
            >
              {{ record.title.charAt(0) }}
            </el-avatar>
            <span class="nav-card-title">{{ record.title }}</span>
          </div>

          <!-- 卡片描述 -->
          <div class="nav-card-desc">{{ record.desc }}</div>

          <!-- 编辑模式下的操作按钮 -->
          <div v-if="isEdit" class="nav-card-actions">
            <el-tooltip content="向左移动" placement="top" :hide-after="1500">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-arrow-left"
                circle
                @click="handleSort(record.id, 'left')"
              />
            </el-tooltip>
            <el-tooltip content="向右移动" placement="top" :hide-after="1500">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-arrow-right"
                circle
                @click="handleSort(record.id, 'right')"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top" :hide-after="1500">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                circle
                @click="handleEdit(record)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :hide-after="1500">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                @click="handleDelete(record.id)"
              />
            </el-tooltip>
          </div>

          <!-- 非编辑模式下的链接列表 -->
          <div v-else class="nav-card-links">
            <el-link
              v-for="(link, index) in record.links"
              :key="index"
              :href="link.url"
              target="_blank"
              :underline="false"
              type="primary"
              class="nav-link"
            >
              {{ link.name }}
            </el-link>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑/新建对话框 -->
    <el-dialog
      :title="currentRecord.id ? '编辑导航' : '新建导航'"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="form"
        :model="currentRecord"
        :rules="rules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="图标" prop="logo">
          <el-input
            v-model="currentRecord.logo"
            placeholder="请输入图标链接地址"
          >
            <template #append>
              <el-button @click="previewLogo">
                预览
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input
            v-model="currentRecord.title"
            placeholder="请输入导航标题"
          />
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="currentRecord.desc"
            type="textarea"
            :rows="2"
            placeholder="请输入导航描述"
          />
        </el-form-item>

        <el-form-item label="链接" prop="links">
          <div
            v-for="(link, index) in currentRecord.links"
            :key="index"
            class="link-item"
          >
            <el-input
              v-model="link.name"
              placeholder="链接名称"
              class="link-input"
            />
            <el-input
              v-model="link.url"
              placeholder="链接地址"
              class="link-input"
            />
            <el-button
              v-if="currentRecord.links.length > 1"
              type="danger"
              icon="el-icon-delete"
              circle
              size="mini"
              @click="removeLink(index)"
            />
          </div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            class="add-link-btn"
            @click="addLink"
          >
            添加链接
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 图标预览对话框 -->
    <el-dialog
      title="图标预览"
      :visible.sync="previewVisible"
      width="300px"
      append-to-body
    >
      <div class="preview-container">
        <el-avatar
          :size="100"
          :src="currentRecord.logo"
        >
          {{ currentRecord.title ? currentRecord.title.charAt(0) : 'N' }}
        </el-avatar>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import { fetchNavigationRecords, createNavigationRecord, updateNavigationRecord, deleteNavigationRecord, sortNavigationRecord } from '@/api/navigation'

export default {
  name: 'NavigationContainer',

  data() {
    return {
      isEdit: false,
      records: [],
      dialogVisible: false,
      previewVisible: false,
      currentRecord: this.getInitialRecord(),
      rules: {
        title: [
          { required: true, message: '请输入导航标题', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '请输入导航描述', trigger: 'blur' },
          { max: 100, message: '描述不能超过100个字符', trigger: 'blur' }
        ],
        links: [
          {
            type: 'array',
            required: true,
            message: '请至少添加一个链接',
            trigger: 'change'
          }
        ]
      }
    }
  },

  created() {
    this.fetchRecords()
  },

  methods: {
    getInitialRecord() {
      return {
        id: '',
        title: '',
        desc: '',
        logo: '',
        links: [{ name: '', url: '' }]
      }
    },

    async fetchRecords() {
      try {
        const { data } = await fetchNavigationRecords()
        this.records = data
      } catch (error) {
        this.$message.error('获取导航数据失败')
        console.error('获取导航数据失败:', error)
      }
    },

    toggleEditMode() {
      this.isEdit = !this.isEdit
    },

    handleAdd() {
      this.currentRecord = this.getInitialRecord()
      this.dialogVisible = true
    },

    handleEdit(record) {
      this.currentRecord = JSON.parse(JSON.stringify(record))
      this.dialogVisible = true
    },

    async handleSave() {
      try {
        // 表单验证
        await this.$refs.form.validate()

        const recordData = {
          ...this.currentRecord,
          links: this.currentRecord.links || [] // 确保 links 字段存在
        }

        if (this.currentRecord.id) {
          // 更新现有记录
          await updateNavigationRecord(recordData)
        } else {
          // 新建记录 - 确保必要的字段都已设置
          const newRecord = {
            title: recordData.title,
            description: recordData.description || '',
            logo: recordData.logo || '',
            links: recordData.links || [],
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          }
          await createNavigationRecord(newRecord)
        }

        this.$message.success('保存成功')
        this.dialogVisible = false
        await this.fetchRecords() // 刷新列表

        // 重置表单
        this.resetForm()
      } catch (error) {
        if (error === false) {
          // 表单验证失败的情况
          return
        }
        this.$message.error('保存失败')
        console.error('保存失败:', error)
      }
    },

    async handleDelete(id) {
      try {
        await this.$confirm('确定要删除这条导航吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteNavigationRecord(id)
        this.$message.success('删除成功')
        this.fetchRecords()
      } catch (error) {
        if (error === 'cancel') return
        this.$message.error('删除失败')
        console.error('删除失败:', error)
      }
    },

    async handleSort(id, direction) {
      try {
        await sortNavigationRecord({ id, direction })
        this.$message.success('排序成功')
        this.fetchRecords()
      } catch (error) {
        this.$message.error('排序失败')
        console.error('排序失败:', error)
      }
    },

    addLink() {
      this.currentRecord.links.push({ name: '', url: '' })
    },

    removeLink(index) {
      this.currentRecord.links.splice(index, 1)
    },

    previewLogo() {
      if (!this.currentRecord.logo) {
        this.$message.warning('请先输入图标链接地址')
        return
      }
      this.previewVisible = true
    },

    resetForm() {
      this.currentRecord = {
        title: '',
        description: '',
        logo: '',
        links: []
      }
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    }
  }
}
</script>

<style scoped>
.nav-container {
  margin: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.nav-title {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.edit-mode-btn {
  border-radius: 20px;
  transition: all 0.3s ease;
}

.edit-mode-btn.is-editing {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
}

.nav-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.nav-card:hover {
  transform: translateY(-5px);
}

.add-card {
  cursor: pointer;
}

.add-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.add-icon {
  font-size: 30px;
  color: #409EFF;
  margin-bottom: 10px;
}

.add-text {
  color: #409EFF;
  font-size: 16px;
}

.nav-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.nav-logo {
  margin-right: 10px;
}

.nav-card-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.nav-card-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 15px;
  min-height: 40px;
}

.nav-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.nav-card-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nav-link {
  font-size: 14px;
}

.nav-link:hover {
  text-decoration: underline;
}

.link-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.link-input {
  flex: 1;
}

.add-link-btn {
  width: 100%;
  margin-top: 10px;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* 动画效果 */
.nav-card-enter-active,
.nav-card-leave-active {
  transition: all 0.3s ease;
}

.nav-card-enter,
.nav-card-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 编辑模式样式增强 */
.nav-card.edit-mode {
  position: relative;
}

.nav-card.edit-mode::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed #409EFF;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.nav-card.edit-mode:hover::before {
  opacity: 1;
}

/* 按钮动画效果 */
.el-button {
  transition: all 0.3s ease;
}

.el-button:active {
  transform: scale(0.95);
}

/* 链接输入框组样式 */
.link-group {
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #F8F9FA;
}

.link-group:hover {
  border-color: #409EFF;
}

/* 预览对话框样式 */
.preview-container {
  background-color: #F8F9FA;
  border-radius: 4px;
}

.preview-container .el-avatar {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

/* 表单样式优化 */
.el-form-item {
  margin-bottom: 22px;
}

.el-form-item__label {
  font-weight: 500;
}

/* 加载状态样式 */
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-state-text {
  font-size: 14px;
}

/* 工具提示样式优化 */
.el-tooltip__popper {
  font-size: 12px;
}

/* 滚动条美化 */
.nav-container ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.nav-container ::-webkit-scrollbar-thumb {
  background: #909399;
  border-radius: 3px;
}

.nav-container ::-webkit-scrollbar-track {
  background: #F5F7FA;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .nav-container {
    margin: 10px;
  }

  .nav-card-actions {
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }

  .link-item {
    flex-direction: column;
    gap: 5px;
  }

  .link-input {
    width: 100%;
  }

  .nav-title {
    font-size: 18px;
  }

  .nav-card-title {
    font-size: 14px;
  }

  .nav-card-desc {
    font-size: 12px;
    min-height: 32px;
  }
}
</style>
