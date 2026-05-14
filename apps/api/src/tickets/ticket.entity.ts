import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../common/entities/base.entity'

@Entity('tickets')
export class Ticket extends BaseEntity {
  @Column()
  projectId: string

  @Column()
  title: string

  @Column({ nullable: true, type: 'text' })
  description: string

  @Column({ default: 'feature' })
  type: string

  @Column({ default: 'backlog' })
  status: string

  @Column({ default: 'medium' })
  priority: string

  @Column({ type: 'jsonb', default: '[]' })
  labels: string[]

  @Column({ type: 'jsonb', default: '[]' })
  roleIds: string[]

  @Column({ nullable: true })
  sprintId: string

  @Column({ nullable: true })
  resolvedAt: Date

  @Column()
  createdBy: string
}
