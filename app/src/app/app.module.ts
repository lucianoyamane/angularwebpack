import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatIconModule, MatGridListModule, MatToolbarModule, MatMenuModule, MatStepperModule, MatTabsModule } from '@angular/material';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ROUTES } from './app.routes';
import { DECLARATIONS } from './app.declarations';
import { ENTRY_COMPONENTS } from './app.entryComponents'
import { AppComponent } from './app.component';

import "../styles/styles.scss"


@NgModule({
  bootstrap: [AppComponent],
  entryComponents: ENTRY_COMPONENTS,
  declarations: DECLARATIONS,
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatIconModule,
    MatGridListModule,
    MatToolbarModule,
    MatMenuModule,
    MatStepperModule,
    MatTabsModule
  ],
  providers: [
    HttpClientModule
  ]
  
})
export class AppModule {}