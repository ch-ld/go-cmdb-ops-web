<template>
  <div class="nav-container">
    <div class="header">
      <h2>便捷导航</h2>
      <el-button @click="toggleEdit">{{ isEdit ? '完成' : '编辑' }}</el-button>
    </div>
    <el-row :gutter="20">
      <el-col v-if="isEdit" :span="6">
        <el-button type="primary" @click="addNewRecord">新建</el-button>
      </el-col>
      <el-col v-for="item in records" :key="item.id" :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-avatar :src="item.logo" />
              <span>{{ item.title }}</span>
              <el-button icon="el-icon-edit" @click="setRecord(item)" />
              <el-button icon="el-icon-delete" @click="handleDelete(item)" />
            </div>
          </template>
          <p>{{ item.desc }}</p>
          <el-button v-for="link in item.links" :key="link.url" :href="link.url" target="_blank">{{ link.name }}</el-button>
        </el-card>
      </el-col>
    </el-row>
    <NavForm :visible="!!record" :record="record" @onCancel="resetRecord" @onOk="handleSubmit" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
// import { ElCard, ElAvatar, ElButton, ElRow, ElCol } from 'element-ui'
import NavForm from './NavForm'
import { http } from 'libs'

export default {
  components: { NavForm },
  setup() {
    const isEdit = ref(false)
    const records = ref([])
    const record = ref(null)

    onMounted(() => {
      fetchRecords()
    })

    const fetchRecords = async() => {
      const response = await http.get('/api/home/navigation/')
      records.value = response.data
    }

    const toggleEdit = () => {
      isEdit.value = !isEdit.value
    }

    const addNewRecord = () => {
      record.value = { links: [] }
    }

    const setRecord = (item) => {
      record.value = item
    }

    const resetRecord = () => {
      record.value = null
    }

    const handleDelete = async(item) => {
      await http.delete('/api/home/navigation/', { params: { id: item.id }})
      fetchRecords()
    }

    const handleSubmit = () => {
      fetchRecords()
      resetRecord()
    }

    return {
      isEdit,
      records,
      record,
      toggleEdit,
      addNewRecord,
      setRecord,
      resetRecord,
      handleDelete,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.nav-container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  align-items: center;
}
</style>
