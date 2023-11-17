import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  await app.listen(process.env.PORT || 3000);
  console.log('Listening at http://localhost:3000');
}
bootstrap();
