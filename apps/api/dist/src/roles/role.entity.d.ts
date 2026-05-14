import { BaseEntity } from '../common/entities/base.entity';
export declare class Role extends BaseEntity {
    projectId: string;
    name: string;
    color: string;
    order: number;
}
