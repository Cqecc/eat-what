Component({
  properties: {
    visible: { type: Boolean, value: false },
    message: { type: String, value: '' },
    type: { type: String, value: '' } // success | error | ''
  }
})