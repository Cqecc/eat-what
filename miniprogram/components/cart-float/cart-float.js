Component({
  properties: {
    cartCount: { type: Number, value: 0 }
  },

  methods: {
    onTap() { this.triggerEvent('open') }
  }
})