<template>
  <div class="container">
    <div class="container-header">便捷导航</div>
    <div class="container-body">
      <div v-if="isEdit" class="add-new" @click="setRecord({ links: [{}] })">
        <span class="icon">+</span>
        <span>新建</span>
      </div>
      <div class="row">
        <div v-for="item in records" :key="item.id" class="item-block">
          <div class="card">
            <div class="card-header">
              <img :src="item.logo" alt="logo" class="avatar">
              <div class="card-title">{{ item.title }}</div>
            </div>
            <div class="card-description">{{ item.desc }}</div>
            <div v-if="isEdit" class="card-actions">
              <button @click="handleSort(item, 'up')">上移</button>
              <button @click="handleSort(item, 'down')">下移</button>
              <button @click="setRecord(item)">编辑</button>
              <span class="delete-icon" @click="handleDelete(item)">×</span>
            </div>
            <div v-else>
              <div class="links">
                <a v-for="link in item.links" :key="link.name" :href="link.url" target="_blank">{{ link.name }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button @click="toggleEdit">{{ isEdit ? '完成' : '编辑' }}</button>
    <NavForm v-if="record" :record="record" @cancel="setRecord(null)" @ok="handleSubmit" />
  </div>
</template>

<script>
import { http } from 'libs'

export default {
  data() {
    return {
      isEdit: false,
      records: [],
      record: null
    }
  },
  created() {
    this.fetchRecords()
  },
  methods: {
    fetchRecords() {
      http.get('/api/home/navigation/')
        .then(res => {
          this.records = res
        })
    },
    toggleEdit() {
      this.isEdit = !this.isEdit
    },
    handleSubmit() {
      this.fetchRecords()
      this.record = null
    },
    handleSort(item, direction) {
      http.patch('/api/home/navigation/', { id: item.id, sort: direction })
        .then(this.fetchRecords)
    },
    handleDelete(item) {
      if (confirm(`确定要删除【${item.title}】？`)) {
        http.delete('/api/home/navigation/', { params: { id: item.id }})
          .then(this.fetchRecords)
      }
    },
    setRecord(record) {
      this.record = record
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #fff;
}

.container-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.container-body {
  display: flex;
  flex-wrap: wrap;
}

.add-new {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 20px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.item-block {
  flex: 1 1 24%;
  margin-bottom: 20px;
}

.card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
}

.card-header {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.card-title {
  font-weight: bold;
}

.card-description {
  margin: 10px 0;
}

.card-actions {
  display: flex;
  justify-content: space-between;
}

.delete-icon {
  color: red;
  cursor: pointer;
  margin-left: 10px;
}
</style>
