Component({
  properties: {
    result: { type: Object, value: null },
    phase: { type: String, value: 'decide' } // 'decide' | 'action'
  },

  methods: {
    onAnother() { this.triggerEvent('another') },
    onConfirm() { this.triggerEvent('confirm') },
    onNotify() { this.triggerEvent('notify') },
    onAddMore() { this.triggerEvent('addmore') },
    onExclude() { this.triggerEvent('exclude') }
  }
})