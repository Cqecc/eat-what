const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  switch (action) {
    case 'preset': {
      const { dishes } = event
      const now = new Date()
      const results = []
      for (const dish of dishes) {
        const data = {
          name: dish.name,
          meal: dish.meal,
          category: dish.category,
          rating: dish.rating,
          note: '',
          photoFileId: '',
          excluded: false,
          lastRecommendedAt: null,
          createdAt: now,
          updatedAt: now
        }
        const res = await db.collection('records').add({ data })
        results.push({ _id: res._id, ...data })
      }
      return { data: results }
    }
    default:
      return { error: '未知action' }
  }
}