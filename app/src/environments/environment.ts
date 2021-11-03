import { enableProdMode } from '@angular/core';
import { Environment } from './model';

export const environment: Environment = {
    configura: function() {
        if (IS_PRODUCTION) {
            enableProdMode();
        }
    }
}