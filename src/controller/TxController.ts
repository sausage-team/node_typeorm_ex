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
    const pb = new ProgressBar('获取id进度', 50)
    let count = 0
    const options = {
      host: 'bang.tx3.163.com',
      uri: '',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    this.wordList.forEach(async (item: string) => {
      options.uri = 'http://bang.tx3.163.com/bang/search4name?name=' + encodeURIComponent(item)
      await retry(async (bail: any) => {
        const fetch: Promise<any> = await request(options, async (err: any, res: any, body: any) => {
          pb.render({
            completed: count++,
            total: this.wordList.length
          })
          if (res && res.body) {
            const resp: any = res.body
            if (resp && resp.status === 0) {
              if (resp.result.length > 0) {
                resp.result.forEach(async (n: any) => {
                  this.txRoleRepository.save({
                    role_id: n[1],
                    name: n[0]
                  })
                })
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