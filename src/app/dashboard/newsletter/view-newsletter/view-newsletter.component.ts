import { Component, OnInit, Input } from '@angular/core';
declare var $:any;

@Component({
  selector: 'app-view-newsletter',
  templateUrl: './view-newsletter.component.html',
  styleUrls: ['./view-newsletter.component.css']
})
export class ViewNewsletterComponent implements OnInit {
  @Input() public post: any;
  constructor() { }

  ngOnInit() {
  }

  toggleDialog(): void  {
    $('#view-newsletter-modal').modal('toggle');
    console.log(this.post);
  }

}
