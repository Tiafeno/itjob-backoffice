import { DashboardComponent } from "./dashboard.component";
import { Route } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { LayoutComponent } from "../layouts/layout.component";
import { AuthGuard } from "../guards/auth.guard";
import { CompanyComponent } from "./company/company.component";
import { CandidatComponent } from "./candidat/candidat.component";

export const DashboardRouter: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "home", component: HomeComponent },
      { path: "company", component: CompanyComponent },
      { path: "candidat", component: CandidatComponent }
    ]
  }
]
