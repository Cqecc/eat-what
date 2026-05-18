const cloudApi = require('../utils/cloudApi')

function getOrders() {
  return getApp().globalData.orders
}

async function createOrder(note) {
  const res = await cloudApi.callFunction('order', { action: 'create', note })
  // 先同步清空购物车，避免过渡期状态不一致
  getApp().globalData.cart = []
  // 下单成功后重新加载全量数据（云函数内已更新lastRecommendedAt，前端无需手动更新）
  await getApp().loadData()
  return res.data
}

module.exports = { getOrders, createOrder }