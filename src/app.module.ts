import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PercollateModule } from './percollate/percollate.module';

@Module({
  imports: [PercollateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
