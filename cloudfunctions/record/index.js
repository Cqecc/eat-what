const cloud = require('@wxjs/cloud')

exports.main = async (event, context) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  switch (action) {
    case 'list': {
      const res = await db.collection('records').where({ _openid: OPENID }).get()
      return { data: res.data, openid: OPENID }
    }
    case 'add': {
      const { name, meal, category, rating, note, photoFileId } = event
      const now = new Date()
      const data = {
        name, meal, category, rating,
        note: note || '',
        photoFileId: photoFileId || '',
        excluded: false,
        lastRecommendedAt: null,
        createdAt: now,
        updatedAt: now
      }
      const res = await db.collection('records').add({ data })
      return { data: { _id: res._id, ...data } }
    }
    case 'update': {
      const { id } = event
      // 先校验文档归属，文档不存在时doc().get()会抛异常
      try {
        const doc = await db.collection('records').doc(id).get()
        if (!doc.data || doc.data._openid !== OPENID) return { error: '无权限' }
      } catch (e) { return { error: '记录不存在或无权限' } }
      const allowedFields = ['name', 'meal', 'category', 'rating', 'note', 'excluded']
      const updateData = { updatedAt: new Date() }
      for (const field of allowedFields) {
        if (event[field] !== undefined) updateData[field] = event[field]
      }
      await db.collection('records').doc(id).update({ data: updateData })
      return { success: true }
    }
    case 'updateRecommendedAt': {
      const { name } = event
      const now = new Date()
      await db.collection('records').where({ name, _openid: OPENID }).update({ data: { lastRecommendedAt: now } })
      return { success: true }
    }
    case 'delete': {
      const { id } = event
      // 先校验文档归属并获取图片信息，文档不存在时doc().get()会抛异常
      let record
      try {
        record = await db.collection('records').doc(id).get()
        if (!record.data || record.data._openid !== OPENID) return { error: '无权限' }
      } catch (e) { return { error: '记录不存在或无权限' } }
      if (record.data.photoFileId) {
        try { await cloud.deleteFile({ fileList: [record.data.photoFileId] }) } catch (e) { console.error('图片删除失败', e) }
      }
      await db.collection('records').doc(id).remove()
      return { success: true }
    }
    default:
      return { error: '未知action' }
  }
}