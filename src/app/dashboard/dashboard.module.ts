import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { CandidatListComponent } from './candidat/candidat-list/candidat-list.component';
import { CandidateOverviewComponent } from './candidat/candidate-overview/candidate-overview.component';
import { CandidateEditComponent } from './candidat/candidate-edit/candidate-edit.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OfferListsComponent } from './offers/offer-lists/offer-lists.component';
import { OfferEditComponent } from './offers/offer-edit/offer-edit.component';
import { CompanyListsComponent } from './company/company-lists/company-lists.component';
import { CompanyEditComponent } from './company/company-edit/company-edit.component';
import { Error404Component } from '../pages/error-404/error-404.component';
import { NgSelectModule, NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { SweetAlert2Module} from '@toverux/ngx-sweetalert2';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    SweetAlert2Module,
  ],
  declarations: [
    HomeComponent,
    CandidatListComponent,
    CandidateOverviewComponent,
    CandidateEditComponent,
    OfferListsComponent,
    OfferEditComponent,
    CompanyListsComponent,
    CompanyEditComponent,
    Error404Component,
  ],
  providers: [
    {
      provide: NG_SELECT_DEFAULT_CONFIG,
      useValue: {
        notFoundText: 'Custom not found'
      }
    }
  ]
})
export class DashboardModule { }
