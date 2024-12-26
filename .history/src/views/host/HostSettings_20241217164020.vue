<!-- src/views/host/components/HostSettings.vue -->
<template>
  <el-dialog
    title="监控配置"
    :visible.sync="dialogVisible"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="right"
    >
      <el-form-item label="监控状态" prop="monitorStatus">
        <el-switch
          v-model="form.monitorStatus"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>

      <el-form-item label="监控周期(分钟)" prop="monitorInterval">
        <el-input-number
          v-model="form.monitorInterval"
          :min="1"
          :max="60"
          :disabled="!form.monitorStatus"
        />
      </el-form-item>

      <el-form-item label="告警阈值" prop="alarmThreshold">
        <el-input-number
          v-model="form.alarmThreshold"
          :min="0"
          :max="100"
          :disabled="!form.monitorStatus"
        />
      </el-form-item>

      <el-form-item label="告警通知方式" prop="notifyType">
        <el-checkbox-group v-model="form.notifyType" :disabled="!form.monitorStatus">
          <el-checkbox label="email">邮件</el-checkbox>
          <el-checkbox label="sms">短信</el-checkbox>
          <el-checkbox label="webhook">Webhook</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item
        v-if="form.notifyType.includes('email')"
        label="通知邮箱"
        prop="notifyEmail"
      >
        <el-input
          v-model="form.notifyEmail"
          placeholder="请输入通知邮箱，多个邮箱用分号分隔"
          :disabled="!form.monitorStatus"
        />
      </el-form-item>

      <el-form-item
        v-if="form.notifyType.includes('webhook')"
        label="Webhook地址"
        prop="webhookUrl"
      >
        <el-input
          v-model="form.webhookUrl"
          placeholder="请输入Webhook地址"
          :disabled="!form.monitorStatus"
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
import { updateHostMonitorSettings } from '@/api/host'

export default {
  name: 'HostSettings',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    hostId: {
      type: [String, Number],
      required: true
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
        monitorStatus: true,
        monitorInterval: 5,
        alarmThreshold: 80,
        notifyType: ['email'],
        notifyEmail: '',
        webhookUrl: ''
      },
      rules: {
        monitorInterval: [
          { required: true, message: '请输入监控周期', trigger: 'blur' }
        ],
        alarmThreshold: [
          { required: true, message: '请输入告警阈值', trigger: 'blur' }
        ],
        notifyType: [
          { required: true, message: '请选择告警通知方式', trigger: 'change' }
        ],
        notifyEmail: [
          { required: true, message: '请输入通知邮箱', trigger: 'blur' },
          {
            pattern: /^([a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,5}[\;]*)+$/,
            message: '请输入正确的邮箱格式，多个邮箱用分号分隔',
            trigger: 'blur'
          }
        ],
        webhookUrl: [
          { required: true, message: '请输入Webhook地址', trigger: 'blur' },
          { type: 'url', message: '请输入正确的URL地址', trigger: 'blur' }
        ]
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
    settings: {
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
  methods: {
    resetForm() {
      this.form = {
        monitorStatus: true,
        monitorInterval: 5,
        alarmThreshold: 80,
        notifyType: ['email'],
        notifyEmail: '',
        webhookUrl: ''
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

        await updateHostMonitorSettings(this.hostId, this.form)
        this.$message.success('更新成功')
        this.$emit('success')
        this.handleClose()
      } catch (error) {
        console.error('更新监控配置失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
