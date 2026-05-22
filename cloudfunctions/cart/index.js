const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  switch (action) {
    case 'list': {
      const res = await db.collection('cart').where({ _openid: OPENID }).get()
      return { data: res.data }
    }
    case 'add': {
      const { name, category, meal } = event
      // 查重：同名不重复
      const existing = await db.collection('cart').where({ name, _openid: OPENID }).count()
      if (existing.total > 0) return { data: null, message: '已存在' }
      const now = new Date()
      const data = { name, category, meal, createdAt: now }
      const res = await db.collection('cart').add({ data })
      return { data: { _id: res._id, ...data } }
    }
    case 'remove': {
      const { id } = event
      // 校验文档归属，文档不存在时doc().get()会抛异常
      try {
        const doc = await db.collection('cart').doc(id).get()
        if (!doc.data || doc.data._openid !== OPENID) return { error: '无权限' }
      } catch (e) { return { error: '记录不存在或无权限' } }
      await db.collection('cart').doc(id).remove()
      return { success: true }
    }
    case 'clear': {
      await db.collection('cart').where({ _openid: OPENID }).remove()
      return { success: true }
    }
    default:
      return { error: '未知action' }
  }
}