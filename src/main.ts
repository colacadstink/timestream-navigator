import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// TODO remove this once spirit-link 1.3.6 gets published
if(Symbol) {
  (Symbol as any).observable = Symbol.for('observable'); // I'm not sure why this isn't being created right but it's not and it's causing issues
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
