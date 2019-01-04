import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { NgForm } from '@angular/forms';
declare var $:any;

@Component({
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.css']
})
export class EditBlogComponent implements OnInit {

  @Input() editor: any;

  public Form: any = {};
  public tinyMCESettings: any = {
    skin_url: '/assets/tinymce/skins/lightgray',
    inline: false,
    statusbar: false,
    browser_spellcheck: true,
    height: 320,
    plugins: '',
  };

  constructor() { }

  ngOnInit() {
  }

  onSubmitForm(form: NgForm): void {
    let values: any = form.value;
    
  }

  open():void {
    
  }

}
