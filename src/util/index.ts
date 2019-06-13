const _ = require('loadsh')
const fs = require('fs')

export default class Util {

  public static word: string[] = []

  public static response_manage (
    promise: Promise<any>,
    success: Function,
    error: Function = () => {}
  ): Promise<any> {
    return new Promise((resolve: any) => {
      promise.then((result: any) => {
        const data = success(result)
        resolve({
          status: 0,
          msg: 'OK',
          data: data
        })
      }, (error: any) => {
        error()
        resolve({
          status: 1,
          msg: 'ERROR',
          data: error
        })
      }).catch((error: any) => {
        resolve({
          status: 1,
          msg: 'ERROR',
          data: error
        })
      })
    })
  }

  public static getDate() {
    const now = new Date()
    const year = now.getFullYear().toString()
    const old_month = now.getMonth() + 1
    const old_day = now.getDate()
    const month = ((old_month < 10)?('0' + old_month):(old_month)).toString()
    const day = ((old_day < 10)?('0' + old_day):(old_day)).toString()
    return year + month + day
  }

  public static getCode(str: string) {
    let res = ''
    if(str) {
      res = str.substring(19, 25)
    }
    return res
  }

  public static GetDomainName (str: string | string[]) {
    let url: string = str.toString()
    if (url.indexOf('http://') > -1) {
      url = url.replace(/http:\/\//g, '')
    } else if (url.indexOf('https://') > -1) {
      url = url.replace(/https:\/\//g, '')
    }
    if (url.indexOf('/')) {
      url = url.replace(/\//g, '')
    }
    if (url.indexOf(':')) {
      let tmp = url.split(':')
      url = tmp[0]
    }
    return url
  }

  public static getDicWord (): string[] {
    if (!this.word || this.word.length === 0) {
      const data: any = fs.readFileSync(`src/lib/simple-cn`,'utf-8')
      this.word = _.uniq(data.split('\n'))
    }
    return this.word
  }
}