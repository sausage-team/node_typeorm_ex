const crypto=require('crypto')

const token = {
  createToken: (obj, timeout) => {
    const obj2 = {
      data: obj,//payload
      created: parseInt('' + Date.now() / 1000),//token生成的时间的，单位秒
      exp: parseInt(timeout) || 10//token有效期
    }
    const base64Str = Buffer.from(JSON.stringify(obj2), 'utf8').toString('base64')
    const secret = 'hel.h-five.com'
    const hash = crypto.createHmac('sha256',secret)
    hash.update(base64Str)
    const signature = hash.digest('base64')

    return  base64Str + '.' + signature
  },

  decodeToken: (token) => {
    if(!token) {
      return false
    }
    const decArr = token.split('.')
    if(decArr.length<2) {
      //token不合法
      return false
    }
    let payload = {}

    try {
      payload = JSON.parse(Buffer.from(decArr[0], 'base64').toString('utf8'))
    } catch(e) {
      return false
    }

    const secret = 'hel.h-five.com'
    const hash = crypto.createHmac('sha256',secret)
    hash.update(decArr[0])
    const checkSignature = hash.digest('base64')

    return {
      payload: payload,
      signature: decArr[1],
      checkSignature: checkSignature
    }
  },
  checkToken: (token) => {
    const resDecode = this.decodeToken(token)
    if (!resDecode) {
      return false
    }
    const expState = ((parseInt('' + Date.now() / 1000) - parseInt(resDecode.payload.created)) > parseInt(resDecode.payload.exp)) ? false : true

    if(resDecode.signature === resDecode.checkSignature && expState) {
      return true
    }
  }
}

module.exports = token