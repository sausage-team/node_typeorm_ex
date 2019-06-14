import { Controller, Post, Get } from "../decorators"
import Util from '../util'
import {NextFunction, Request, Response} from 'express'

import { newJob, pup_role } from '../client/hero'

@Controller('/api/tx')
export class TxController {
  private wordList: string[] = Util.getDicWord()

  @Get('/async_role')
  public async async_role (req: Request, response: Response, next: NextFunction) {

    newJob('role_info', {
      role_offset: 0
    })
    return {
      msg: 'ok',
      status: 0
    }
  }

  @Get('/get_hero')
  public async get_hero (req: Request, response: Response, next: NextFunction) {
    const options = {
      "method": "GET",
      "hostname": "bang.tx3.163.com",
      "port": null,
      "path": "/bang/role/28_31956",
      "headers": {
        'Host': 'bang.tx3.163.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
      }
    }

    // const data = await request()
  }

  @Get('/async_role_info')
  public async async_role_info (req: Request, response: Response, next: NextFunction) {
    // const pb = ProgressBar('获取hero进度', 50)
    newJob('hero_info', {
      role_offset: 0,
      role_child_offset: 1
    })
    return {
      msg: 'ok',
      status: 0
    }
  }
}