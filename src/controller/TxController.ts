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
    const queryBuilder = txRepo.createQueryBuilder()
    data.all_count = await queryBuilder.getCount()
    // data.yh_count = await queryBuilder.where('school = :name', {name: '幽篁国'}).getCount()
    // data.hh_count = await queryBuilder.where('school = :name', {name: '荒火教'}).getCount()
    // data.tx_count = await queryBuilder.where('school = :name', {name: '太虚观'}).getCount()
    // data.tj_count = await queryBuilder.where('school = :name', {name: '天机营'}).getCount()
    // data.yl_count = await queryBuilder.where('school = :name', {name: '云麓仙居'}).getCount()
    // data.ym_count = await queryBuilder.where('school = :name', {name: '翎羽山庄'}).getCount()
    // data.bx_count = await queryBuilder.where('school = :name', {name: '冰心堂'}).getCount()
    // data.wl_count = await queryBuilder.where('school = :name', {name: '魍魉'}).getCount()
    // data.yj_count = await queryBuilder.where('school = :name', {name: '弈剑听雨阁'}).getCount()
    // data.lw_count = await queryBuilder.where('school = :name', {name: '龙巫宫'}).getCount()
    // data.gm_count = await queryBuilder.where('school = :name', {name: '鬼墨'}).getCount()
    data.detail_count = await queryBuilder
      .select('school, COUNT(school) as cnt')
      .where('school IS NOT NULL')
      .groupBy('school')
      .getRawMany()

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