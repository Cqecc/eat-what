Component({
  properties: {
    record: { type: Object, value: {} }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', this.properties.record)
    }
  }
})