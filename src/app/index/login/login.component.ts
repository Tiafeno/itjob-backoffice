import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  public error: boolean = false;
  public submitted: boolean = false;
  public form: FormGroup;
  public loading: boolean = false;
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      pwd: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.authService.logout();
    $('body').addClass('empty-layout');
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.error = false;
    this.submitted = true;
    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.authService.login(this.form.value.email, this.form.value.pwd)
      .pipe(first())
      .subscribe(
        data => {
          if (data)
            this.router.navigate(['/home']);
        },
        error => {
          this.error = true;
          this.loading = false;
        });
  }

}
