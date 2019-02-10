import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../../environments/environment';


@Injectable()
export class BlogService {

  constructor(
    private Http: HttpClient
  ) { }
}
