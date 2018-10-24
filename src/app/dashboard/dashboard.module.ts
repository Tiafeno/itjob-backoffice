import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { CompanyComponent } from './company/company.component';
import { CandidatComponent } from './candidat/candidat.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [HomeComponent, CompanyComponent, CandidatComponent]
})
export class DashboardModule { }
