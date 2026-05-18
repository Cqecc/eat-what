const orderStore = require('../../stores/orderStore')
const cartStore = require('../../stores/cartStore')
const recommendStore = require('../../stores/recommendStore')
const { copyToClipboard } = require('../../utils/clipboard')
const { getMealLabel } = require('../../utils/mealTime')

Component({
  properties: {
    visible: { type: Boolean, value: false }
  },

  data: {
    items: [],
    note: ''
  },

  observers: {
    'visible': function(v) {
      if (v) {
        this.setData({ items: cartStore.getCart(), note: '' })
      }
    }
  },

  methods: {
    onClose() { this.triggerEvent('close') },
    onNoteInput(e) { this.setData({ note: e.detail.value }) },

    async onConfirmOrder() {
      wx.showLoading({ title: '下单中' })
      try {
        const order = await orderStore.createOrder(this.data.note)

        // 下单成功后重置推荐页
        recommendStore.resetSessionExclusions()

        // 剪贴板通知（主通道）
        const dishText = order.items.map(i => i.name).join('、')
        await copyToClipboard(`${getMealLabel(order.items[0].meal)}就吃${dishText}！`)

        this.triggerEvent('ordered', order)
        wx.showToast({ title: '下单成功', icon: 'success' })
      } catch (e) {
        console.error('下单失败', e)
      } finally { wx.hideLoading() }
    }
  }
})