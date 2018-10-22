import { Routes } from "@angular/router";
import { IndexRouter } from './index/index.router';
import { DashboardRouter } from "./dashboard/dashboard.router";
export const routes: Routes = [...IndexRouter, ...DashboardRouter];
