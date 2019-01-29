import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[compare]',
  providers: [{ provide: NG_VALIDATORS, useExisting: CompareValidatorDirective, multi: true }]
})
export class CompareValidatorDirective implements Validator {
  @Input('compare') controlNameToCompare: string;
   validate(c: AbstractControl): ValidationErrors | null {
     const controlToCompare = c.root.get( this.controlNameToCompare );
     if (controlToCompare) {
       const subscription: Subscription = controlToCompare.valueChanges.subscribe(() => {
         c.updateValueAndValidity();
         subscription.unsubscribe();
       })
     }

     return controlToCompare && controlToCompare.value !== c.value ? { 'compare': true } : null;
   }
  
}
