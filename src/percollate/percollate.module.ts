import { Module } from '@nestjs/common';
import { PercollateController } from './percollate.controller.js';
import { PercollateService } from './percollate.service.js';

@Module({
  controllers: [PercollateController],
  providers: [PercollateService],
})
export class PercollateModule {}
