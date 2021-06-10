module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('smms-user', {
      handle,
      name: 'SM.MS-登录用户',
      config: config
    })
  }
  const postOptions = (Authorization, fileName, image) => {
    let headers = {
      'contentType': 'multipart/form-data',
      'User-Agent': 'PicGo',
	  'Authorization': Authorization
    }
    let formData = {}
    const opts = {
      method: 'POST',
      url: 'https://sm.ms/api/v2/upload',
      headers: headers,
      formData: formData
    }
    opts.formData['smfile'] = {}
    opts.formData['smfile'].value = image
    opts.formData['smfile'].options = {
      filename: fileName
    }
    return opts
  };
  const handle = async (ctx) => {
    let userConfig = ctx.getConfig('picBed.smms-user')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    const Authorization = userConfig.Authorization
    const imgList = ctx.output;
    for (let i in imgList) {
      let image = imgList[i].buffer;
      if (!image && imgList[i].base64Image) {
        image = Buffer.from(imgList[i].base64Image, 'base64');
      }
      const postConfig = postOptions(Authorization, imgList[i].fileName, image);
      let body = await ctx.Request.request(postConfig);
      
      body = JSON.parse(body);
      if (body.code === 'success') {
        delete imgList[i].base64Image;
        delete imgList[i].buffer;
        imgList[i]['imgUrl'] = body.data.url;
      }
      else {
        ctx.emit('notification', {
          title: '上传失败',
          body: body.message
        });
        throw new Error(body.message);
      }
    }
    return ctx;
  };
  
  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.smms-user')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'Authorization',
        type: 'input',
        default: userConfig.Authorization,
        required: true,
        message: 'Auth',
        alias: 'Auth'
      }
    ]
  }
  return {
    uploader: 'smms-user',
    config: config,
    register
  }
}
