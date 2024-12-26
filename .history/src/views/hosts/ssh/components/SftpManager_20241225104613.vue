<!-- @/components/SftpManager.vue -->
<template>
  <div class="sftp-manager">
    <div class="sftp-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(item, index) in pathItems"
          :key="index"
          @click.native="navigateTo(index)"
        >
          {{ item || '根目录' }}
        </el-breadcrumb-item>
      </el-breadcrumb>

      <div class="sftp-actions">
        <el-upload
          :action="uploadUrl"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="false"
        >
          <el-button type="primary" icon="el-icon-upload">上传文件</el-button>
        </el-upload>
        <el-button
          type="primary"
          icon="el-icon-folder-add"
          @click="showCreateDirDialog"
        >
          新建目录
        </el-button>
        <el-button
          icon="el-icon-refresh"
          @click="refreshDirectory"
        >
          刷新
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="fileList"
      style="width: 100%"
    >
      <el-table-column label="名称" min-width="200">
        <template slot-scope="scope">
          <i :class="getFileIcon(scope.row)" />
          <span
            class="file-name"
            @click="handleFileClick(scope.row)"
          >
            {{ scope.row.name }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="size" label="大小" width="120">
        <template slot-scope="scope">
          {{ formatFileSize(scope.row.size) }}
        </template>
      </el-table-column>

      <el-table-column prop="modTime" label="修改时间" width="180">
        <template slot-scope="scope">
          {{ formatDate(scope.row.modTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="!scope.row.isDir"
            size="mini"
            type="primary"
            @click="downloadFile(scope.row)"
          >
            下载
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="deleteFile(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建目录对话框 -->
    <el-dialog
      title="新建目录"
      :visible.sync="createDirVisible"
      width="400px"
    >
      <el-form ref="createDirForm" :model="createDirForm">
        <el-form-item
          label="目录名称"
          prop="name"
          :rules="[{ required: true, message: '请输入目录名称' }]"
        >
          <el-input v-model="createDirForm.name" placeholder="请输入目录名称" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="createDirVisible = false">取消</el-button>
        <el-button type="primary" @click="createDirectory">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listDirectory,
  uploadFile,
  downloadFile as downloadFileApi,
  createDirectory as createDirectoryApi,
  deletePath
} from '@/api/sftp'
import { formatDate } from '@/utils/index'

export default {
  name: 'SftpManager',
  props: {
    host: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      currentPath: '/',
      fileList: [],
      createDirVisible: false,
      createDirForm: {
        name: ''
      },
      uploadHeaders: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }
  },
  computed: {
    pathItems() {
      return this.currentPath.split('/').filter(item => item)
    },
    uploadUrl() {
      return process.env.VUE_APP_BASE_API + '/api/v1/cmdb/sftp/upload'
    },
    uploadData() {
      return {
        hostId: this.host.id,
        path: this.currentPath
      }
    }
  },
  created() {
    this.loadDirectory()
  },
  methods: {
    // 加载目录内容
    async loadDirectory() {
      this.loading = true
      try {
        const { data } = await listDirectory({
          hostId: this.host.id,
          path: this.currentPath
        })
        this.fileList = data || []
      } catch (error) {
        this.$message.error('加载目录失败：' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 文件图标
    getFileIcon(file) {
      return file.isDir ? 'el-icon-folder' : 'el-icon-document'
    },

    // 格式化文件大小
    formatFileSize(size) {
      if (size < 1024) return size + ' B'
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
      if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB'
      return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
    },

    // 处理文件点击
    handleFileClick(file) {
      if (file.isDir) {
        this.currentPath = this.currentPath.replace(/\/$/, '') + '/' + file.name
        this.loadDirectory()
      }
    },

    // 导航到指定路径
    navigateTo(index) {
      const paths = this.currentPath.split('/').filter(item => item)
      this.currentPath = '/' + paths.slice(0, index + 1).join('/')
      this.loadDirectory()
    },

    // 刷新目录
    refreshDirectory() {
      this.loadDirectory()
    },

    // 显示创建目录对话框
    showCreateDirDialog() {
      this.createDirVisible = true
      this.createDirForm.name = ''
    },

    // 创建目录
    async createDirectory() {
      if (!this.createDirForm.name) {
        this.$message.error('请输入目录名称')
        return
      }

      try {
        await createDirectoryApi({
          hostId: this.host.id,
          path: this.currentPath + '/' + this.createDirForm.name
        })
        this.$message.success('目录创建成功')
        this.createDirVisible = false
        this.loadDirectory()
      } catch (error) {
        this.$message.error('创建目录失败：' + error.message)
      }
    },

    // 上传文件前的处理
    beforeUpload(file) {
      return true
    },

    // 上传成功处理
    handleUploadSuccess(response) {
      this.$message.success('文件上传成功')
      this.loadDirectory()
    },

    // 上传失败处理
    handleUploadError(error) {
      this.$message.error('文件上传失败：' + error.message)
    },

    // 下载文件
    async downloadFile(file) {
      try {
        const response = await downloadFileApi({
          hostId: this.host.id,
          path: this.currentPath + '/' + file.name
        })

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', file.name)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        this.$message.error('下载失败：' + error.message)
      }
    },

    // 删除文件或目录
    async deleteFile(file) {
      try {
        await this.$confirm(
          `确定要删除${file.isDir ? '目录' : '文件'} "${file.name}" 吗？`,
          '提示',
          {
            type: 'warning'
          }
        )

        await deletePath({
          hostId: this.host.id,
          path: this.currentPath + '/' + file.name
        })

        this.$message.success('删除成功')
        this.loadDirectory()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败：' + error.message)
        }
      }
    },

    // 获取token
    getToken() {
      return localStorage.getItem('token') || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.sftp-manager {
  padding: 20px;

  .sftp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .sftp-actions {
      display: flex;
      gap: 10px;
    }
  }

  .file-name {
    margin-left: 8px;
    cursor: pointer;
    color: #409EFF;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
