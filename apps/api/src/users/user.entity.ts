import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../common/entities/base.entity'

@Entity('users')
export class User extends BaseEntity {
  @Column()
  email: string

  @Column()
  name: string

  @Column({ nullable: true })
  avatarUrl: string

  @Column({ select: false })
  passwordHash: string

  @Column({ default: 'member' })
  systemRole: 'owner' | 'admin' | 'member'
}
