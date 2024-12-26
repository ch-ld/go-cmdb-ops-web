<template>
  <div class="setting-drawer-content">
    <div class="setting-drawer-item">
      <span>主题色</span>
      <theme-picker style="float: right;height: 26px;margin: -3px 8px 0 0;" @change="themeChange" />
    </div>

    <div class="setting-drawer-item">
      <span>导航栏模式</span>
      <el-radio-group v-model="navbarMode" style="float: right;" @change="handleNavbarModeChange">
        <el-radio-button label="default">默认</el-radio-button>
        <el-radio-button label="fixed">固定</el-radio-button>
      </el-radio-group>
    </div>

    <div class="setting-drawer-item">
      <span>侧边栏模式</span>
      <el-radio-group v-model="sidebarMode" style="float: right;" @change="handleSidebarModeChange">
        <el-radio-button label="vertical">垂直</el-radio-button>
        <el-radio-button label="horizontal">水平</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import ThemePicker from '@/components/ThemePicker'

export default {
  name: 'Settings',
  components: {
    ThemePicker
  },
  data() {
    return {
      sidebarMode: 'vertical',
      navbarMode: 'default'
    }
  },
  methods: {
    handleSidebarModeChange(mode) {
      this.$store.commit('app/SET_SIDEBAR_MODE', mode)
    },
    handleNavbarModeChange(mode) {
      this.$store.commit('app/SET_NAVBAR_MODE', mode)
    },
    themeChange(theme) {
      this.$store.commit('app/SET_THEME', theme)
    }
  }
}
</script>

<style lang="scss" scoped>
.setting-drawer-content {
  .setting-drawer-item {
    padding: 12px 0;
    & > span {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
