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
          <div>新建</div>
        </el-card>
      </el-col>

      <!-- <el-col v-for="(record, index) in records" :key="record.id" :span="6"></el-col> -->
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

    <nav-form
      v-if="currentRecord"
      :record="currentRecord"
      @cancel="cancelEdit"
      @save="saveRecord"
    />
  </el-card>
</template>

<script>
import NavForm from './navform.vue'
import { fetchNavigationRecords, createNavigationRecord, updateNavigationRecord, deleteNavigationRecord, sortNavigationRecord } from '@/api/navigation'

export default {
  components: { NavForm },

  data() {
    return {
      isEdit: false,
      records: [],
      currentRecord: null
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
      this.currentRecord = { id: null, title: '', desc: '', logo: '', links: [{}] }
    },

    editRecord(record) {
      this.currentRecord = { ...record }
    },

    cancelEdit() {
      this.currentRecord = null
    },

    async saveRecord(record) {
      try {
        if (record.id) {
          await updateNavigationRecord(record)
        } else {
          await createNavigationRecord(record)
        }
        this.$message.success('保存成功')
        this.fetchRecords()
        this.cancelEdit()
      } catch (error) {
        this.$message.error('保存失败')
      }
    },

    async deleteRecord(id) {
      try {
        await deleteNavigationRecord(id)
        this.$message.success('删除成功')
        this.fetchRecords()
      } catch (error) {
        this.$message.error('删除失败')
      }
    },

    async sortRecord(id, direction) {
      try {
        await sortNavigationRecord(id, direction)
        this.$message.success('排序成功')
        this.fetchRecords()
      } catch (error) {
        this.$message.error('排序失败')
      }
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
</style>
