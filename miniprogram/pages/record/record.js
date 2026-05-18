const recordStore = require('../../stores/recordStore')

Page({
  data: {
    records: [],
    loadingState: true,
    loadErrorState: false,
    showEditModal: false,
    editRecord: null
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
      records: recordStore.getRecords()
    })
  },

  onDataReady() { this.onShow() },

  retryLoad() { getApp().loadData() },

  onRecordSaved() {
    this.setData({ records: recordStore.getRecords(), showEditModal: false })
  },

  onRecordItemTap(e) {
    this.setData({ showEditModal: true, editRecord: e.detail })
  },

  onEditClose() {
    this.setData({ showEditModal: false })
  }
})