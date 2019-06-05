import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm'

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number

  @Column({
    length: 10
  })
  nickname: string

  @Column({
		length: 20
	})
  username: string

  @Column({
		length: 200
	})
  password: string

	@Column()
  phone: string

  @CreateDateColumn({
    type: 'timestamp'
  })
  createdAt: number

  @UpdateDateColumn({
    type: 'timestamp'
  })
  updateAt: number
  
}
