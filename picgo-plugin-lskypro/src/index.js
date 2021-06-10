module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('lskypro', {
      handle,
      name: 'LskyPro Uploader',
	  config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.lskypro')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, imgList[i].fileName, userConfig.url, userConfig.token)
        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer
        body = JSON.parse(body)
        if (body['code'] == 200) {
          imgList[i]['imgUrl'] = body['data']['url']
        } else {
          ctx.emit('notification', {
            title: '上传失败',
            body: body.msg
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

  const postOptions = (image, fileName, url, token) => {
    let headers = {
      'contentType': 'multipart/form-data',
      'User-Agent': 'PicGo',
	  'token': token
    }
    let formData = {}
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData['image'] = {}
    opts.formData['image'].value = image
    opts.formData['image'].options = {
      filename: fileName
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.lskypro')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'url',
        type: 'input',
        default: userConfig.url,
        required: true,
        message: '使用LskyPro的图床的API上传网址（如：https://pic.wfblog.net/api/upload）',
        alias: 'Url'
      },
      {
        name: 'token',
        type: 'input',
        default: userConfig.token,
        required: true,
        message: '在图床获取的Token',
        alias: 'Token'
      }
    ]
  }

  return {
    uploader: 'lskypro',
    register
  }
}
