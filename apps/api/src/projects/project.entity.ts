import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../common/entities/base.entity'

@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  githubRepo: string

  @Column({ type: 'jsonb', default: '[]' })
  kanbanColumns: object[]

  @Column()
  ownedBy: string
}
