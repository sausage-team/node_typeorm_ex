import { TxRole } from '../entity/TxRole'
import { Hero } from '../entity/Hero'
import { getRepository } from 'typeorm'
import Util from '../util'

const jsdom = require('jsdom')
const $ = require('jquery')(new jsdom.JSDOM().window)
const puppeteer = require('puppeteer')
const kue = require('kue')
const jobs = kue.createQueue()
const wordList: string[] = Util.getDicWord()
const ProgressBar = require('../util/process_log')
const request = require('request')
const retry = require('async-retry')
const _ = require('loadsh')

class repoUtil {
  public heroRepository = getRepository(Hero)
  public txRoleRepository = getRepository(TxRole)
  public roleCount: number = 0

  public async getRoleCount () {
    return await this.txRoleRepository.count()
  }
}

process.on('SIGINT', ( sig ) => {
  jobs.shutdown(5000, (err) => {
    console.log('Kue shutdown: ', err||' Graceful Shutdown' )
    process.exit( 0 )
  })
})

jobs.active((err, ids) => {
  ids.forEach(( id ) => {
    kue.Job.get(id, ( err, job ) => {
      job.remove();
    });
  });
  jobs.process('hero_info', async (job, done) => {
    await pup(job, done)
  })
  
  jobs.process('role_info', async (job, done) => {
    await pup_role(job, done)
  })
})

export const newJob = (name, options) => {
  const job = jobs.create(name, options)
  job
  .on('progress', function(progress, data){
      console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data )
    })
  .on('complete', async () => {
    if (name === 'role_info') {
      if(job.data.role_offset < wordList.length) {
        const option: any = {}
        if (job.data.role_child_offset < 21) {
          option.role_child_offset = job.data.role_child_offset + 1
          option.role_offset = job.data.role_offset
        } else {
          option.role_child_offset = 1
          option.role_offset = job.data.role_offset + 1
        }
        newJob(name, option)
      }
    } else if (name === 'hero_info') {
      const option: any = {}
      if (job.data.offset < await new repoUtil().getRoleCount()) {
        option.offset = job.data.offset + 1
        newJob(name, option)
      }
    } else {}
  })
    .on('failed', (e) => {
      console.log(e)
    })

  job.attempts(5).ttl(10000).save()
}

export const pup_role = async (job, done) => {
  const repo = new repoUtil()
  const options: any = {
    host: 'bang.tx3.163.com',
    url: 'http://bang.tx3.163.com/bang/search4role',
    method: 'GET',
    qs: {
      name: wordList[job.data.role_offset],
      page: job.data.role_child_offset
    },
    "headers": {
      'Host': 'bang.tx3.163.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
    }
  }
  await request(options, async (err: any, res: any, body: any) => {
    if (res && res.statusCode === 200) {
      let resp: any = null
      try {
        resp = JSON.parse(res.body)
      } catch (e) {
      }
      if (resp && resp.status === 0) {
        if (resp.result) {
          if (resp.result.roles.length > 0) {
            await repo.txRoleRepository.save(resp.result.roles)
          }
        }
      }
    }
    if (err) {
      return done(new Error(err))
    }
  })
  done && done()
}

const pup = async (job, done) => {
  const repo = new repoUtil()
  const role = await repo.txRoleRepository.find({
    select: ['id'],
    skip: job.data.offset,
    take: 1
  })
  console.log(role[0].id)
  console.log(job.data.offset)
  const role_id = role[0].id
  const options: any = {
    host: 'bang.tx3.163.com',
    url: `http://bang.tx3.163.com/bang/role/${role_id}`,
    method: 'GET',
    "headers": {
      'Host': 'bang.tx3.163.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
    }
  }
  await request(options, async (err: any, res: any, body: any) => {
    if (res && res.statusCode === 200) {
      if (res.body) {
        const $main = $(`${Util.html_etc(res.body)}`)
        let hero_info: any = null
        try {
          hero_info = hero_info || {}
          const $d_info = $main.find('.dMain .dInfo')
          hero_info.name = $d_info.find('.sTitle').html()
          hero_info.level = parseInt($d_info.find('.sLev em')[1].innerHTML)
          hero_info.img = $d_info.find('.sImg img').attr('src')
          hero_info.school = $d_info.find('.sExp').children()[0].innerHTML
          hero_info.fwq = $d_info.find('.sExp').children()[1].innerHTML.replace(/&nbsp/g, ' ')
          hero_info.shili = $d_info.find('.sExp').children()[2].innerHTML

          const $d_box = $main.find('.dBox_2 .dBox_2-1 .dBox_2-2 .TableListItem')
          hero_info.zbpj = parseInt($d_box.find('.dEquip_1 .ulList_3 li').children()[1].innerHTML)
          hero_info.rwxw = parseInt($d_box.find('.dEquip_2 .ulList_3 li').children()[1].innerHTML)
          hero_info.qhdj = parseInt($d_box.find('.dEquip_2 .ulList_3 li').children()[13].innerHTML)
          hero_info.tlds = parseInt($d_box.find('.dEquip_2 .ulList_3 li').children()[15].innerHTML)

          hero_info.hp = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_4 li').children().prevObject[1].innerHTML)
          hero_info.mp = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_4 li').children().prevObject[3].innerHTML)
          hero_info.li = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_4 li').children().prevObject[5].innerHTML)
          hero_info.ti = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_4 li').children().prevObject[7].innerHTML)
          hero_info.ming = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_4 li').children().prevObject[9].innerHTML)
          hero_info.ji = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_4 li').children().prevObject[11].innerHTML)
          hero_info.hun = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_4 li').children().prevObject[13].innerHTML)
          hero_info.nian = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_4 li').children().prevObject[15].innerHTML)

          hero_info.min_wg = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[1].innerHTML.split('-')[0].replace(/<span>攻力<\/span>/g, ''))
          hero_info.max_wg = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[1].innerHTML.split('-')[1])
          hero_info.mingzhong = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[2].innerHTML.replace(/<span>命中<\/span>/g, ''))
          hero_info.min_fg = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[3].innerHTML.split('-')[0].replace(/<span>法力<\/span>/g, ''))
          hero_info.max_fg = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[3].innerHTML.split('-')[1])
          hero_info.zhongji = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[4].innerHTML.replace(/<span>重击<\/span>/g, ''))
          hero_info.huixin = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[5].innerHTML.replace(/<span>会心一击<\/span>/g, ''))
          hero_info.fushang = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[6].innerHTML.replace(/<span>附加伤害<\/span>/g, ''))
          hero_info.shenfa = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[8].innerHTML.replace(/<span>身法<\/span>/g, ''))
          hero_info.jianren = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[9].innerHTML.replace(/<span>坚韧<\/span>/g, ''))
          hero_info.dingli = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[10].innerHTML.replace(/<span>定力<\/span>/g, ''))
          hero_info.zhuxin = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[11].innerHTML.replace(/<span>诛心<\/span>/g, ''))
          hero_info.yuxin = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[12].innerHTML.replace(/<span>御心<\/span>/g, ''))
          hero_info.wanjun = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[13].innerHTML.replace(/<span>万钧<\/span>/g, ''))
          hero_info.tiebi = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_5').children()[14].innerHTML.replace(/<span>铁壁<\/span>/g, ''))
          hero_info.fangyu = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[1].innerHTML.replace(/<span>防御<\/span>/g, ''))
          hero_info.huibi = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[2].innerHTML.replace(/<span>回避<\/span>/g, ''))
          hero_info.fafang = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[3].innerHTML.replace(/<span>法防<\/span>/g, ''))
          hero_info.shenming = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[4].innerHTML.replace(/<span>神明<\/span>/g, ''))
          hero_info.huajie = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[5].innerHTML.replace(/<span>化解<\/span>/g, ''))
          hero_info.zhibi = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[6].innerHTML.replace(/<span>知彼<\/span>/g, ''))
          hero_info.zhuidian = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[8].innerHTML.replace(/<span>追电<\/span>/g, ''))
          hero_info.zhouyu = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[9].innerHTML.replace(/<span>骤雨<\/span>/g, ''))
          hero_info.jiyu = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[10].innerHTML.replace(/<span>疾语<\/span>/g, ''))
          hero_info.mingsi = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[11].innerHTML.replace(/<span>明思<\/span>/g, ''))
          hero_info.raoxin = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[12].innerHTML.replace(/<span>扰心<\/span>/g, ''))
          hero_info.renhuo = parseInt($d_box.find('.dEquip_2 .dEquips_1 .ulList_6').children()[13].innerHTML.replace(/<span>人祸<\/span>/g, ''))

          const $zb_info = $main.find('.dBox_tc_equip')
          const jhz_list = []
          const lhz_list = []
          hero_info.jhz = 0
          hero_info.lhz = 0

          $zb_info.find('.jhz-box p').children().each((index, item) => {
            jhz_list.push(parseInt(item.style.width) / 8)
          })

          $zb_info.find('.lhz-box p').children().each((index, item) => {
            lhz_list.push(parseInt(item.style.width) / 8)
          })

          for (let i in jhz_list) {
            hero_info.jhz = hero_info.jhz + jhz_list[i]
          }

          for (let i in lhz_list) {
            hero_info.lhz = hero_info.lhz + jhz_list[i]
          }

          hero_info.update_time = $main.find('.dMain .pTab span').html().replace(/数据更新时间：\n\t\t\n\t\t/g, '').replace(/\n\t\t\n\t/g, '')
        } catch(e) {}
        if (hero_info) {
          try {
            const hero: any = await repo.heroRepository.save({
              role_id: role_id,
              ...hero_info
            })
            console.log(hero)
          } catch (e) {
            console.log(e)
          }
        }
      }

      if (err) {
        return done(new Error(err))
      }
    }
  })
  done && done()
}