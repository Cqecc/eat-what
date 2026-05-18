const { getCurrentMeal } = require('./mealTime')

function buildRecommendPool(records, mealFilter, sessionExclusions) {
  let pool = records.filter(r => !r.excluded)

  if (mealFilter) {
    pool = pool.filter(r => r.category === mealFilter)
  }

  const currentMeal = getCurrentMeal()
  const currentMealGood = pool.filter(r => r.meal === currentMeal && r.rating === '好吃')
  const otherMealGood = pool.filter(r => r.meal !== currentMeal && r.rating === '好吃')
  const okPool = pool.filter(r => r.rating === '还行')

  // 时段分层：当前时段好吃池优先，其他时段好吃池补充
  let candidatePool = [...currentMealGood, ...otherMealGood]

  // 10%概率穿插「还行」池
  if (okPool.length > 0 && Math.random() < 0.1) {
    candidatePool = [...candidatePool, ...okPool]
  }

  // 排除会话排除列表
  candidatePool = candidatePool.filter(r => !sessionExclusions.includes(r.name))

  // 按菜名去重（同一菜名取 lastRecommendedAt 最早的作为候选）
  const nameMap = {}
  candidatePool.forEach(r => {
    if (!nameMap[r.name] || (r.lastRecommendedAt || '') < (nameMap[r.name].lastRecommendedAt || '')) {
      nameMap[r.name] = r
    }
  })
  candidatePool = Object.values(nameMap)

  return candidatePool
}

function weightedRandomSelect(pool) {
  if (pool.length === 0) return null

  // 按 lastRecommendedAt 升序排列（null视为最小，从未被推荐的排最前）
  pool.sort((a, b) => {
    const aTime = a.lastRecommendedAt || ''
    const bTime = b.lastRecommendedAt || ''
    return aTime < bTime ? -1 : aTime > bTime ? 1 : 0
  })

  // 前3条权重为3/2/1，其余权重为1
  const weights = pool.map((_, i) => {
    if (i === 0) return 3
    if (i === 1) return 2
    if (i === 2) return 1
    return 1
  })

  const totalWeight = weights.reduce((s, w) => s + w, 0)
  let random = Math.random() * totalWeight

  for (let i = 0; i < pool.length; i++) {
    random -= weights[i]
    if (random <= 0) return pool[i]
  }

  return pool[pool.length - 1]
}

function recommend(records, mealFilter, sessionExclusions) {
  const pool = buildRecommendPool(records, mealFilter, sessionExclusions)
  if (pool.length === 0) return { result: null, exhausted: true }
  const result = weightedRandomSelect(pool)
  return { result, exhausted: false }
}

module.exports = { buildRecommendPool, weightedRandomSelect, recommend }