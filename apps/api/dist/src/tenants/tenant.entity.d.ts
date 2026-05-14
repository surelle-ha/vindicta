import { BaseEntity } from '../common/entities/base.entity';
export declare class Tenant extends BaseEntity {
    slug: string;
    name: string;
    plan: string;
    active: boolean;
}
