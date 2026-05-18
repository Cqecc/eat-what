const orderStore = require('../../stores/orderStore')
const recordStore = require('../../stores/recordStore')
const { CATEGORIES, CATEGORY_ICONS } = require('../../utils/constants')

Page({
  data: {
    totalCount: 0,
    goodCount: 0,
    okCount: 0,
    categoryStats: [],
    orders: [],
    loadingState: true,
    loadErrorState: false
  },

  onShow() {
    const app = getApp()
    if (app.globalData.loading) {
      this.setData({ loadingState: true })
      return
    }
    if (app.globalData.loadError) {
      this.setData({ loadingState: false, loadErrorState: true })
      return
    }
    const records = recordStore.getRecords()
    const orders = orderStore.getOrders()

    const totalCount = records.length
    const goodCount = records.filter(r => r.rating === '好吃').length
    const okCount = records.filter(r => r.rating === '还行').length

    const categoryStats = CATEGORIES.map(cat => {
      const catRecords = records.filter(r => r.category === cat && !r.excluded)
      return {
        name: cat,
        icon: CATEGORY_ICONS[cat],
        count: catRecords.length,
        goodCount: catRecords.filter(r => r.rating === '好吃').length
      }
    })

    const formattedOrders = orders.map(o => ({
      ...o,
      createdAtStr: new Date(o.createdAt).toLocaleDateString('zh-CN')
    }))

    this.setData({
      loadingState: false,
      loadErrorState: false,
      totalCount, goodCount, okCount,
      categoryStats,
      orders: formattedOrders
    })
  },

  onDataReady() { this.onShow() },

  retryLoad() { getApp().loadData() },

  onCategoryTap(e) {
    const name = e.currentTarget.dataset.name
    wx.switchTab({ url: '/pages/home/home' })
    // 通过globalData传递筛选参数
    getApp().globalData.categoryFilterFromMine = name
  }
})