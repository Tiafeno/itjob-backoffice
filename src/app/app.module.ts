import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './/app.component';
import { AppRoutingModule } from './/app-routing.module';
import { LayoutModule } from './/layouts/layout.module';
import { ScriptLoaderService } from './_services/script-loader.service';
import { IndexComponent } from './index/index.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.router';
import { IndexModule } from './index/index.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthService } from './services/auth.service';
import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptorService } from './services/jwt-interceptor.service';
import { RequestService } from './services/request.service';
import { CandidateService } from './services/candidate.service';
import { PostuledCandidatesComponent } from './directives/offers/postuled-candidates/postuled-candidates.component';
import { OfferService } from './services/offer.service';
import { NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    DashboardComponent,
    PostuledCandidatesComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    IndexModule,
    DashboardModule,
    LayoutModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    ScriptLoaderService,
    CandidateService,
    OfferService,
    RequestService,
    AuthService,
    AuthGuard,
    LoginGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },
    {
      provide: NG_SELECT_DEFAULT_CONFIG,
      useValue: {
        notFoundText: 'Custom not found'
      }
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
