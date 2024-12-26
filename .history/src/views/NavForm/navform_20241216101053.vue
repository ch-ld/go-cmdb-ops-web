<template>
  <el-dialog :visible.sync="visible" :title="dialogTitle" :loading="loading">
    <el-form ref="formRef" :model="form" label-width="120px">
      <el-form-item label="导航图标" required>
        <el-upload
          class="upload-demo"
          :file-list="fileList"
          :before-upload="beforeUpload"
          @change="handleFileChange"
        >
          <el-button size="small" type="primary">
            <i class="el-icon-plus" /> 点击上传
          </el-button>
        </el-upload>
        <div class="image-example">
          <el-avatar
            v-for="item in logoExamples"
            :key="item"
            :src="`/resource/${item}.png`"
            @click="setFileList(item)"
          />
        </div>
      </el-form-item>

      <el-form-item label="导航标题" required>
        <el-input v-model="form.title" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="导航描述" required>
        <el-input v-model="form.desc" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="导航链接" required>
        <div v-for="(link, index) in form.links" :key="index" class="link-item">
          <el-input v-model="link.name" placeholder="链接名称" />
          <el-input v-model="link.url" placeholder="请输入链接地址" />
          <el-button v-if="form.links.length > 1" icon="el-icon-delete" @click="removeLink(index)" />
        </div>
      </el-form-item>

      <el-button type="dashed" icon="el-icon-plus" @click="addLink">添加链接</el-button>
    </el-form>
    <span slot="footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'
// import { ElDialog, ElForm, ElFormItem, ElInput, ElUpload, ElButton, ElAvatar } from 'element-ui'

export default {
  props: {
    visible: Boolean,
    record: Object,
    onCancel: Function,
    onOk: Function
  },
  setup(props) {
    const form = ref({ links: [] })
    const fileList = ref([])
    const loading = ref(false)
    const logoExamples = ['gitlab', 'gitee', 'grafana', 'prometheus']

    watch(() => props.record, (newRecord) => {
      if (newRecord) {
        form.value = { ...newRecord }
        fileList.value = newRecord.logo ? [{ uid: 0, thumbUrl: newRecord.logo }] : []
      }
    })

    const addLink = () => {
      form.value.links.push({ name: '', url: '' })
    }

    const removeLink = (index) => {
      form.value.links.splice(index, 1)
    }

    const handleFileChange = (fileList) => {
      fileList.value = fileList
    }

    const handleSubmit = () => {
      // 处理提交逻辑
      props.onOk(form.value)
    }

    return {
      form,
      fileList,
      loading,
      logoExamples,
      addLink,
      removeLink,
      handleFileChange,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.image-example {
  display: flex;
  margin-top: 10px;
}
.link-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
