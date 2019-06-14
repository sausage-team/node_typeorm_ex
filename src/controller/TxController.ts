import { Controller, Post } from "../decorators"
import Util from '../util'
import {NextFunction, Request, Response} from 'express'
import { TxRole } from '../entity/TxRole'
import { getRepository } from "typeorm"

const ProgressBar = require('../util/process_log')
const request = require('request')
const retry = require('async-retry')
@Controller('/api/tx')
export class TxController {
  private wordList: string[] = Util.getDicWord()
  private txRoleRepository = getRepository(TxRole)

  @Post('/async_role')
  public async async_role (req: Request, response: Response, next: NextFunction) {
    const pb = new ProgressBar('获取id进度', this.wordList.length)
    let count = 0
    const options = {
      url: '',
      method: 'GET',
      headers: {
        'Host': 'bang.tx3.163.com',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
      }
    }

    this.wordList.forEach(async (item: string) => {
      options.url = 'http://bang.tx3.163.com/bang/search4name?name=' + encodeURIComponent(item)
      await retry(async (bail: any) => {
        const fetch: Promise<any> = await request(options, async (err: any, res: any, body: any) => {
          if (!err && res.statusCode === 200) {
            const resp: any = res.body
            if (resp && resp.status === 0) {
              if (resp.result.length > 0) {
                resp.result.forEach(async (n: any) => {
                  this.txRoleRepository.save({
                    role_id: n[1],
                    name: n[0]
                  })
                })
                pb.tick()
              }
            }
          }
          if (err) {
            bail(new Error(err))
            return
          }
        })
      }, {
        retries: 5
      })
    })

    return {
      msg: 'ok',
      status: 0
    }
  }
}