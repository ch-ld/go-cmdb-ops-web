<template>
  <div class="sftp-manager">
    <div class="sftp-header">
      <div class="sftp-nav">
        <el-button-group class="mr-3">
          <el-button
            icon="el-icon-back"
            :disabled="currentPath === '/'"
            @click="goBack"
          >
            返回上级
          </el-button>
          <el-button
            icon="el-icon-s-home"
            @click="goHome"
          >
            用户目录
          </el-button>
        </el-button-group>

        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in pathItems"
            :key="index"
            @click.native="navigateTo(index)"
          >
            {{ item || '根目录' }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="sftp-actions">
        <el-button
          type="danger"
          icon="el-icon-delete"
          :disabled="!selectedFiles.length"
          @click="batchDelete"
        >
          删除选中({{ selectedFiles.length }})
        </el-button>
        <el-upload
          :http-request="customUpload"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="false"
          :multiple="true"
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

    <!-- 拖拽上传区域 -->
    <div
      class="upload-drop-zone"
      :class="{ 'is-dragover': isDragover }"
      @dragover.prevent="handleDragover"
      @dragleave.prevent="handleDragleave"
      @drop.prevent="handleDrop"
    >
      <i class="el-icon-upload upload-icon" />
      <div class="upload-text">将文件拖到此处，或点击上传按钮</div>
    </div>

    <el-table
      v-loading="loading"
      :data="fileList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
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
          {{ formatDateTime(scope.row.modTime) }}
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
  downloadFile as downloadFileApi,
  createDirectory as createDirectoryApi,
  deletePath,
  uploadFile
} from '@/api/sftp'
import dayjs from 'dayjs'

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
      homeDirectory: '/home/', // 新增：用户家目录
      selectedFiles: [], // 新增：选中的文件列表
      currentPath: '/',
      fileList: [],
      createDirVisible: false,
      createDirForm: {
        name: ''
      },
      uploadHeaders: {
        Authorization: `Bearer ${this.getToken()}`
      },
      isDragover: false,
      uploadingFiles: new Set()
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
        path: this.normalizePath(this.currentPath)
      }
    }
  },
  created() {
    this.loadDirectory()
  },
  methods: {
    // 规范化路径
    normalizePath(path) {
    // 确保使用正斜杠
      path = path.replace(/\\/g, '/')
      // 移除多余的斜杠
      path = path.replace(/\/+/g, '/')
      // 确保以单个斜杠开头
      if (!path.startsWith('/')) {
        path = '/' + path
      }
      // 移除结尾的斜杠（除非是根目录）
      if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1)
      }
      return path
    },
    // 新增：处理表格选择变化
    handleSelectionChange(selection) {
      this.selectedFiles = selection
    },

    // 新增：批量删除
    async batchDelete() {
      if (!this.selectedFiles.length) return

      try {
        await this.$confirm(
          `确定要删除选中的 ${this.selectedFiles.length} 个文件/目录吗？`,
          '提示',
          {
            type: 'warning'
          }
        )

        const deletePromises = this.selectedFiles.map(file =>
          deletePath({
            hostId: this.host.id,
            path: this.normalizePath(this.currentPath + '/' + file.name)
          })
        )

        await Promise.all(deletePromises)
        this.$message.success('批量删除成功')
        this.loadDirectory()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败：' + error.message)
        }
      }
    },
    // 修改：加载目录时清除选中状态
    async loadDirectory() {
      this.loading = true
      this.selectedFiles = [] // 清除选中状态
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

    // 新增：返回上一级目录
    goBack() {
      if (this.currentPath === '/') return
      const paths = this.currentPath.split('/').filter(item => item)
      paths.pop()
      this.currentPath = this.normalizePath('/' + paths.join('/'))
      this.loadDirectory()
    },

    // 新增：返回用户家目录
    goHome() {
      this.currentPath = this.homeDirectory
      this.loadDirectory()
    },

    // 文件图标
    getFileIcon(file) {
      return file.isDir ? 'el-icon-folder' : 'el-icon-document'
    },

    // 格式化文件大小
    formatFileSize(size) {
      if (!size) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let index = 0
      let fileSize = size
      while (fileSize >= 1024 && index < units.length - 1) {
        fileSize /= 1024
        index++
      }
      return `${fileSize.toFixed(2)} ${units[index]}`
    },

    // 格式化日期时间
    formatDateTime(date) {
      return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    // 处理文件点击
    handleFileClick(file) {
      if (file.isDir) {
        this.currentPath = this.normalizePath(this.currentPath + '/' + file.name)
        this.loadDirectory()
      } else {
        // 对于图片文件可以预览
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif']
        const ext = file.name.toLowerCase().substr(file.name.lastIndexOf('.'))
        if (imageExts.includes(ext)) {
          this.previewImage(file)
        }
      }
    },

    // 导航到指定路径
    navigateTo(index) {
      const paths = this.currentPath.split('/').filter(item => item)
      this.currentPath = this.normalizePath('/' + paths.slice(0, index + 1).join('/'))
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
          path: this.normalizePath(this.currentPath + '/' + this.createDirForm.name)
        })
        this.$message.success('目录创建成功')
        this.createDirVisible = false
        this.loadDirectory()
      } catch (error) {
        this.$message.error('创建目录失败：' + error.message)
      }
    },

    // 处理拖拽相关事件
    handleDragover(e) {
      this.isDragover = true
    },

    handleDragleave(e) {
      this.isDragover = false
    },

    async handleDrop(e) {
      this.isDragover = false
      const files = Array.from(e.dataTransfer.files)
      this.uploadFiles(files)
    },

    // 添加自定义上传方法
    // 修改 customUpload 方法
    async customUpload({ file }) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('hostId', this.host.id)
        formData.append('path', this.normalizePath(this.currentPath))

        const response = await uploadFile(formData)
        this.handleUploadSuccess(response)
      } catch (error) {
        this.handleUploadError(error)
      } finally {
        this.uploadingFiles.delete(file.name)
      }
    },

    // 批量上传文件
    async uploadFiles(files) {
      for (const file of files) {
        if (this.uploadingFiles.has(file.name)) {
          this.$message.warning(`文件 ${file.name} 正在上传中`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('hostId', this.host.id)
        formData.append('path', this.normalizePath(this.currentPath))

        try {
          this.uploadingFiles.add(file.name)
          await uploadFile(formData)
          this.$message.success(`文件 ${file.name} 上传成功`)
        } catch (error) {
          this.$message.error(`文件 ${file.name} 上传失败：${error.message}`)
        } finally {
          this.uploadingFiles.delete(file.name)
        }
      }

      this.loadDirectory()
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
          path: this.normalizePath(this.currentPath + '/' + file.name)
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

    // 图片预览
    async previewImage(file) {
      try {
        const response = await downloadFileApi({
          hostId: this.host.id,
          path: this.currentPath + '/' + file.name,
          preview: true
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        this.$alert(
          `<img src="${url}" style="max-width: 100%; max-height: 500px;">`,
          file.name,
          {
            dangerouslyUseHTMLString: true,
            showClose: true,
            callback: () => {
              window.URL.revokeObjectURL(url)
            }
          }
        )
      } catch (error) {
        this.$message.error('预览失败：' + error.message)
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
    // 验证路径是否合法
    isValidPath(path) {
    // 不允许包含特殊字符
      const invalidChars = /[<>:"|?*\x00-\x1F]/g
      if (invalidChars.test(path)) {
        return false
      }
      // 不允许路径穿越
      if (path.includes('..')) {
        return false
      }
      return true
    },

    // 在上传前验证路径
    beforeUpload(file) {
      if (this.uploadingFiles.has(file.name)) {
        this.$message.warning(`文件 ${file.name} 正在上传中`)
        return false
      }

      if (!this.isValidPath(this.currentPath)) {
        this.$message.error('当前路径不合法')
        return false
      }

      if (!this.isValidPath(file.name)) {
        this.$message.error('文件名包含非法字符')
        return false
      }

      this.uploadingFiles.add(file.name)
      return true
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
  .sftp-nav {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .sftp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .el-breadcrumb {
      ::v-deep .el-breadcrumb__item {
        .el-breadcrumb__inner {
          cursor: pointer;
          &:hover {
            color: #409EFF;
          }
        }
      }
    }

    .sftp-actions {
      display: flex;
      gap: 10px;
    }
  }

  .upload-drop-zone {
    border: 2px dashed #e4e7ed;
    border-radius: 4px;
    text-align: center;
    padding: 20px;
    margin-bottom: 20px;
    background-color: #f5f7fa;
    transition: all 0.3s;

    &.is-dragover {
      border-color: #409EFF;
      background-color: rgba(64, 158, 255, 0.1);
    }

    .upload-icon {
      font-size: 28px;
      color: #909399;
      margin-bottom: 8px;
    }

    .upload-text {
      color: #606266;
      font-size: 14px;
    }
  }

  .file-name {
    margin-left: 8px;
    cursor: pointer;
    color: #606266;

    &:hover {
      color: #409EFF;
      text-decoration: underline;
    }
  }

  .el-table {
    ::v-deep {
      .el-table__row {
        cursor: pointer;

        &:hover {
          background-color: #f5f7fa;
        }
      }

      .el-icon-folder {
        color: #e6a23c;
      }

      .el-icon-document {
        color: #909399;
      }
    }
  }

  // 文件操作按钮样式
  .el-button--mini {
    padding: 7px 12px;

    & + .el-button--mini {
      margin-left: 6px;
    }
  }

  // 上传按钮组样式
  ::v-deep .el-upload {
    &:hover {
      .el-upload-dragger {
        border-color: #409EFF;
      }
    }
  }

  // 对话框样式
  ::v-deep .el-dialog {
    .el-dialog__body {
      padding: 20px;
    }

    .el-form-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // 加载状态样式
  ::v-deep .el-loading-mask {
    background-color: rgba(255, 255, 255, 0.8);
  }
}
</style>

