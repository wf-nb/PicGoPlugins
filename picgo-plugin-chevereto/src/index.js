module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('chevereto', {
      handle,
      name: 'Chevereto Uploader',
	  config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.chevereto')
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
        const postConfig = postOptions(image, imgList[i].fileName, userConfig.url, userConfig.key, userConfig.source_param||'source')
        let body = await ctx.Request.request(postConfig, function(error, response, body) {
            if (error) {
              console.log(body)
              throw new Error('上传图片失败')
            }
        })
		if (!body) {
         throw new Error('上传图片失败' + body)
        }

        delete imgList[i].base64Image
        delete imgList[i].buffer
        body = JSON.parse(body)
        if (body['status_code'] == 200) {
		  url_param = userConfig.url_param?userConfig.url_param:'url'
          imgList[i]['imgUrl'] = eval('body.image.' + url_param)
        } else {
          ctx.emit('notification', {
            title: '上传失败',
            body: body.status_txt
          })
		  throw new Error('上传失败' + body)
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: '请检查服务端或配置'
      })
	  throw err
    }
  }

  const postOptions = (image, fileName, url, key, source_param) => {
    let headers = {
      'contentType': 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
    let formData = {
      'key': key,
	  'format': 'json'
	}
    const opts = {
      method: 'POST',
      url: url,
	  strictSSL: false,
      headers: headers,
      formData: formData
    }
    opts.formData[source_param] = {}
    opts.formData[source_param].value = image
    opts.formData[source_param].options = {
      filename: fileName
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.chevereto')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'url',
        type: 'input',
        default: userConfig.url,
        required: true,
        message: '使用Chevereto的图床的API上传网址（如：https://example.com/api/1/upload）',
        alias: 'Url'
      },
      {
        name: 'key',
        type: 'input',
        default: userConfig.key,
        required: true,
        message: '在图床获取的Key',
        alias: 'Key'
      },
      {
        name: 'source_param',
        type: 'input',
        default: userConfig.source_param,
        required: false,
        message: '上传API的文件参数（可不填，默认为source）',
        alias: 'Source Param'
      },
      {
        name: 'url_param',
        type: 'input',
        default: userConfig.url_param,
        required: false,
        message: '获取返回图片链接的键名（可不填，默认为url）',
        alias: 'Url Param'
      }
    ]
  }

  return {
    uploader: 'chevereto',
    register
  }
}
