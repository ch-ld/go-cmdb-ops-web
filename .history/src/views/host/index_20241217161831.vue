// views/host/index.vue
<template>
  <div class="app-container">
    <el-container>
      <!-- 左侧分组树 -->
      <el-aside width="250px">
        <GroupTree
          :data="groupData"
          @node-click="handleGroupSelect"
        />
      </el-aside>

      <!-- 右侧主要内容区 -->
      <el-main>
        <div class="toolbar">
          <el-row :gutter="20" type="flex" justify="space-between" align="middle">
            <el-col :span="6">
              <el-input
                v-model="searchQuery"
                placeholder="输入主机名称/IP搜索"
                clearable
                prefix-icon="el-icon-search"
                @input="handleSearch"
              />
            </el-col>
            <el-col :span="18">
              <el-button-group>
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
                  新增主机
                </el-button>
                <el-button
                  type="info"
                  icon="el-icon-check-circle"
                  @click="handleValidate"
                >
                  验证
                </el-button>
                <el-button
                  :type="isAllSelected ? 'success' : 'info'"
                  icon="el-icon-check"
                  @click="handleSelectAll"
                >
                  全选
                </el-button>
                <el-button
                  icon="el-icon-folder"
                  @click="showUngrouped"
                >
                  未分类
                </el-button>
              </el-button-group>
              <el-button-group class="ml-2">
                <el-button icon="el-icon-setting" @click="showSettings">
                  设置
                </el-button>
              </el-button-group>
            </el-col>
          </el-row>
        </div>

        <!-- 主机列表 -->
        <el-table
          v-loading="loading"
          :data="filteredHosts"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="主机名称" min-width="120">
            <template #default="{ row }">
              <el-link type="primary" @click="showDetail(row)">
                {{ row.name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="ip" label="IP地址" width="140" />
          <el-table-column prop="monitor" label="监控信息" min-width="120">
            <template #default="{ row }">
              <el-tag :type="getMonitorStatusType(row.monitor)">
                {{ row.monitor }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="归属信息" width="120" />
          <el-table-column prop="remarks" label="备注信息" min-width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button
                  size="small"
                  type="primary"
                  icon="el-icon-edit"
                  @click="handleEdit(row)"
                />
                <el-button
                  size="small"
                  type="danger"
                  icon="el-icon-delete"
                  @click="handleDelete(row)"
                />
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :current-page="page.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="page.size"
            :total="page.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-main>
    </el-container>

    <!-- 新增/编辑主机弹窗 -->
    <HostForm
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :type="formType"
      :data="currentHost"
      @success="handleFormSuccess"
    />

    <!-- 设置抽屉 -->
    <el-drawer
      title="系统设置"
      :visible.sync="settingsVisible"
      direction="rtl"
      size="30%"
    >
      <HostSettings @update="handleSettingsUpdate" />
    </el-drawer>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from '@vue/composition-api'
import GroupTree from './components/GroupTree.vue'
import HostForm from './components/HostForm.vue'
import HostSettings from './components/HostSettings.vue'
// eslint-disable-next-line no-unused-vars
import { getHosts, deleteHost, validateHosts } from '@/api/host'

export default {
  name: 'HostManagement',
  components: {
    GroupTree,
    HostForm,
    HostSettings
  },
  setup(props, { root }) { // 注意这里添加 root 参数
    const loading = ref(false)
    const searchQuery = ref('')
    const dialogVisible = ref(false)
    const settingsVisible = ref(false)
    const formType = ref('add')
    const currentHost = ref(null)
    const selectedHosts = ref([])
    const isAllSelected = ref(false)

    const page = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    const hosts = ref([])
    const filteredHosts = ref([])

    // 获取主机列表
    const fetchHosts = async() => {
      try {
        loading.value = true
        const { data } = await getHosts({
          page: page.current,
          size: page.size,
          query: searchQuery.value
        })
        hosts.value = data.list
        filteredHosts.value = data.list
        page.total = data.total
      } catch (error) {
        root.$message.error('获取主机列表失败')
      } finally {
        loading.value = false
      }
    }

    // 处理搜索
    const handleSearch = () => {
      if (!searchQuery.value) {
        filteredHosts.value = hosts.value
        return
      }
      filteredHosts.value = hosts.value.filter(
        host =>
          host.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          host.ip.includes(searchQuery.value)
      )
    }

    // 处理删除
    const handleDelete = async(row) => {
      try {
        await root.$confirm('确认删除该主机？', '提示', {
          type: 'warning'
        })
        await deleteHost(row.id)
        root.$message.success('删除成功')
        fetchHosts()
      } catch (error) {
        if (error !== 'cancel') {
          root.$message.error('删除失败')
        }
      }
    }

    // 处理编辑
    const handleEdit = (row) => {
      currentHost.value = { ...row }
      formType.value = 'edit'
      dialogVisible.value = true
    }

    // 处理新增
    const handleAdd = () => {
      currentHost.value = null
      formType.value = 'add'
      dialogVisible.value = true
    }

    onMounted(() => {
      fetchHosts()
    })

    return {
      loading,
      searchQuery,
      dialogVisible,
      settingsVisible,
      formType,
      currentHost,
      selectedHosts,
      isAllSelected,
      page,
      hosts,
      filteredHosts,
      handleSearch,
      handleDelete,
      handleEdit,
      handleAdd,
      fetchHosts
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  height: 100%;
  .toolbar {
    margin-bottom: 20px;
  }
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
  .el-aside {
    background: #fff;
    margin-right: 20px;
    padding: 20px;
    border-radius: 4px;
  }
  .ml-2 {
    margin-left: 8px;
  }
}
</style>
