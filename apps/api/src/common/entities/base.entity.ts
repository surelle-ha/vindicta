import { PrimaryColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, Column } from 'typeorm'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  id: string

  @Column({ type: 'varchar', length: 12, nullable: true })
  tenantId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = nanoid()
  }
}
