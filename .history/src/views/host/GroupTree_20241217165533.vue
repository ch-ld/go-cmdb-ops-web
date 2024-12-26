<!-- src/views/host/components/GroupForm.vue -->
<template>
  <div class="host-group-management">
    <!-- 左侧树形分组列表 -->
    <div class="group-tree-container">
      <div class="tree-header">
        <el-button type="primary" size="small" @click="handleAdd">新增分组</el-button>
      </div>
      <el-tree
        ref="groupTree"
        :data="treeData"
        :props="defaultProps"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span class="operations">
            <el-button
              type="text"
              size="mini"
              @click.stop="handleEdit(data)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="mini"
              class="danger"
              @click.stop="handleDelete(node, data)"
            >
              删除
            </el-button>
          </span>
        </span>
      </el-tree>
    </div>

    <!-- 分组表单弹窗 -->
    <el-dialog
      :title="type === 'create' ? '新增分组' : '编辑分组'"
      :visible.sync="dialogVisible"
      width="500px"
      @close="handleClose"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="分组名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入分组名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="上级分组" prop="parentId">
          <el-cascader
            v-model="form.parentId"
            :options="groupOptions"
            :props="cascaderProps"
            placeholder="请选择上级分组"
            clearable
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="0"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      title="删除确认"
      :visible.sync="deleteDialogVisible"
      width="400px"
    >
      <div class="delete-confirm">
        <i class="el-icon-warning" />
        <p>确定要删除分组 "{{ deleteGroup.name }}" 吗？</p>
        <p class="warning-text">删除后将无法恢复，请谨慎操作！</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="confirmDelete">确定删除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createHostGroup, updateHostGroup, deleteHostGroup } from '@/api/host'

export default {
  name: 'GroupForm',
  props: {
    type: {
      type: String,
      default: 'create'
    },
    groupData: {
      type: Object,
      default: () => ({})
    },
    groupOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      deleteDialogVisible: false,
      loading: false,
      deleteLoading: false,
      deleteGroup: {},
      form: {
        name: '',
        parentId: null,
        sort: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入分组名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      },
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true,
        emitPath: false
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  methods: {
    show() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
      this.$emit('close')
    },
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        this.loading = true

        if (this.type === 'create') {
          await createHostGroup(this.form)
          this.$message.success('创建成功')
        } else {
          await updateHostGroup(this.groupData.id, this.form)
          this.$message.success('更新成功')
        }

        this.$emit('success')
        this.handleClose()
      } catch (error) {
        console.error(error)
        this.$message.error(error.message || '操作失败')
      } finally {
        this.loading = false
      }
    },
    // 处理删除分组
    handleDelete(node, data) {
      this.deleteGroup = data
      this.deleteDialogVisible = true
    },
    // 确认删除分组
    async confirmDelete() {
      try {
        this.deleteLoading = true
        await deleteHostGroup(this.deleteGroup.id)
        this.$message.success('删除成功')
        this.deleteDialogVisible = false
        this.$emit('success')
      } catch (error) {
        console.error(error)
        this.$message.error(error.message || '删除失败')
      } finally {
        this.deleteLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.host-group-management {
  .group-tree-container {
    border: 1px solid #e6e6e6;
    border-radius: 4px;

    .tree-header {
      padding: 10px;
      border-bottom: 1px solid #e6e6e6;
    }
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;

    .operations {
      display: none;
    }

    &:hover .operations {
      display: inline-block;
    }
  }

  .delete-confirm {
    text-align: center;
    padding: 20px 0;

    i {
      font-size: 24px;
      color: #e6a23c;
      margin-bottom: 10px;
    }

    .warning-text {
      color: #f56c6c;
      font-size: 12px;
      margin-top: 10px;
    }
  }

  .danger {
    color: #f56c6c;

    &:hover {
      color: #f78989;
    }
  }
}
</style>
