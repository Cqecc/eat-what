async function chooseAndCompressImage() {
  try {
    const res = await wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed']
    })
    const tempFilePath = res.tempFiles[0].tempFilePath
    return tempFilePath
  } catch (e) {
    console.error('图片选择失败', e)
    return null
  }
}

async function uploadImage(tempFilePath, openid) {
  if (!tempFilePath || !openid) return null
  const now = new Date()
  const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const timestamp = now.getTime()
  const random = Math.floor(Math.random() * 10000)
  const cloudPath = `images/${openid}/${yyyyMM}/${timestamp}_${random}.jpg`
  try {
    const res = await wx.cloud.uploadFile({ cloudPath, filePath: tempFilePath })
    return res.fileID
  } catch (e) {
    console.error('图片上传失败', e)
    return null
  }
}

module.exports = { chooseAndCompressImage, uploadImage }