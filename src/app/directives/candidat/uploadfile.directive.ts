import { Directive, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
declare var $: any;
@Directive({
  selector: '[appUploadfile]'
})
export class UploadfileDirective {

  @Output() private filesChangeEmiter: EventEmitter<FileList> = new EventEmitter();
  constructor(public el: ElementRef) { }
  @HostListener('click') onClick() {
    $(this.el.nativeElement).find('input').trigger('click');
  }
}
