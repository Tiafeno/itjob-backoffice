import { Injectable } from '@angular/core';
import swal from 'sweetalert2';

@Injectable()
export class ErrorService {

  constructor() { }

  handler(error: any) {
    console.log(error);
    swal(error.error.code, error.error.message, 'error');
  }
}
