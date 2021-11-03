/**
 * Angular bootstrapping
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from 'environments/environment';

/**
 * App Module
 * our top level module that holds all of our components
 */
import { AppModule } from './app';

environment.configura();

/**
 * Needed for hmr
 * in prod this is replace for document ready
 */
switch (document.readyState) {
  case 'interactive':
  case 'complete':
  default:
  platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
}
