const { PRESET_DISHES } = require('../../utils/constants')
const cloudApi = require('../../utils/cloudApi')

Component({
  data: {
    dishes: PRESET_DISHES.map(d => ({ ...d, rating: '好吃' }))
  },

  methods: {
    onRatingTap(e) {
      const { index, rating } = e.currentTarget.dataset
      const dishes = this.data.dishes
      dishes[index].rating = rating
      this.setData({ dishes })
    },

    async onInit() {
      wx.showLoading({ title: '初始化中' })
      try {
        const dishes = this.data.dishes
        await cloudApi.callFunction('init', { action: 'preset', dishes })
        // 重新加载全量数据
        await getApp().loadData()
        this.triggerEvent('done')
        wx.showToast({ title: '初始化成功', icon: 'success' })

        // 初始化完成后弹出邀请家人提示
        this.triggerEvent('invite')
      } catch (e) {
        console.error('初始化失败', e)
      } finally { wx.hideLoading() }
    },

    onSkip() {
      this.triggerEvent('skip')
    }
  }
})