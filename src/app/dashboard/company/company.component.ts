import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit {
  public listsCompany:Array<any> = [];
  constructor(private requestService: RequestService) { }

  ngOnInit() {
    this.requestService.getCompanyLists()
      .subscribe(companys => this.listsCompany = companys);
  }

}
