import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn} from 'typeorm'

@Entity()
export class Hero {

  @PrimaryColumn({
    length: 200
  })
  role_id: string

  @Column({
		length: 20
	})
  name: string

  @Column({
		length: 20
	})
  level: string

  @Column()
  img: string

  @Column({
		length: 20
	})
  school: string

  @Column({
		length: 20
	})
  fwq: string

  @Column({
		length: 20
	})
  shili: string

  @Column()
  zbpj: number

  @Column()
  rwxw: number

  @Column()
  qhdj: number

  @Column()
  tlds: number

  @Column()
  hp: number

  @Column()
  mp: number

  @Column()
  li: number

  @Column()
  ti: number

  @Column()
  ming: number

  @Column()
  ji: number

  @Column()
  hun: number

  @Column()
  nian: number

  @Column()
  min_wg: number

  @Column()
  max_wg: number

  @Column()
  mingzhong: number

  @Column()
  min_fg: number

  @Column()
  max_fg: number

  @Column()
  zhongji: number

  @Column()
  huixin: number

  @Column()
  fushang: number

  @Column()
  shenfa: number

  @Column()
  jianren: number

  @Column()
  dingli: number

  @Column()
  zhuxin: number

  @Column()
  yuxin: number

  @Column()
  wanjun: number

  @Column()
  tiebi: number

  @Column()
  fangyu: number

  @Column()
  huibi: number

  @Column()
  fafang: number

  @Column()
  shenming: number

  @Column()
  huajie: number

  @Column()
  zhibi: number

  @Column()
  zhuidian: number

  @Column()
  zhouyu: number

  @Column()
  jiyu: number

  @Column()
  mingsi: number

  @Column()
  raoxin: number

  @Column()
  renhuo: number

  @Column()
  jhz: number

  @Column()
  lhz: number

  @Column()
  update_time: string
}