import { Route } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { LayoutComponent } from "../layouts/layout.component";
import { AuthGuard } from "../guards/auth.guard";
import { CandidatListComponent } from "./candidat/candidat-list/candidat-list.component";
import { CandidateOverviewComponent } from "./candidat/candidate-overview/candidate-overview.component";
import { CandidateEditComponent } from "./candidat/candidate-edit/candidate-edit.component";
import { OfferListsComponent } from "./offers/offer-lists/offer-lists.component";
import { OfferEditComponent } from "./offers/offer-edit/offer-edit.component";
import { CompanyListsComponent } from './company/company-lists/company-lists.component';
import { TaxonomyComponent } from './taxonomy/taxonomy.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminGuard } from '../guards/admin.guard';
import { BlogsComponent } from './blogs/blogs.component';
import { NewslettersComponent } from './newsletters/newsletters.component';
import { PublicityComponent } from './publicity/publicity.component';
import { FormationsComponent } from './formations/formations.component';
import { FormationEditComponent } from './formations/formation-edit/formation-edit.component';
import { RequestFormationsComponent } from './request-formations/request-formations.component';
import { RequestFormationEditComponent } from './request-formations/request-formation-edit/request-formation-edit.component';

export const DashboardRouter: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "home", component: HomeComponent },
      {
        path: "candidat-lists",
        component: CandidatListComponent
      },
      {
        path: "candidate/:id",
        children: [
          { path: '', redirectTo: 'edit', pathMatch: 'full' },
          { path: 'overview', component: CandidateOverviewComponent },
          { path: 'edit', component: CandidateEditComponent },
        ]
      },
      { path: "offer-lists", component: OfferListsComponent },
      {
        path: "offer/:id",
        children: [
          { path: "", redirectTo: 'edit', pathMatch: 'full' },
          { path: 'edit', component: OfferEditComponent }
        ]
      },
      { path: 'formations', component: FormationsComponent },
      {
        path: "formation/:id",
        children: [
          { path: "", redirectTo: 'edit', pathMatch: 'full' },
          { path: 'edit', component: FormationEditComponent }
        ]
      },
      { path: 'request-formations', component: RequestFormationsComponent },
      {
        path: "request-formation/:id",
        children: [
          { path: "", redirectTo: 'edit', pathMatch: 'full' },
          { path: 'edit', component: RequestFormationEditComponent }
        ]
      },
      { path: "company-lists", component: CompanyListsComponent },
      { path: "settings", component: SettingsComponent, canActivate: [AdminGuard] },
      { path: 'taxonomy/:term', component: TaxonomyComponent },
      { path: 'blogs', component: BlogsComponent },
      { path: 'newsletters', component: NewslettersComponent }, 
      { path: 'ads', component: PublicityComponent }      
    ]
  },
]
