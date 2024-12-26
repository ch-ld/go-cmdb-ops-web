export default {
  name: 'HostTemplateExport',
  data() {
    return {
      list: null,
      downloadLoading: false,
      filename: '主机导入模板',
      autoWidth: true,
      bookType: 'xlsx'
    }
  },
  created() {
    this.list = [
      {
        hostGroup: '默认分组',
        hostname: 'web-server-01',
        privateIp: '192.168.1.100',
        publicIp: '8.8.8.8',
        sshPort: '22',
        sshUsername: 'root',
        authType: 'password',
        sshCredential: 'password123',
        osType: 'CentOS',
        osVersion: '7.9',
        tags: 'web,prod',
        description: 'Web服务器'
      }
    ]
  },
  methods: {
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '主机组',
          '主机名',
          '私有IP',
          '公网IP',
          'SSH端口',
          'SSH用户名',
          '认证方式',
          'SSH密码/密钥',
          '操作系统类型',
          '操作系统版本',
          '标签(逗号分隔)',
          '描述'
        ]

        const filterVal = [
          'hostGroup',
          'hostname',
          'privateIp',
          'publicIp',
          'sshPort',
          'sshUsername',
          'authType',
          'sshCredential',
          'osType',
          'osVersion',
          'tags',
          'description'
        ]

        const data = this.formatJson(filterVal, this.list)

        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.filename,
          autoWidth: this.autoWidth,
          bookType: this.bookType
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        return v[j] || ''
      }))
    }
  }
}
