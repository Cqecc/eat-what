const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  switch (action) {
    case 'saveOpenid': {
      const { familyGroupId } = event
      const existing = await db.collection('family_openids').where({ _openid: OPENID }).count()
      if (existing.total > 0) {
        await db.collection('family_openids').where({ _openid: OPENID })
          .update({ data: { familyGroupId, subscribed: true } })
        return { success: true }
      }
      const data = {
        familyGroupId,
        subscribed: true,
        createdAt: new Date()
      }
      await db.collection('family_openids').add({ data })
      return { success: true }
    }
    case 'send': {
      const { orderId, familyGroupId } = event
      const familyRes = await db.collection('family_openids')
        .where({ familyGroupId, subscribed: true }).get()
      const order = await db.collection('orders').doc(orderId).get()

      for (const member of familyRes.data) {
        let pushSuccess = false
        try {
          await cloud.openapi.subscribeMessage.send({
            touser: member._openid,
            templateId: process.env.TEMPLATE_ID || '',
            page: `pages/home/home?familyGroupId=${familyGroupId}`,
            data: {
              thing1: { value: order.data.items.map(i => i.name).join('、') },
              thing2: { value: order.data.note || '无备注' },
              time3: { value: order.data.createdAt.toLocaleString('zh-CN') }
            }
          })
          pushSuccess = true
        } catch (e) { console.error('推送失败', member._openid, e) }
        // 只在推送成功后标记subscribed为false（单次授权已消耗）
        // 推送失败保留subscribed=true，下次下单时重试
        if (pushSuccess) {
          await db.collection('family_openids').doc(member._id).update({ data: { subscribed: false } })
        }
      }
      return { success: true }
    }
    default:
      return { error: '未知action' }
  }
}