const { CATEGORIES, MEALS, RATINGS } = require('../../utils/constants')
const recordStore = require('../../stores/recordStore')

Component({
  properties: {
    record: { type: Object, value: null },
    visible: { type: Boolean, value: false }
  },

  data: {
    name: '', meal: '', category: '', rating: '', note: '',
    excluded: false,
    categories: CATEGORIES,
    meals: MEALS,
    ratings: RATINGS
  },

  observers: {
    'record': function(r) {
      if (r) {
        this.setData({
          name: r.name, meal: r.meal, category: r.category,
          rating: r.rating, note: r.note, excluded: r.excluded
        })
      }
    }
  },

  methods: {
    onNameInput(e) { this.setData({ name: e.detail.value }) },
    onMealTap(e) { this.setData({ meal: e.currentTarget.dataset.value }) },
    onCategoryTap(e) { this.setData({ category: e.currentTarget.dataset.value }) },
    onRatingTap(e) { this.setData({ rating: e.currentTarget.dataset.value }) },
    onNoteInput(e) { this.setData({ note: e.detail.value }) },

    onClose() { this.triggerEvent('close') },

    async onSave() {
      if (!this.data.name.trim()) {
        wx.showToast({ title: '请输入菜名', icon: 'none' })
        return
      }
      wx.showLoading({ title: '保存中' })
      try {
        await recordStore.updateRecord(this.properties.record._id, {
          name: this.data.name.trim(),
          meal: this.data.meal,
          category: this.data.category,
          rating: this.data.rating,
          note: this.data.note
        })
        this.triggerEvent('saved')
        wx.showToast({ title: '保存成功', icon: 'success' })
      } catch (e) { console.error('编辑保存失败', e) }
      finally { wx.hideLoading() }
    },

    async onExclude() {
      wx.showLoading({ title: '操作中' })
      try {
        await recordStore.updateRecord(this.properties.record._id, {
          excluded: !this.data.excluded
        })
        this.setData({ excluded: !this.data.excluded })
        this.triggerEvent('saved')
        wx.showToast({ title: this.data.excluded ? '已排除推荐' : '已恢复推荐', icon: 'none' })
      } catch (e) { console.error('排除操作失败', e) }
      finally { wx.hideLoading() }
    },

    async onDelete() {
      const res = await wx.showModal({ title: '确认删除', content: '删除后不可恢复' })
      if (!res.confirm) return
      wx.showLoading({ title: '删除中' })
      try {
        await recordStore.deleteRecord(this.properties.record._id)
        this.triggerEvent('saved')
        this.triggerEvent('close')
        wx.showToast({ title: '已删除', icon: 'success' })
      } catch (e) { console.error('删除失败', e) }
      finally { wx.hideLoading() }
    }
  }
})