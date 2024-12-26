<!-- src/views/host/components/GroupTree.vue -->
<template>
  <div class="group-tree-container">
    <div class="filter-container">
      <el-input
        v-model="filterText"
        placeholder="输入关键字过滤"
        clearable
        size="small"
      />
    </div>
    <el-tree
      ref="tree"
      :data="groupList"
      :props="defaultProps"
      :filter-node-method="filterNode"
      node-key="id"
      default-expand-all
      highlight-current
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script>
import { getHostGroups } from '@/api/host'

export default {
  name: 'GroupTree',
  data() {
    return {
      filterText: '',
      groupList: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getGroups()
  },
  methods: {
    async getGroups() {
      try {
        const { data } = await getHostGroups()
        this.groupList = data
      } catch (error) {
        console.error('获取分组列表失败:', error)
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    handleNodeClick(data) {
      this.$emit('node-click', data.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.group-tree-container {
  margin-bottom: 20px;
  .filter-container {
    margin-bottom: 10px;
  }
}
</style>
