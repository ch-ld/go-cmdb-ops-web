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
import { ref, reactive } from 'vue'
import { getGroups, addGroup, updateGroup, deleteGroup } from '@/api/group'

export default {
  name: 'GroupTree',
  emits: ['node-click'],
  setup(props, { emit }) {
    const treeRef = ref(null)
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const treeData = ref([])

    const defaultProps = {
      children: 'children',
      label: 'name'
    }

    const groupForm = reactive({
      id: null,
      name: '',
      parentId: null
    })

    const rules = {
      name: [
        { required: true, message: '请输入分组名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ]
    }

    // 获取分组数据
    const fetchGroups = async() => {
      try {
        const { data } = await getGroups()
        treeData.value = data
      } catch (error) {
        this.$message.error('获取分组数据失败')
      }
    }

    // 处理节点点击
    const handleNodeClick = (data) => {
      emit('node-click', data)
    }

    // 处理添加分组
    const handleAddGroup = () => {
      dialogType.value = 'add'
      groupForm.id = null
      groupForm.name = ''
      groupForm.parentId = null
      dialogVisible.value = true
    }

    // 处理编辑分组
    const handleEditGroup = (data) => {
      dialogType.value = 'edit'
      groupForm.id = data.id
      groupForm.name = data.name
      groupForm.parentId = data.parentId
      dialogVisible.value = true
    }

    // 处理删除分组
    const handleDeleteGroup = async(node, data) => {
      try {
        await this.$confirm('确认删除该分组？', '提示', {
          type: 'warning'
        })
        await deleteGroup(data.id)
        this.$message.success('删除成功')
        fetchGroups()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    }

    // 提交表单
    const submitForm = async() => {
      try {
        const valid = await this.$refs.formRef.validate()
        if (!valid) return

        if (dialogType.value === 'add') {
          await addGroup(groupForm)
          this.$message.success('添加成功')
        } else {
          await updateGroup(groupForm)
          this.$message.success('更新成功')
        }

        dialogVisible.value = false
        fetchGroups()
      } catch (error) {
        this.$message.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
      }
    }

    // 初始化
    fetchGroups()

    return {
      treeRef,
      dialogVisible,
      dialogType,
      treeData,
      defaultProps,
      groupForm,
      rules,
      handleNodeClick,
      handleAddGroup,
      handleEditGroup,
      handleDeleteGroup,
      submitForm
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
