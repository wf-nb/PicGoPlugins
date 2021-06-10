module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('alipic', {
      handle,
      name: 'Alibaba(1688) Uploader'
    })
  }
  const handle = async function (ctx) {
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, imgList[i].fileName)
        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer
        body = JSON.parse(body)
        if (body['url']) {
          imgList[i]['imgUrl'] = body['url']
        } else {
          ctx.emit('notification', {
            title: '上传失败',
            body: '请联系Weifeng(https://wfblog.net/)'
          })
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: '请检查服务端或配置'
      })
    }
  }

  const postOptions = (image, fileName) => {
    let headers = {
      'contentType': 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
	const url = 'https://kfupload.alibaba.com/mupload'
	let customBody = '{"scene":"photobankImageNsRule","name":"' + fileName + '"}'
    let formData = {}
    if (customBody) {
      formData = Object.assign(formData, JSON.parse(customBody))
    }
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData['file'] = {}
    opts.formData['file'].value = image
    opts.formData['file'].options = {
      filename: fileName
    }
    return opts
  }

  return {
    uploader: 'alipic',
    register
  }
}
