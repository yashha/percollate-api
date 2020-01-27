import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: 'https://readtheweb.de'
  });

  await app.listen(process.env.PORT || 3000);
  console.log('Listening at http://localhost:3000');
}
bootstrap();
