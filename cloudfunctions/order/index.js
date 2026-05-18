const cloud = require('@wxjs/cloud')

const ORDER_LIMIT = 5

exports.main = async (event, context) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  switch (action) {
    case 'list': {
      const res = await db.collection('orders').where({ _openid: OPENID })
        .orderBy('createdAt', 'desc').limit(ORDER_LIMIT).get()
      return { data: res.data }
    }
    case 'create': {
      const { note } = event
      // 获取购物车内容
      const cartRes = await db.collection('cart').where({ _openid: OPENID }).get()
      if (cartRes.data.length === 0) return { error: '购物车为空' }

      const items = cartRes.data.map(c => ({ name: c.name, category: c.category, meal: c.meal }))
      const now = new Date()
      const orderData = {
        items,
        note: note || '',
        status: '已通知',
        createdAt: now
      }

      // 事务只保护订单创建+购物车清空的原子性
      const transaction = await db.startTransaction()
      try {
        const orderRes = await transaction.collection('orders').add({ data: orderData })
        await transaction.collection('cart').where({ _openid: OPENID }).remove()
        await transaction.commit()

        // 事务成功后：批量更新lastRecommendedAt（不在事务内，失败不影响订单）
        for (const item of items) {
          await db.collection('records').where({ name: item.name, _openid: OPENID })
            .update({ data: { lastRecommendedAt: now } })
        }

        // 事务成功后：调用subscribe云函数推送订阅消息给家人
        try {
          await cloud.callFunction({
            name: 'subscribe',
            data: { action: 'send', orderId: orderRes._id, familyGroupId: OPENID }
          })
        } catch (e) { console.error('推送调用失败', e) }

        return { data: { _id: orderRes._id, ...orderData } }
      } catch (e) {
        await transaction.rollback()
        console.error('订单事务失败', e)
        return { error: '下单失败' }
      }
    }
    default:
      return { error: '未知action' }
  }
}