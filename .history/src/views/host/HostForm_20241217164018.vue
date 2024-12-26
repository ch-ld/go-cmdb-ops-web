<!-- src/views/host/components/HostForm.vue -->
<template>
  <el-dialog
    :title="type === 'create' ? '添加主机' : '编辑主机'"
    :visible.sync="dialogVisible"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="主机名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入主机名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="IP地址" prop="ip">
        <el-input
          v-model="form.ip"
          placeholder="请输入IP地址"
        />
      </el-form-item>

      <el-form-item label="所属分组" prop="groupId">
        <el-cascader
          v-model="form.groupId"
          :options="groupOptions"
          :props="cascaderProps"
          placeholder="请选择所属分组"
          clearable
        />
      </el-form-item>

      <el-form-item label="主机状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择主机状态">
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
          <el-option label="维护中" value="maintenance" />
        </el-select>
      </el-form-item>

      <el-form-item label="负责人" prop="owner">
        <el-input
          v-model="form.owner"
          placeholder="请输入负责人"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createHost, updateHost, getHostGroups } from '@/api/host'

export default {
  name: 'HostForm',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'create'
    },
    hostData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
        name: '',
        ip: '',
        groupId: '',
        status: 'online',
        owner: '',
        remarks: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入主机名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入IP地址', trigger: 'blur' },
          { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入正确的IP地址格式', trigger: 'blur' }
        ],
        groupId: [
          { required: true, message: '请选择所属分组', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择主机状态', trigger: 'change' }
        ],
        owner: [
          { required: true, message: '请输入负责人', trigger: 'blur' }
        ]
      },
      groupOptions: [],
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true,
        emitPath: false
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    },
    hostData: {
      handler(val) {
        if (val && Object.keys(val).length > 0) {
          this.form = Object.assign({}, this.form, val)
        } else {
          this.resetForm()
        }
      },
      immediate: true
    }
  },
  created() {
    this.getGroupOptions()
  },
  methods: {
    async getGroupOptions() {
      try {
        const { data } = await getHostGroups()
        this.groupOptions = data
      } catch (error) {
        console.error('获取分组数据失败:', error)
      }
    },
    resetForm() {
      this.form = {
        name: '',
        ip: '',
        groupId: '',
        status: 'online',
        owner: '',
        remarks: ''
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    },
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        this.loading = true

        if (this.type === 'create') {
          await createHost(this.form)
          this.$message.success('添加成功')
        } else {
          await updateHost(this.hostData.id, this.form)
          this.$message.success('更新成功')
        }

        this.$emit('success')
        this.handleClose()
      } catch (error) {
        console.error(this.type === 'create' ? '添加失败:' : '更新失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
