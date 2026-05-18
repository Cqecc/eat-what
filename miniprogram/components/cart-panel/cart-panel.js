const cartStore = require('../../stores/cartStore')

Component({
  properties: {
    visible: { type: Boolean, value: false }
  },

  data: {
    cartItems: []
  },

  observers: {
    'visible': function(v) {
      if (v) this.setData({ cartItems: cartStore.getCart() })
    }
  },

  methods: {
    onClose() { this.triggerEvent('close') },

    async onRemove(e) {
      const id = e.currentTarget.dataset.id
      await cartStore.removeFromCart(id)
      this.setData({ cartItems: cartStore.getCart() })
    },

    async onClear() {
      await cartStore.clearCart()
      this.setData({ cartItems: [] })
      this.triggerEvent('close')
    },

    onOrder() { this.triggerEvent('order') }
  }
})