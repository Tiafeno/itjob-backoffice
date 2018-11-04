import { DashboardComponent } from "./dashboard.component";
import { Route } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { LayoutComponent } from "../layouts/layout.component";
import { AuthGuard } from "../guards/auth.guard";
import { CompanyComponent } from "./company/company.component";
import { CandidatListComponent } from "./candidat-list/candidat-list.component";
import { CandidateComponent } from "./candidat/candidate/candidate.component";
import { CandidateOverviewComponent } from "./candidat/candidate-overview/candidate-overview.component";
import { CandidateEditComponent } from "./candidat/candidate-edit/candidate-edit.component";

export const DashboardRouter: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "home", component: HomeComponent },
      { path: "company", component: CompanyComponent },
      {
        path: "candidat-list",
        component: CandidatListComponent
      },
      {
        path: "candidate/:id",
        component: CandidateComponent,
        children: [
          { path: '', redirectTo: 'edit', pathMatch: 'full' },
          { path: 'overview', component: CandidateOverviewComponent },
          { path: 'edit', component: CandidateEditComponent },
        ]
      },
    ]
  },

]
