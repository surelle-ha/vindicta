import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyRequest, FastifyReply } from 'fastify'

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const host = (req as any).headers?.host ?? ''
    // Resolve tenant from subdomain: acme.vindicta.app → tenantId = 'acme'
    const subdomain = host.split('.')[0]
    const tenantHeader = (req as any).headers?.['x-tenant-id']
    ;(req as any).tenantId = tenantHeader ?? (subdomain !== 'vindicta' ? subdomain : null)
    next()
  }
}
