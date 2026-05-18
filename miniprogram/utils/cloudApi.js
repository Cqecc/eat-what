const cloudApi = {
  async callFunction(name, data) {
    try {
      const res = await wx.cloud.callFunction({ name, data })
      return res.result
    } catch (e) {
      console.error(`云函数${name}调用失败`, e)
      wx.showToast({ title: '操作失败，请重试', icon: 'none' })
      throw e
    }
  }
}

module.exports = cloudApi