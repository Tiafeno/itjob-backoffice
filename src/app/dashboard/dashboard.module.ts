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

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
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
  ]
})
export class DashboardModule { }
