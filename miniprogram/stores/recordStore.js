const cloudApi = require('../utils/cloudApi')

function getRecords() {
  return getApp().globalData.records
}

async function addRecord(data) {
  const res = await cloudApi.callFunction('record', { action: 'add', ...data })
  const app = getApp()
  app.globalData.records.push(res.data)
  return res.data
}

async function updateRecord(id, data) {
  await cloudApi.callFunction('record', { action: 'update', id, ...data })
  const app = getApp()
  const idx = app.globalData.records.findIndex(r => r._id === id)
  if (idx !== -1) Object.assign(app.globalData.records[idx], data)
}

async function deleteRecord(id) {
  await cloudApi.callFunction('record', { action: 'delete', id })
  const app = getApp()
  app.globalData.records = app.globalData.records.filter(r => r._id !== id)
}

async function updateRecommendedAt(name) {
  await cloudApi.callFunction('record', { action: 'updateRecommendedAt', name })
  // 不直接改globalData，云函数写入Date对象，下次loadData时获取正确格式
}

module.exports = { getRecords, addRecord, updateRecord, deleteRecord, updateRecommendedAt }