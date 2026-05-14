import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from '../common/entities/base.entity'

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ unique: true })
  slug: string

  @Column()
  name: string

  @Column({ nullable: true })
  plan: string

  @Column({ default: true })
  active: boolean
}
