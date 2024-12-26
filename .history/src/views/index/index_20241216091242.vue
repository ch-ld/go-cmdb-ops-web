<template>
  <div>
    <div v-for="(section, index) in sections" :key="index" class="container">
      <div class="container-header">{{ section.title }}</div>
      <div class="container-body">
        <div v-for="(item, itemIndex) in section.items" :key="itemIndex" class="item-block">
          <a :href="item.url" target="_blank">
            <div class="item-top">
              <div class="item-logo"><img :src="item.logo" alt="Logo"></div>
              <div class="item-body">
                <span class="title">{{ item.name }}</span>
                <span class="notice">{{ item.notice }}</span>
              </div>
            </div>
          </a>
          <div class="item-bottom">
            <a v-for="(link, linkIndex) in item.links" :key="linkIndex" :href="link.url" target="_blank">
              <div>{{ link.text }}</div>
              <div v-if="linkIndex < item.links.length - 1" class="divider" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sections: [
        {
          title: '内部系统导航',
          items: [
            {
              name: 'Gitlab系统',
              notice: 'Gitlab内部代码仓库',
              url: 'https://about.gitlab.com/',
              logo: 'img/gitlab.png',
              links: [
                { text: '官网地址', url: 'https://about.gitlab.com/' },
                { text: '帮助文档', url: 'https://docs.gitlab.com/ee/README.html' }
              ]
            },
            {
              name: 'WIKI系统',
              notice: '文档系统',
              url: 'https://www.atlassian.com/',
              logo: 'img/wiki.png',
              links: [
                { text: '官网地址', url: 'https://www.atlassian.com/zh' },
                { text: '帮助文档', url: 'https://confluence.atlassian.com/kb' }
              ]
            },
            {
              name: '账户系统',
              notice: 'LDAP账号统一管理系统',
              url: 'https://www.openldap.org/',
              logo: 'img/ldap.svg',
              links: [
                { text: '官网地址', url: 'https://www.openldap.org/' }
              ]
            }
          ]
        },
        {
          title: '运维系统导航',
          items: [
            {
              name: '开源运维平台',
              notice: 'Spug开源运维平台',
              url: 'https://demo.spug.dev',
              logo: 'img/spug.png',
              links: [
                { text: 'Github地址', url: 'https://github.com/openspug/spug' },
                { text: 'Gitee地址', url: 'https://gitee.com/openspug/spug' },
                { text: '演示环境', url: 'https://demo.spug.dev' }
              ]
            },
            {
              name: 'OpenSpug',
              notice: 'OpenSpug组织',
              url: 'https://github.com/openspug',
              logo: 'img/github.png',
              links: [
                { text: '组织地址', url: 'https://github.com/openspug' },
                { text: '官网地址', url: 'https://www.spug.dev' }
              ]
            },
            {
              name: '监控系统',
              notice: 'Grafana 监控平台',
              url: 'https://grafana.com/',
              logo: 'img/grafana.png',
              links: [
                { text: '官网地址', url: 'https://grafana.com/' }
              ]
            },
            {
              name: '监控报警',
              notice: 'Zabbix监控报警平台',
              url: 'https://www.zabbix.com/',
              logo: 'img/zabbix.png',
              links: [
                { text: '官网地址', url: 'https://www.zabbix.com/' }
              ]
            }
          ]
        }
      ]
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #fff;
  margin-bottom: 20px;
}

.container-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  height: 40px;
  padding-left: 10px;
}

.container-body {
  display: flex;
  border-top: 1px solid #dfdfdf;
  padding: 20px 10px 0 10px;
  flex-wrap: wrap;
}

.item-block {
  border: 1px solid #dfdfdf;
  flex-direction: column;
  height: 160px;
  width: 24%;
  margin-bottom: 20px;
  margin-right: 10px;
}

.item-top {
  height: 80px;
  padding: 20px;
  display: flex;
}

.item-logo {
  width: 21%;
  height: 60px;
  margin-right: 20px;
}

.item-logo img {
  width: 100%;
  height: 100%;
}

.item-body {
  flex-direction: column;
  width: 79%;
}

.item-bottom {
  height: 40px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: #888888;
  background-color: #F7F7F7;
  font-size: 13px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 10px;
}

.notice {
  font-size: 12px;
  color: #888;
}

.divider {
  height: 20px;
  width: 1px;
  background-color: #dfdfdf;
}
</style>
