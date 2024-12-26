// host/GroupTree.vue
<template>
  <div class="group-tree">
    <div class="group-header">
      <h3>主机分组</h3>
      <el-button
        type="text"
        icon="el-icon-plus"
        @click="handleAddGroup"
      >
        新增分组
      </el-button>
    </div>
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      :highlight-current="true"
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span class="count">({{ data.count || 0 }})</span>
          <span class="actions">
            <el-button
              type="text"
              icon="el-icon-edit"
              @click.stop="handleEditGroup(data)"
            />
            <el-button
              type="text"
              icon="el-icon-delete"
              @click.stop="handleDeleteGroup(node, data)"
            />
          </span>
        </span>
      </template>
    </el-tree>

    <!-- 分组表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增分组' : '编辑分组'"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form
        ref="formRef"
        :model="groupForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="groupForm.name" />
        </el-form-item>
        <el-form-item label="上级分组">
          <el-select
            v-model="groupForm.parentId"
            placeholder="请选择上级分组"
            clearable
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from '@vue/composition-api'
import { getGroups } from '@/api/group'

export default {
  name: 'GroupTree',
  setup(props, { root }) {
    const treeData = ref([])
    const loading = ref(false)

    const fetchGroups = async() => {
      try {
        loading.value = true
        const { data } = await getGroups()
        treeData.value = data
      } catch (error) {
        root.$message.error('获取分组数据失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchGroups()
    })

    return {
      treeData,
      loading,
      fetchGroups
    }
  }
}
</script>

<style lang="scss" scoped>
.group-tree {
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h3 {
      margin: 0;
    }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    .count {
      color: #909399;
      margin-left: 8px;
    }
    .actions {
      display: none;
    }
    &:hover .actions {
      display: inline-block;
    }
  }
}
</style>
