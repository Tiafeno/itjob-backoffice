import { Directive, Input, ElementRef, OnInit, Output, EventEmitter } from '@angular/core';
import { dateTimePickerFr } from '../../environments/environment';
import * as moment from 'moment';
import { NgModel } from '@angular/forms';
declare var $: any;
@Directive({
  selector: '[ngModel][appDatepicker]',
  providers: [NgModel]
})
export class DatepickerDirective implements OnInit {

  @Input() public value: any = '';
  @Input() public minView: any = 2;
  @Input() public maxView: any = 4;
  @Input() public position: string = "bottom-left";
  @Input() public todayBtn: boolean = false;
  @Input() public startView: string = 'month';
  @Input() public format: string = "dd/mm/yyyy";

  @Output('ngModelChange') update = new EventEmitter();
  constructor(
    public el: ElementRef
  ) {

  }

  ngOnInit(): void {
    $.fn.datetimepicker.dates['fr'] = dateTimePickerFr;
    $(this.el.nativeElement).datetimepicker({
      language: 'fr',
      format: this.format,
      startView: this.startView,
      minView: this.minView,
      maxView: this.maxView,
      todayBtn: this.todayBtn,
      pickerPosition: this.position,
      keyboardNavigation: false,
      forceParse: true,
      calendarWeeks: true,
      autoclose: true
    })
      .on('changeDate', (ev) => {
        let format:any = this.format === 'dd/mm/yyyy' ? 'DD/MM/YYYY' : 'YYYY-MM-DD HH:mm:ss';
        this.value = moment(ev.date).format(format);
        this.update.emit(this.value);
      })
  }


}
