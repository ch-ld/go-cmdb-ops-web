// host/HostSettings.vue
<template>
  <div class="host-settings">
    <el-form
      ref="formRef"
      :model="settings"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="自动刷新" prop="autoRefresh">
        <el-switch
          v-model="settings.autoRefresh"
          @change="handleAutoRefreshChange"
        />
      </el-form-item>

      <el-form-item
        v-if="settings.autoRefresh"
        label="刷新间隔(秒)"
        prop="refreshInterval"
      >
        <el-input-number
          v-model="settings.refreshInterval"
          :min="5"
          :max="300"
          @change="handleIntervalChange"
        />
      </el-form-item>

      <el-form-item label="显示列" prop="visibleColumns">
        <el-checkbox-group v-model="settings.visibleColumns">
          <el-checkbox label="name">主机名称</el-checkbox>
          <el-checkbox label="ip">IP地址</el-checkbox>
          <el-checkbox label="monitor">监控信息</el-checkbox>
          <el-checkbox label="owner">归属信息</el-checkbox>
          <el-checkbox label="remarks">备注信息</el-checkbox>
          <el-checkbox label="status">状态</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="默认分页大小" prop="pageSize">
        <el-select v-model="settings.pageSize">
          <el-option :value="10" label="10条/页" />
          <el-option :value="20" label="20条/页" />
          <el-option :value="50" label="50条/页" />
          <el-option :value="100" label="100条/页" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
        <el-button @click="resetSettings">重置默认</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

const DEFAULT_SETTINGS = {
  autoRefresh: false,
  refreshInterval: 30,
  visibleColumns: ['name', 'ip', 'monitor', 'owner', 'remarks', 'status'],
  pageSize: 20
}

export default {
  name: 'HostSettings',
  emits: ['update'],
  setup(props, { emit }) {
    const formRef = ref(null)

    // 从localStorage加载设置或使用默认值
    const loadSettings = () => {
      const stored = localStorage.getItem('hostSettings')
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS
    }

    const settings = reactive(loadSettings())

    const rules = {
      refreshInterval: [
        { required: true, message: '请输入刷新间隔', trigger: 'blur' }
      ],
      visibleColumns: [
        { type: 'array', required: true, message: '请至少选择一列', trigger: 'change' }
      ],
      pageSize: [
        { required: true, message: '请选择默认分页大小', trigger: 'change' }
      ]
    }

    // 处理自动刷新变化
    const handleAutoRefreshChange = (val) => {
      if (!val) {
        emit('update', { ...settings, autoRefresh: false })
      }
    }

    // 处理刷新间隔变化
    const handleIntervalChange = (val) => {
      if (settings.autoRefresh) {
        emit('update', { ...settings, refreshInterval: val })
      }
    }

    // 保存设置
    const saveSettings = async() => {
      if (!formRef.value) return

      try {
        await formRef.value.validate()
        localStorage.setItem('hostSettings', JSON.stringify(settings))
        emit('update', settings)
        this.$message.success('设置保存成功')
      } catch (error) {
        this.$message.error('设置保存失败')
      }
    }

    // 重置设置
    const resetSettings = () => {
      Object.assign(settings, DEFAULT_SETTINGS)
      localStorage.removeItem('hostSettings')
      emit('update', settings)
      this.$message.success('设置已重置')
    }

    return {
      formRef,
      settings,
      rules,
      handleAutoRefreshChange,
      handleIntervalChange,
      saveSettings,
      resetSettings
    }
  }
}
</script>

<style lang="scss" scoped>
.host-settings {
  padding: 20px;
  .el-select {
    width: 100%;
  }
  .el-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
