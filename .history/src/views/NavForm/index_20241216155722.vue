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
        <!-- 新建按钮 -->
        <div @click="addNewRecord">
          <el-card class="add-card">
            <div class="add-icon">+</div>
            <div>新建</div>
          </el-card>
        </div>
      </el-col>

      <el-col v-for="(record) in records" :key="record.id" :span="6">
        <el-card
          class="record-card"
          :hoverable="true"
        >
          <!-- 记录内容 -->
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="visible" :title="currentRecord.id ? '编辑导航' : '新建导航'" width="50%">
      <!-- 表单内容 -->
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      isEdit: true, // 确保为 true，显示“新建”按钮
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

  methods: {
    toggleEditMode() {
      this.isEdit = !this.isEdit
    },

    addNewRecord() {
      console.log('New record clicked') // 检查是否触发
      this.currentRecord = {
        id: null,
        title: '',
        desc: '',
        logo: '',
        links: [{ name: '', url: '' }]
      }
      this.visible = true
    }

    // 其他方法...
  }
}
</script>
