const cloudApi = require('../utils/cloudApi')

function getCart() {
  return getApp().globalData.cart
}

async function addToCart(item) {
  const res = await cloudApi.callFunction('cart', { action: 'add', ...item })
  const app = getApp()
  app.globalData.cart.push(res.data)
  return res.data
}

async function removeFromCart(id) {
  await cloudApi.callFunction('cart', { action: 'remove', id })
  const app = getApp()
  app.globalData.cart = app.globalData.cart.filter(c => c._id !== id)
}

async function clearCart() {
  await cloudApi.callFunction('cart', { action: 'clear' })
  getApp().globalData.cart = []
}

module.exports = { getCart, addToCart, removeFromCart, clearCart }