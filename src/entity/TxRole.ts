import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn} from 'typeorm'

@Entity()
export class TxRole {
  @PrimaryGeneratedColumn()
  id: number

  @PrimaryColumn({
    length: 200
  })
  role_id: string

  @Column({
		length: 20
	})
  name: string
}