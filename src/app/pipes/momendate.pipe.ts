import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({
  name: 'momendate'
})
export class MomendatePipe implements PipeTransform {
  private date: any;
  transform(value: any, args?: any): any {
    moment.locale('fr');
    this.date = value;
    let mmt = moment(this.date);
    let format: any = typeof args === 'undefined' ? "MMMM YYYY" : args;
    if (!mmt.isValid()) return "n/a";
    return moment(this.date).format(format);
  }

}
