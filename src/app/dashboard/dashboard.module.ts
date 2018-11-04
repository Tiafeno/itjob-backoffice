import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { CompanyComponent } from './company/company.component';
import { CandidatListComponent } from './candidat-list/candidat-list.component';
import { CandidateOverviewComponent } from './candidat/candidate-overview/candidate-overview.component';
import { CandidateEditComponent } from './candidat/candidate-edit/candidate-edit.component';
import { CandidateComponent } from './candidat/candidate/candidate.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    CompanyComponent,
    CandidatListComponent,
    CandidateOverviewComponent,
    CandidateEditComponent,
    CandidateComponent
  ]
})
export class DashboardModule { }
