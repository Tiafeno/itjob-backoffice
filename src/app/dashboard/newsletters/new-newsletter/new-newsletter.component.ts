import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
declare var $:any;

@Component({
  selector: 'app-new-newsletter',
  templateUrl: './new-newsletter.component.html',
  styleUrls: ['./new-newsletter.component.css']
})
export class NewNewsletterComponent implements OnInit {
  public loading: boolean = false;
  public Form: any = {};
  public message: string = '';
  public tinyMCESettings: any = {
    language: 'fr_FR',
    menubar: false,
    content_css: [
      '//fonts.googleapis.com/css?family=Montserrat:300,300i,400,400i',
      '//www.tinymce.com/css/codepen.min.css'
    ],
    content_style: ".mce-content-body p { margin: 5px 0; }",
    skin_url: '/assets/tinymce/skins/lightgray',
    inline: false,
    statusbar: true,
    resize: true,
    browser_spellcheck: true,
    min_height: 230,
    width: 750,
    lineheight_formats: "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 36pt",
    selector: 'textarea',
    toolbar: 'undo redo | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat ',
    plugins: ['lists'],
  };
  public sendFor: any = [
    { value: '', label: "Tous les clients" },
    { value: 'candidate', label: "Candidats" },
    { value: 'company', label: "Entreprises" },
  ]

  @Output() public onSend = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
    this.Form.send = '';
  }

  toggleDialog(): void {
    this.loading = false;
    $('#new-newsletter-modal').modal('toggle');
  } 

  onSubmitForm(Form: NgForm): void {
    this.message = ''
    if (Form.valid) {
      this.loading = true;
      this.onSend.emit(Form);
    } else {
      this.message = "Veillez remplire le formulaire correctement";
    }
  }

}
