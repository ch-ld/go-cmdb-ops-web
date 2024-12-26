<!-- src/views/host/index.vue -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧分组树 -->
      <el-col :span="4">
        <group-tree @node-click="handleGroupSelect" />
      </el-col>

      <!-- 右侧主机列表 -->
      <el-col :span="20">
        <div class="filter-container">
          <el-input
            v-model="listQuery.keyword"
            placeholder="请输入主机名称或IP"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
          <el-button
            v-waves
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            @click="handleFilter"
          >
            搜索
          </el-button>
          <el-button
            class="filter-item"
            style="margin-left: 10px;"
            type="primary"
            icon="el-icon-plus"
            @click="handleCreate"
          >
            添加主机
          </el-button>
          <el-button
            v-if="selectedHosts.length > 0"
            class="filter-item"
            type="danger"
            icon="el-icon-delete"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>

        <el-table
          v-loading="listLoading"
          :data="hostList"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="主机名称" prop="name" align="center" min-width="120">
            <template slot-scope="{row}">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="IP地址" prop="ip" align="center" min-width="120" />
          <el-table-column label="状态" width="100" align="center">
            <template slot-scope="{row}">
              <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
                {{ row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="分组" prop="groupName" align="center" min-width="120" />
          <el-table-column label="创建时间" align="center" width="180">
            <template slot-scope="{row}">
              <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-setting"
                @click="handleMonitorSettings(row)"
              >
                监控配置
              </el-button>
              <el-button
                size="mini"
                @click="handleUpdate(row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 主机表单弹窗 -->
    <host-form
      ref="hostForm"
      :visible.sync="dialogVisible"
      :type="dialogType"
      :host-data="currentHost"
      @success="handleFormSuccess"
    />

    <!-- 监控设置弹窗 -->
    <host-settings
      ref="hostSettings"
      :visible.sync="settingsVisible"
      :host-id="currentHost.id"
      :settings="currentHost.monitorSettings"
      @success="handleSettingsSuccess"
    />
  </div>
</template>

<script>
import { getHostList, deleteHost, batchDeleteHosts } from '@/api/host'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import GroupTree from './host/GroupTree'
import HostForm from './host/HostForm'
import HostSettings from './host/HostSettings'

export default {
  name: 'HostManagement',
  components: {
    Pagination,
    GroupTree,
    HostForm,
    HostSettings
  },
  directives: { waves },
  data() {
    return {
      listLoading: false,
      hostList: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: '',
        groupId: undefined
      },
      dialogVisible: false,
      dialogType: 'create',
      currentHost: {},
      settingsVisible: false,
      selectedHosts: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      try {
        this.listLoading = true
        const { data } = await getHostList(this.listQuery)
        this.hostList = data.items
        this.total = data.total
      } catch (error) {
        console.error('获取主机列表失败:', error)
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleGroupSelect(groupId) {
      this.listQuery.groupId = groupId
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.dialogType = 'create'
      this.currentHost = {}
      this.dialogVisible = true
    },
    handleUpdate(row) {
      this.dialogType = 'update'
      this.currentHost = Object.assign({}, row)
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该主机?', '提示', {
          type: 'warning'
        })
        await deleteHost(row.id)
        this.$message.success('删除成功')
        this.getList()
      } catch (error) {
        console.error('删除失败:', error)
      }
    },
    handleSelectionChange(selection) {
      this.selectedHosts = selection
    },
    async handleBatchDelete() {
      try {
        await this.$confirm(`确认删除选中的 ${this.selectedHosts.length} 个主机?`, '提示', {
          type: 'warning'
        })
        const ids = this.selectedHosts.map(item => item.id)
        await batchDeleteHosts(ids)
        this.$message.success('批量删除成功')
        this.getList()
      } catch (error) {
        console.error('批量删除失败:', error)
      }
    },
    handleMonitorSettings(row) {
      this.currentHost = Object.assign({}, row)
      this.settingsVisible = true
    },
    handleFormSuccess() {
      this.getList()
    },
    handleSettingsSuccess() {
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
}
</style>
