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
import { PostuledCandidatesComponent } from '../directives/offers/postuled-candidates/postuled-candidates.component';
import { UserListsComponent } from './users/user-lists/user-lists.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { ActivityAreaComponent } from '../directives/search/activity-area/activity-area.component';
import { SwitcherComponent } from '../directives/account/switcher/switcher.component';
import { StatusChangerComponent } from '../directives/account/status-changer/status-changer.component';
import { UploadfileDirective } from '../directives/candidat/uploadfile.directive';
import { FeaturedSwitcherComponent } from '../directives/candidat/featured-switcher/featured-switcher.component';
import { ArchivedCandidateComponent } from '../directives/candidat/archived-candidate/archived-candidate.component';

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
    PostuledCandidatesComponent,
    UserListsComponent,
    UserEditComponent,
    ActivityAreaComponent,
    SwitcherComponent,
    StatusChangerComponent,
    FeaturedSwitcherComponent,
    ArchivedCandidateComponent,
    UploadfileDirective
  ],
  providers: [
    {
      provide: NG_SELECT_DEFAULT_CONFIG,
      useValue: {
        notFoundText: 'Custom not found'
      }
    }
  ],
  exports: [
    UploadfileDirective
  ]
})
export class DashboardModule { }
