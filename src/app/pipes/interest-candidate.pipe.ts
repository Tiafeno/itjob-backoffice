import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'interestCandidate'
})
export class InterestCandidatePipe implements PipeTransform {

  transform(value: any, type?: any): Array<any> {
    return value.filter(item => item.type === type);
  }

}
