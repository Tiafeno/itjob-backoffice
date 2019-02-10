import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'imageSize'
})
export class ImageSizePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value || !args) return value;
    return _.find(value, ['position', args]).sizes;
  }

}
