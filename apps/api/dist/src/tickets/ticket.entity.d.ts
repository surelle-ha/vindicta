import { BaseEntity } from '../common/entities/base.entity';
export declare class Ticket extends BaseEntity {
    projectId: string;
    title: string;
    description: string;
    type: string;
    status: string;
    priority: string;
    labels: string[];
    roleIds: string[];
    sprintId: string;
    resolvedAt: Date;
    createdBy: string;
}
