import { Controller, Post, Get } from "../decorators"
import Util from '../util'
import {NextFunction, Request, Response} from 'express'

import { newJob, pup_role, repoUtil } from '../client/hero'
import { Transaction, TransactionRepository, Repository } from "typeorm"
import { TxRole } from '../entity/TxRole'

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
    newJob('hero_info', {
      role_offset: 0,
      role_child_offset: 1,
      offset: 0
    })
    return {
      msg: 'ok',
      status: 0
    }
  }

  @Transaction()
  public async count(@TransactionRepository(TxRole) txRepo: Repository<TxRole>) {
    let data: any = {}
    const qb = txRepo.createQueryBuilder()
    // data.all_count = await qb.select('COUNT(*)')
    data.all_count = await txRepo.count()
    data.yh_count = await txRepo.count({
      school: '幽篁国'
    })
    data.hh_count = await txRepo.count({
      school: '荒火教'
    })
    data.tx_count = await txRepo.count({
      school: '太虚观'
    })
    data.tj_count = await txRepo.count({
      school: '天机营'
    })
    data.yl_count = await txRepo.count({
      school: '云麓仙居'
    })
    data.ym_count = await txRepo.count({
      school: '翎羽山庄'
    })
    data.bx_count = await txRepo.count({
      school: '冰心堂'
    })
    data.wl_count = await txRepo.count({
      school: '魍魉'
    })
    data.yj_count = await txRepo.count({
      school: '弈剑听雨阁'
    })
    data.lw_count = await txRepo.count({
      school: '龙巫宫'
    })
    data.gm_count = await txRepo.count({
      school: '鬼墨'
    })

    return data
  }

  @Get('/role_count')
  public async role_count (req: Request, response: Response, next: NextFunction) {
    const repo = new repoUtil()
    const txRepo = repo.txRoleRepository
    let status = 0
    let data !: any
    let msg = '获取成功'

    try {
      data = await this.count(txRepo)
    } catch (e) {
      status = 1
      msg = '获取失败'
    }
    return {
      status,
      msg,
      data
    }
  }
}