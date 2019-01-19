import { Injectable } from '@angular/core';
import swal from 'sweetalert2';

@Injectable()
export class ErrorService {

  constructor() { }

  handler(error: any) {
    if (error.name === "HttpErrorResponse") {
      error.message = "Erreur interne";
    }
    swal(error.statusText, error.message, 'error');
  }
}
