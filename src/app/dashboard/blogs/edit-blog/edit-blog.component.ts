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
    language: 'fr_FR',
    menubar: false,
    content_css: [
       '//fonts.googleapis.com/css?family=Montserrat:300,300i,400,400i',
       '//www.tinymce.com/css/codepen.min.css'
    ],
    skin_url: '/assets/tinymce/skins/lightgray',
    inline: false,
    statusbar: true,
    resize: true,
    browser_spellcheck: true,
    min_height: 230,
    selector: 'textarea',
    toolbar: 'undo redo | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat ',
    plugins: ['lists'],
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
