import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PercollateModule } from './percollate/percollate.module.js';

@Module({
  imports: [PercollateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
