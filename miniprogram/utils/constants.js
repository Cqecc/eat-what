const CATEGORIES = ['菜', '汤', '主食', '零食']
const MEALS = ['早', '午', '晚']
const RATINGS = ['好吃', '还行']

const PRESET_DISHES = [
  { name: '红烧肉', meal: '晚', category: '菜' },
  { name: '西红柿炒鸡蛋', meal: '午', category: '菜' },
  { name: '清炒时蔬', meal: '晚', category: '菜' },
  { name: '蒸鸡蛋羹', meal: '早', category: '菜' },
  { name: '小米粥', meal: '早', category: '汤' },
  { name: '紫菜蛋花汤', meal: '午', category: '汤' },
  { name: '米饭', meal: '午', category: '主食' },
  { name: '面条', meal: '午', category: '主食' },
  { name: '馒头', meal: '早', category: '主食' },
  { name: '饺子', meal: '晚', category: '主食' }
]

const CATEGORY_ICONS = {
  '菜': '🥬',
  '汤': '🍲',
  '主食': '🍚',
  '零食': '🍪'
}

const MEAL_ICONS = {
  '早': '🌅',
  '午': '☀️',
  '晚': '🌙'
}

const MEAL_LABELS = {
  '早': '早餐',
  '午': '午餐',
  '晚': '晚餐'
}

const SUBSCRIBE_TEMPLATE_ID = '' // TODO: 微信后台申请订阅消息模板后填写

module.exports = {
  CATEGORIES,
  MEALS,
  RATINGS,
  PRESET_DISHES,
  CATEGORY_ICONS,
  MEAL_ICONS,
  MEAL_LABELS,
  SUBSCRIBE_TEMPLATE_ID
}