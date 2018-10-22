import { Module } from '@nestjs/common';
import { PercollateController } from './percollate.controller';
import { PercollateService } from './percollate.service';

@Module({
  controllers: [PercollateController],
  providers: [PercollateService],
})
export class PercollateModule {}
