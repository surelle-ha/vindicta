"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }));
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors({ origin: ['http://localhost:3000', 'https://vindicta.app'] });
    const port = Number(process.env.PORT ?? 3001);
    await app.listen(port, '0.0.0.0');
    console.log(`Vindicta API listening on :${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map