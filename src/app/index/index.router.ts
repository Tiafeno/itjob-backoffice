import {Route} from '@angular/router';
import { IndexComponent } from './index.component';
import { ForgotComponent } from './forgot/forgot.component';
import { LoginComponent } from './login/login.component';
import { LoginGuard } from '../guards/login.guard';
export const IndexRouter: Route[] = [
  {
    path: '',
    component: IndexComponent,
    canActivate: [LoginGuard],
    children: [
      {path: '', component: LoginComponent},
      {path: 'login', component: LoginComponent},
      {path: 'forgot', component: ForgotComponent}
    ]
  }
]
