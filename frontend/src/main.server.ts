import 'zone.js/node';

import { bootstrapApplication } from '@angular/platform-browser';
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { BootstrapContext } from '@angular/platform-browser';

import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

const serverConfig = {
  providers: [provideServerRendering()]
};

const mergedConfig = mergeApplicationConfig(appConfig, serverConfig);

export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(AppComponent, mergedConfig, context);
}
