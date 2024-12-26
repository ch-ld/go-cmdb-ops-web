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
<template>
  <el-card class="nav-container" header="便捷导航">
    <template #header>
      <div class="nav-header">
        <span>便捷导航</span>
        <el-button
          type="primary"
          size="small"
          @click="toggleEditMode">{{ isEdit ? '完成' : '编辑' }}</el-button>
      </div>
    </template>

    <el-row :gutter="20">
      <el-col v-if="isEdit" :span="6">
        <el-card
          class="add-card"
          @click="addNewRecord">
          <div class="add-icon">+</div>
          <div>新建</div>
        </el-card>
      </el-col>

      <el-col v-for="(record, index) in records" :key="record.id" :span="6">
        <el-card
          class="record-card"
          :hoverable="true">

          <template #header>
            <div class="record-header">
              <el-avatar :src="record.logo"></el-avatar>
              <span>{{ record.title }}</span>
            </div>
          </template>

          <div>{{ record.desc }}</div>

          <template v-if="isEdit">
            <div class="actions">
              <el-button icon="el-icon-arrow-up" size="mini" @click="sortRecord(index, 'up')"></el-button>
              <el-button icon="el-icon-arrow-down" size="mini" @click="sortRecord(index, 'down')"></el-button>
              <el-button icon="el-icon-edit" size="mini" @click="editRecord(record)"></el-button>
              <el-button icon="el-icon-delete" size="mini" type="danger" @click="deleteRecord(record.id)"></el-button>
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
      @save="saveRecord"/>
  </el-card>
</template>

<script>
import NavForm from './NavForm.vue';

export default {
  components: { NavForm },

  data() {
    return {
      isEdit: false,
      records: [],
      currentRecord: null,
    };
  },

  methods: {
    toggleEditMode() {
      this.isEdit = !this.isEdit;
    },

    fetchRecords() {
      // 假设通过API获取数据
      this.records = [
        // 示例数据
        { id: 1, title: '示例1', desc: '描述1', logo: '', links: [{ name: '链接1', url: '#' }] },
        { id: 2, title: '示例2', desc: '描述2', logo: '', links: [{ name: '链接2', url: '#' }] },
      ];
    },

    addNewRecord() {
      this.currentRecord = { id: null, title: '', desc: '', logo: '', links: [{}] };
    },

    editRecord(record) {
      this.currentRecord = { ...record };
    },

    cancelEdit() {
      this.currentRecord = null;
    },

    saveRecord(record) {
      if (record.id) {
        const index = this.records.findIndex(item => item.id === record.id);
        this.$set(this.records, index, record);
      } else {
        record.id = Date.now(); // 临时ID生成
        this.records.push(record);
      }
      this.cancelEdit();
    },

    deleteRecord(id) {
      this.records = this.records.filter(item => item.id !== id);
    },

    sortRecord(index, direction) {
      if (direction === 'up' && index > 0) {
        [this.records[index - 1], this.records[index]] = [this.records[index], this.records[index - 1]];
      } else if (direction === 'down' && index < this.records.length - 1) {
        [this.records[index], this.records[index + 1]] = [this.records[index + 1], this.records[index]];
      }
    },
  },

  mounted() {
    this.fetchRecords();
  },
};
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
