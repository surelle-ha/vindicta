import { BaseEntity } from '../common/entities/base.entity';
export declare class Project extends BaseEntity {
    name: string;
    description: string;
    githubRepo: string;
    kanbanColumns: object[];
    ownedBy: string;
}
