const { recommend } = require('../utils/recommend')

let sessionExclusions = []

function getRecommendation(mealFilter) {
  const records = getApp().globalData.records
  const { result, exhausted } = recommend(records, mealFilter, sessionExclusions)
  return { result, exhausted }
}

function addToSessionExclusions(name) {
  if (!sessionExclusions.includes(name)) {
    sessionExclusions.push(name)
  }
}

function resetSessionExclusions() {
  sessionExclusions = []
}

module.exports = { getRecommendation, addToSessionExclusions, resetSessionExclusions }