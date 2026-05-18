async function copyToClipboard(text) {
  try {
    await wx.setClipboardData({ data: text })
    wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
    return true
  } catch (e) {
    console.error('剪贴板复制失败', e)
    wx.showToast({ title: '复制失败', icon: 'none' })
    return false
  }
}

module.exports = { copyToClipboard }