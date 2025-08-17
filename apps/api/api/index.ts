import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import express from 'express';

import { AppModule } from '../src/app.module';

let app: any;

async function createNestApp() {
  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  
  nestApp.setGlobalPrefix('/api/v1/core');
  nestApp.useGlobalPipes(new ValidationPipe());
  nestApp.enableCors();
  
  await nestApp.init();
  return expressApp;
}

export default async (req: Request, res: Response) => {
  if (!app) {
    app = await createNestApp();
  }
  
  return app(req, res);
};