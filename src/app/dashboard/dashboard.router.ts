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
import { CompanyEditComponent } from './company/company-edit/company-edit.component';
import { UserListsComponent } from './users/user-lists/user-lists.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';

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
      {
        path: "offer-lists",
        component: OfferListsComponent
      },
      {
        path: "offer/:id",
        children: [
          { path: "", redirectTo: 'edit', pathMatch: 'full' },
          { path: 'edit', component: OfferEditComponent }
        ]
      },
      {
        path: "company-lists",
        component: CompanyListsComponent
      },
      {
        path: "user-lists",
        component: UserListsComponent
      }
    ]
  },

]
