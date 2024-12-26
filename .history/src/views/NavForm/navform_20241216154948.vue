<template>
  <el-dialog :visible.sync="visible" :title="record.id ? '编辑导航' : '新建导航'" width="50%">
    <el-form :model="record" label-width="100px">
      <el-form-item label="导航图标">
        <el-input v-model="record.logo" placeholder="请输入图片链接地址" />
      </el-form-item>

      <el-form-item label="导航标题">
        <el-input v-model="record.title" placeholder="请输入导航标题" />
      </el-form-item>

      <el-form-item label="导航描述">
        <el-input v-model="record.desc" placeholder="请输入导航描述" />
      </el-form-item>

      <el-form-item label="导航链接">
        <div v-for="(link, index) in record.links" :key="index" class="link-item">
          <el-input v-model="link.name" placeholder="链接名称" style="width: 30%; margin-right: 10px;" />
          <el-input v-model="link.url" placeholder="链接地址" style="width: 60%; margin-right: 10px;" />
          <el-button v-if="record.links.length > 1" type="danger" icon="el-icon-minus" @click="removeLink(index)" />
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="addLink">添加链接</el-button>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    record: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      visible: true
    }
  },

  methods: {
    addLink() {
      this.record.links.push({ name: '', url: '' })
    },

    removeLink(index) {
      this.record.links.splice(index, 1)
    },

    cancel() {
      this.$emit('cancel')
    },

    save() {
      if (!this.record.title || !this.record.desc || !this.record.logo) {
        this.$message.error('请填写完整信息并提供图片链接')
        return
      }

      this.$emit('save', this.record)
      this.visible = false
    }
  }
}
</script>

<style scoped>
.link-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
