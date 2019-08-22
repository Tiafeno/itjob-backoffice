import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorService } from '../../services/error.service';

declare var $: any;

@Component({
   selector: 'app-login',
   templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
   public error: boolean = false;
   public submitted: boolean = false;
   public Form: FormGroup;
   public loading: boolean = false;
   constructor(
      private authService: AuthService,
      private errorService: ErrorService,
      private router: Router
   ) {
      this.Form = new FormGroup({
         email: new FormControl('', Validators.required),
         pwd: new FormControl('', Validators.required),
      });
   }

   ngOnInit() {
      this.authService.logout();
      $('body').addClass('empty-layout');
   }

   get f() { return this.Form.controls; }

   onSubmit() {
      this.error = false;
      this.submitted = true;
      // stop here if form is invalid
      if (this.Form.invalid) {
         return;
      }
      this.loading = true;
      this.authService.login(this.Form.value.email, this.Form.value.pwd)
         .pipe(first())
         .subscribe(
            data => {
               if (data) {
                  this.router.navigate(['/home']);
               } else {
                  this.errorHandler();
               }
            },
            error => {
               this.errorService.handler(error);
               this.loading = false;
            });
   }

   public errorHandler() {
      this.error = true;
      this.loading = false;
   }

}
