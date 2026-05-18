const { MEAL_LABELS } = require('./constants')

function getCurrentMeal() {
  const h = new Date().getHours()
  if (h >= 6 && h < 10) return '早'
  if (h >= 10 && h < 14) return '午'
  return '晚'
}

function getMealLabel(meal) {
  return MEAL_LABELS[meal] || '用餐'
}

function getMealHint(meal) {
  const hints = {
    '早': '早餐时间',
    '午': '午餐时间',
    '晚': '晚餐时间'
  }
  return hints[meal] || '用餐时间'
}

module.exports = { getCurrentMeal, getMealLabel, getMealHint }