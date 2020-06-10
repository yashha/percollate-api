import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import serverless from 'serverless-http';
import express from 'express';

const server = express();

server.use('/.netlify/functions/server'); // path must route to lambda

export const createNestServer = async expressInstance => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));
  app.use(helmet());
  return app.init();
};

createNestServer(server)
  .then(v => console.log('Nest Ready'))
  .catch(err => console.error('Nest broken', err));

export const handler = serverless(server);