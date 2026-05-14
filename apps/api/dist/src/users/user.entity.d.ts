import { BaseEntity } from '../common/entities/base.entity';
export declare class User extends BaseEntity {
    email: string;
    name: string;
    avatarUrl: string;
    passwordHash: string;
    systemRole: 'owner' | 'admin' | 'member';
}
