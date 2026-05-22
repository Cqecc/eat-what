const { getCurrentMeal } = require('./utils/mealTime')
const { CLOUD_ENV_ID } = require('./config/env')

App({
  globalData: {
    records: [],
    cart: [],
    orders: [],
    currentMeal: '',
    creatorOpenid: '',
    loading: true,
    loadError: false,
    initialized: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true
    })
    this.loadData()
  },

  async loadData() {
    this.globalData.loading = true
    this.globalData.loadError = false
    try {
      const res = await wx.cloud.callFunction({ name: 'record', data: { action: 'list' } })
      this.globalData.records = res.result.data
      this.globalData.creatorOpenid = res.result.openid
    } catch (e) {
      console.error('records加载失败', e)
      this.globalData.loading = false
      this.globalData.loadError = true
      wx.showToast({ title: '数据加载失败，请重试', icon: 'none' })
      return
    }

    try {
      const res = await wx.cloud.callFunction({ name: 'cart', data: { action: 'list' } })
      this.globalData.cart = res.result.data
    } catch (e) { console.error('cart加载失败', e) }

    try {
      const res = await wx.cloud.callFunction({ name: 'order', data: { action: 'list' } })
      this.globalData.orders = res.result.data
    } catch (e) { console.error('orders加载失败', e) }

    this.globalData.currentMeal = getCurrentMeal()
    this.globalData.initialized = true
    this.globalData.loading = false
    const pages = getCurrentPages()
    if (pages.length > 0 && pages[pages.length - 1].onDataReady) {
      pages[pages.length - 1].onDataReady()
    }
  }
})