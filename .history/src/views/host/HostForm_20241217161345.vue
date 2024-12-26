// host/HostForm.vue
<template>
  <el-dialog
    :title="type === 'add' ? '新增主机' : '编辑主机'"
    :visible.sync="dialogVisible"
    width="50%"
    @closed="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="主机名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入主机名称" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="IP地址" prop="ip">
            <el-input v-model="form.ip" placeholder="请输入IP地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属分组" prop="groupId">
            <el-cascader
              v-model="form.groupId"
              :options="groupOptions"
              :props="cascaderProps"
              clearable
              placeholder="请选择所属分组"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option label="在线" value="online" />
              <el-option label="离线" value="offline" />
              <el-option label="维护中" value="maintenance" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="归属信息" prop="owner">
            <el-input v-model="form.owner" placeholder="请输入归属信息" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="监控状态" prop="monitor">
            <el-select v-model="form.monitor" placeholder="请选择监控状态">
              <el-option label="正常" value="normal" />
              <el-option label="警告" value="warning" />
              <el-option label="异常" value="error" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注信息" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>

      <el-form-item label="SSH配置">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item prop="sshPort">
              <el-input-number
                v-model="form.sshPort"
                :min="1"
                :max="65535"
                placeholder="SSH端口"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="sshUsername">
              <el-input
                v-model="form.sshUsername"
                placeholder="SSH用户名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="sshPassword">
              <el-input
                v-model="form.sshPassword"
                type="password"
                placeholder="SSH密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { addHost, updateHost } from '@/api/host'
import { getGroups } from '@/api/group'

export default {
  name: 'HostForm',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'add'
    },
    data: {
      type: Object,
      default: () => null
    }
  },
  emits: ['update:visible', 'success'],
  setup(props, { emit }) {
    const formRef = ref(null)
    const loading = ref(false)
    const dialogVisible = ref(false)
    const groupOptions = ref([])

    // 表单数据
    const form = reactive({
      name: '',
      ip: '',
      groupId: null,
      status: 'online',
      owner: '',
      monitor: 'normal',
      remarks: '',
      sshPort: 22,
      sshUsername: '',
      sshPassword: ''
    })

    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入主机名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      ip: [
        { required: true, message: '请输入IP地址', trigger: 'blur' },
        { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入正确的IP地址', trigger: 'blur' }
      ],
      groupId: [
        { required: true, message: '请选择所属分组', trigger: 'change' }
      ],
      sshPort: [
        { required: true, message: '请输入SSH端口', trigger: 'blur' }
      ],
      sshUsername: [
        { required: true, message: '请输入SSH用户名', trigger: 'blur' }
      ]
    }

    // Cascader配置
    const cascaderProps = {
      value: 'id',
      label: 'name',
      children: 'children',
      checkStrictly: true,
      emitPath: false
    }

    // 监听visible变化
    watch(() => props.visible, (val) => {
      dialogVisible.value = val
      if (val) {
        fetchGroups()
        if (props.data) {
          Object.assign(form, props.data)
        }
      }
    })

    // 监听dialogVisible变化
    watch(dialogVisible, (val) => {
      emit('update:visible', val)
    })

    // 获取分组数据
    const fetchGroups = async() => {
      try {
        const { data } = await getGroups()
        groupOptions.value = data
      } catch (error) {
        this.$message.error('获取分组数据失败')
      }
    }

    // 提交表单
    const submitForm = async() => {
      if (!formRef.value) return

      try {
        await formRef.value.validate()
        loading.value = true

        if (props.type === 'add') {
          await addHost(form)
          this.$message.success('添加成功')
        } else {
          await updateHost(form)
          this.$message.success('更新成功')
        }

        dialogVisible.value = false
        emit('success')
      } catch (error) {
        this.$message.error(props.type === 'add' ? '添加失败' : '更新失败')
      } finally {
        loading.value = false
      }
    }

    // 关闭对话框
    const handleClose = () => {
      formRef.value?.resetFields()
      Object.assign(form, {
        name: '',
        ip: '',
        groupId: null,
        status: 'online',
        owner: '',
        monitor: 'normal',
        remarks: '',
        sshPort: 22,
        sshUsername: '',
        sshPassword: ''
      })
    }

    return {
      formRef,
      loading,
      dialogVisible,
      form,
      rules,
      groupOptions,
      cascaderProps,
      submitForm,
      handleClose
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select {
  width: 100%;
}
.el-cascader {
  width: 100%;
}
.el-input-number {
  width: 100%;
}
</style>
