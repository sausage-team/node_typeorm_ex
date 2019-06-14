import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn} from 'typeorm'

@Entity()
export class TxRole {

  @PrimaryColumn({
    length: 200
  })
  id: string

  @Column()
  name: string

  @Column()
  school: string

  @Column()
  level: number

  @Column()
  clan: string

  @Column()
  sector: string

  @Column()
  server: string

  @Column()
  equ_xiuwei: number

  @Column()
  xiuwei: number

  @Column()
  total_xiuwei: number

  

}