const { CATEGORIES, MEALS, RATINGS } = require('../../utils/constants')
const { chooseAndCompressImage, uploadImage } = require('../../utils/imageUtil')
const recordStore = require('../../stores/recordStore')

Component({
  properties: {
    editData: { type: Object, value: null }
  },

  data: {
    name: '',
    meal: '晚',
    category: '菜',
    rating: '好吃',
    note: '',
    photoThumb: '',
    photoFileId: '',
    categories: CATEGORIES,
    meals: MEALS,
    ratings: RATINGS
  },

  observers: {
    'editData': function(data) {
      if (data) {
        this.setData({
          name: data.name || '',
          meal: data.meal || '晚',
          category: data.category || '菜',
          rating: data.rating || '好吃',
          note: data.note || '',
          photoThumb: data.photoFileId || '',
          photoFileId: data.photoFileId || ''
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

    async onChoosePhoto() {
      const tempPath = await chooseAndCompressImage()
      if (tempPath) this.setData({ photoThumb: tempPath, photoFileId: '' })
    },

    async onSave() {
      if (!this.data.name.trim()) {
        wx.showToast({ title: '请输入菜名', icon: 'none' })
        return
      }

      wx.showLoading({ title: '保存中' })
      try {
        // 如果有新拍的图，先上传
        let photoFileId = this.data.photoFileId
        if (this.data.photoThumb && !this.data.photoFileId) {
          photoFileId = await uploadImage(this.data.photoThumb, getApp().globalData.creatorOpenid)
        }

        const payload = {
          name: this.data.name.trim(),
          meal: this.data.meal,
          category: this.data.category,
          rating: this.data.rating,
          note: this.data.note,
          photoFileId: photoFileId || ''
        }

        if (this.properties.editData) {
          await recordStore.updateRecord(this.properties.editData._id, payload)
        } else {
          await recordStore.addRecord(payload)
        }

        this.resetForm()
        this.triggerEvent('saved')
        wx.showToast({ title: '保存成功', icon: 'success' })
      } catch (e) {
        console.error('保存失败', e)
      } finally {
        wx.hideLoading()
      }
    },

    resetForm() {
      this.setData({
        name: '', meal: '晚', category: '菜', rating: '好吃',
        note: '', photoThumb: '', photoFileId: ''
      })
    }
  }
})