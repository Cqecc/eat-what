const recommendStore = require('../../stores/recommendStore')
const recordStore = require('../../stores/recordStore')
const cartStore = require('../../stores/cartStore')
const cloudApi = require('../../utils/cloudApi')
const { CATEGORIES } = require('../../utils/constants')
const { getMealHint } = require('../../utils/mealTime')

Page({
  data: {
    pageState: 'initial', // initial|spinning|result|confirmed|exhausted
    mealHint: '',
    categoryFilter: '',
    recommendResult: null,
    categories: CATEGORIES,
    loadingState: true,
    loadErrorState: false,
    cartCount: 0,
    showCartPanel: false,
    showOrderConfirm: false,
    showInitGuide: false,
    showInviteTip: false
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
    this.setData({
      loadingState: false,
      loadErrorState: false,
      mealHint: getMealHint(app.globalData.currentMeal),
      cartCount: app.globalData.cart.length
    })

    // 无记录且已加载完成 → 显示引导弹窗
    if (app.globalData.records.length === 0 && app.globalData.initialized) {
      this.setData({ showInitGuide: true })
    }

    // 处理从我的页跳转过来的分类筛选
    if (app.globalData.categoryFilterFromMine) {
      this.setData({ categoryFilter: app.globalData.categoryFilterFromMine })
      app.globalData.categoryFilterFromMine = null
    }
  },

  onLoad(options) {
    // 家人通过分享卡片打开，获取familyGroupId
    if (options.familyGroupId) {
      this.handleFamilyGroupId(options.familyGroupId)
    }
  },

  async handleFamilyGroupId(familyGroupId) {
    const storedGroupId = wx.getStorageSync('familyGroupId')
    const groupId = storedGroupId || familyGroupId
    if (groupId) {
      wx.setStorageSync('familyGroupId', groupId)
      await cloudApi.callFunction('subscribe', { action: 'saveOpenid', familyGroupId: groupId })
    }
  },

  onDataReady() { this.onShow() },
  retryLoad() { getApp().loadData() },

  onFilterTap(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ categoryFilter: value, pageState: 'initial' })
    recommendStore.resetSessionExclusions()
  },

  onSpin() {
    this.setData({ pageState: 'spinning' })
    setTimeout(() => {
      if (this.data.pageState !== 'spinning') return
      const { result, exhausted } = recommendStore.getRecommendation(this.data.categoryFilter)
      if (exhausted) {
        this.setData({ pageState: 'exhausted' })
        return
      }
      this.setData({ pageState: 'result', recommendResult: result })
    }, 500)
  },

  onAnother() {
    if (this.data.recommendResult) {
      recommendStore.addToSessionExclusions(this.data.recommendResult.name)
    }
    const { result, exhausted } = recommendStore.getRecommendation(this.data.categoryFilter)
    if (exhausted) {
      this.setData({ pageState: 'exhausted' })
      return
    }
    this.setData({ recommendResult: result })
  },

  onConfirm() {
    this.setData({ pageState: 'confirmed' })
  },

  async onNotify() {
    // 通知家人：加入购物车 + 弹出下单确认
    const r = this.data.recommendResult
    await cartStore.addToCart({ name: r.name, category: r.category, meal: r.meal })
    this.setData({ showOrderConfirm: true, cartCount: getApp().globalData.cart.length })
  },

  async onAddMore() {
    const r = this.data.recommendResult
    await cartStore.addToCart({ name: r.name, category: r.category, meal: r.meal })
    recommendStore.addToSessionExclusions(r.name)
    this.setData({ pageState: 'initial', recommendResult: null, cartCount: getApp().globalData.cart.length })
  },

  async onExclude() {
    // 标记该菜名所有记录 excluded=true
    const r = this.data.recommendResult
    await recordStore.updateRecord(r._id, { excluded: true })
    this.setData({ pageState: 'initial', recommendResult: null })
    recommendStore.addToSessionExclusions(r.name)
    wx.showToast({ title: '已排除推荐', icon: 'none' })
  },

  onReset() {
    recommendStore.resetSessionExclusions()
    this.setData({ pageState: 'initial', recommendResult: null, categoryFilter: '' })
  },

  // 购物车面板
  onCartOpen() { this.setData({ showCartPanel: true }) },
  onCartClose() { this.setData({ showCartPanel: false }) },
  onShowOrderConfirm() {
    this.setData({ showCartPanel: false, showOrderConfirm: true })
  },

  // 下单确认弹窗
  onOrderConfirmClose() { this.setData({ showOrderConfirm: false }) },
  onOrdered() {
    this.setData({
      showOrderConfirm: false,
      pageState: 'initial',
      recommendResult: null,
      cartCount: 0
    })
  },

  // 新用户引导
  onInitDone() { this.setData({ showInitGuide: false }) },
  onInitSkip() { this.setData({ showInitGuide: false }) },
  onShowInviteTip() { this.setData({ showInviteTip: true }) },
  onInviteTipClose() { this.setData({ showInviteTip: false }) },

  // 分享给家人
  onShareAppMessage() {
    const app = getApp()
    const r = this.data.recommendResult
    return {
      title: r ? `吃什么 - ${r.name}` : '吃什么',
      path: `/pages/home/home?familyGroupId=${app.globalData.creatorOpenid}`
    }
  }
})