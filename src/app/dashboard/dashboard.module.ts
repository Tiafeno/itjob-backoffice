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
import { TaxonomyComponent } from './taxonomy/taxonomy.component';
import { EditTaxonomyComponent } from './taxonomy/edit-taxonomy/edit-taxonomy.component';
import { NewTaxonomyComponent } from './taxonomy/new-taxonomy/new-taxonomy.component';
import { FeaturedOfferComponent } from '../directives/offers/featured-offer/featured-offer.component';
import { SettingsComponent } from './settings/settings.component';
import { RatePlanComponent } from '../directives/offers/rate-plan/rate-plan.component';
import { DeadlineOfferComponent } from '../directives/offers/deadline-offer/deadline-offer.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { BlogsComponent } from './blogs/blogs.component';
import { NewslettersComponent } from './newsletters/newsletters.component';
import { NewNewsletterComponent } from './newsletters/new-newsletter/new-newsletter.component';
import { EditBlogComponent } from './blogs/edit-blog/edit-blog.component';
import { NewBlogComponent } from './blogs/new-blog/new-blog.component';
import { ViewNewsletterComponent } from './newsletter/view-newsletter/view-newsletter.component';
import { PublicityComponent } from './publicity/publicity.component';
import { CompanyOffersComponent } from './company/company-offers/company-offers.component';
import { MomendatePipe } from '../pipes/momendate.pipe';
import { DatepickerDirective } from '../directives/datepicker.directive';
import { CoverLetterComponent } from '../directives/candidat/cover-letter/cover-letter.component';
import { ImageSizePipe } from '../pipes/image-size.pipe';
import { CompareValidatorDirective } from '../directives/compare-validator.directive';
import { RequestFormationsComponent } from './request-formations/request-formations.component';
import { FormationsComponent } from './formations/formations.component';
import { FormationEditComponent } from './formations/formation-edit/formation-edit.component';
import { RequestFormationEditComponent } from './request-formations/request-formation-edit/request-formation-edit.component';
import { InterestCandidatePipe } from '../pipes/interest-candidate.pipe';
import { SmallAdComponent } from './small-ad/small-ad.component';
import { WorkTemporaryComponent } from './work-temporary/work-temporary.component';
import { FormationNewComponent } from './formations/formation-new/formation-new.component';
import { WorkEditComponent } from './work-temporary/work-edit/work-edit.component';
import { SmallAdEditComponent } from './small-ad/small-ad-edit/small-ad-edit.component';
import { AdsComponent } from './ads/ads.component';
import {WalletComponent} from "../directives/wallet/wallet.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    SweetAlert2Module,
    EditorModule
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
    UploadfileDirective,
    TaxonomyComponent,
    EditTaxonomyComponent,
    NewTaxonomyComponent,
    FeaturedOfferComponent,
    RatePlanComponent,
    SettingsComponent,
    DeadlineOfferComponent,
    BlogsComponent,
    NewslettersComponent,
    NewNewsletterComponent,
    EditBlogComponent,
    NewBlogComponent,
    ViewNewsletterComponent,
    PublicityComponent,
    CompanyOffersComponent,
    MomendatePipe,
    ImageSizePipe,
    InterestCandidatePipe,
    CoverLetterComponent,
    DatepickerDirective,
    CompareValidatorDirective,
    RequestFormationsComponent,
    FormationsComponent,
    FormationEditComponent,
    RequestFormationEditComponent,
    SmallAdComponent,
    WorkTemporaryComponent,
    FormationNewComponent,
    WorkEditComponent,
    SmallAdEditComponent,
    AdsComponent,
    WalletComponent
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
    UploadfileDirective,
    DatepickerDirective
  ]
})
export class DashboardModule { }
