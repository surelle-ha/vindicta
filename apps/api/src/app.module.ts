import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TenantsModule } from './tenants/tenants.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ProjectsModule } from './projects/projects.module'
import { TicketsModule } from './tickets/tickets.module'
import { RolesModule } from './roles/roles.module'
import { TenantMiddleware } from './common/middleware/tenant.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),
    TenantsModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TicketsModule,
    RolesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
