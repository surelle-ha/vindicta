import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../common/entities/base.entity'

@Entity('roles')
export class Role extends BaseEntity {
  @Column()
  projectId: string

  @Column()
  name: string

  @Column({ default: '#6366f1' })
  color: string

  @Column({ default: 0 })
  order: number
}
