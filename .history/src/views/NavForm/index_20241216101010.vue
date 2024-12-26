<template>
  <div class="container">
    <div class="container-header">便捷导航</div>
    <div class="container-body">
      <div v-if="isEdit" class="add-new" @click="setRecord({ links: [{}] })">
        <PlusOutlined />
        <span>新建</span>
      </div>
      <div class="row">
        <div v-for="item in records" :key="item.id" class="item-block">
          <Card
            hoverable
            :actions="isEdit ? [<LeftSquareOutlined @click="
            handle-sort-item-
            'up')"
          />, <RightSquareOutlined @click="handleSort(item, 'down')" />, <EditOutlined @click="setRecord(item)" />] : item.links.map(x => <a :href="x.url" target="_blank">{{ x.name }}</a>)"
          >
          <Card.Meta
            :avatar="<Avatar :src='item.logo' />"
            :title="item.title"
            :description="item.desc"
          />
          <CloseOutlined v-if="isEdit" class="delete-icon" @click="handleDelete(item)" />
          </Card>
        </div>
      </div>
    </div>
    <AuthButton @click="toggleEdit">{{ isEdit ? '完成' : '编辑' }}</AuthButton>
    <NavForm v-if="record" :record="record" @cancel="setRecord(null)" @ok="handleSubmit" />
  </div>
</template>

<script>
import { Avatar, Card } from 'antd'
import { LeftSquareOutlined, RightSquareOutlined, EditOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons'
import NavForm from './NavForm'
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
        .then(() => this.fetchRecords())
    },
    handleDelete(item) {
      this.$confirm({
        title: '操作确认',
        content: `确定要删除【${item.title}】？`,
        onOk: () => {
          http.delete('/api/home/navigation/', { params: { id: item.id }})
            .then(this.fetchRecords)
        }
      })
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

.delete-icon {
  color: red;
  cursor: pointer;
}
</style>
