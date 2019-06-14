const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const secret = 'sausage-team.com'
const token = {
  createToken: (obj, timeout) => {
    const obj2 = {
      data: obj,
      created: parseInt(`${Date.now() / 1000}`),
      exp: parseInt(timeout) || 10
    }
    const token = jwt.sign(obj2, secret, { algorithm: 'HS256' })
    return  token
  },

  decodeToken: (token) => {
    if(!token) {
      return false
    }
    try {
      var decoded = jwt.verify(token, secret, { algorithm: 'HS256' });
      return decoded
    } catch(err) {
      return false
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