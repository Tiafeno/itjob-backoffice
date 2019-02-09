import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { config } from '../../../../environments/environment';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { CompanyOffersComponent } from '../company-offers/company-offers.component';
import { AuthService } from '../../../services/auth.service';
declare var $: any;
@Component({
  selector: 'app-company-edit',
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CompanyEditComponent implements OnInit {
  public companyId: number = 0;
  public editor: any = {};
  public warning: boolean = false;
  public loading: boolean = false;
  public Regions: any = [];
  public AreaActivity: any = [];
  public loadingArea: boolean = false;
  public loadingTown: boolean = false;
  public Towns: any = [];

  @Output() refresh = new EventEmitter();
  @ViewChild(CompanyOffersComponent) private ourOffers: CompanyOffersComponent;

  constructor(
    public authService: AuthService,
    private Http: HttpClient
  ) { }

  ngOnInit() {
    $('#edit-company-modal')
      .on('show.bs.modal', function (event) {
        var modal = $(this)
        modal.find('.modal-title').text('MODIFICATION')
        modal.find('.modal-body input').val('');
        // ACCESS FIELDS
        $("input.no-access").each(function () {
          $(this).attr('disabled', true);
        })
      })
      .on('hide.bs.modal', (event) => {
        this.editor = {};
        this.loading = false;
      })
  }

  onSubmitForm(editForm: NgForm) {
    if (!this.authService.notUserAccess("contributor")) return;
    if (!this.authService.notUserAccess("editor")) return;

    if (editForm.valid) {
      this.loading = true;
      let Form = _.clone(editForm.value);
      Form.cellphones = Object.values(Form.cellphones);
      this.saveCompany(Form).subscribe(response => {
        this.loading = false;
        if (response.success) {
          this.refresh.emit();
          $('#edit-company-modal').modal('hide');
        }
      });

    }
  }

  public viewCompanyOffers(Fm: NgForm) {
    this.loading = true;
    if (Fm.dirty) {
      swal({
        title: 'Quitter la page?',
        text: `Vous n’avez pas encore fini votre modification. Voulez-vous quitter sans le terminer ?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: "Quitter",
        cancelButtonText: "Annuler"
      }).then((result) => {
        if (result.value) {
          $('#edit-company-modal').modal('hide');
          // Ouvrir la boite de dialog
          setTimeout(() => {
            this.ourOffers.viewOffers(this.companyId);
          }, 600);
          
          // For more information about handling dismissals please visit
          // https://sweetalert2.github.io/#handling-dismissals
        } else if (result.dismiss === swal.DismissReason.cancel) {
          this.loading = false;
        }
      })
    } else {
      // Ouvrir la boite de dialog
      $('#edit-company-modal').modal('hide');
      // Ouvrir la boite de dialog
      setTimeout(() => {
        this.ourOffers.viewOffers(this.companyId);
      }, 600);
    }
  }

  onAddedCellphone() {
    let index = this.editor.cellphones.length;
    this.editor.cellphones.push({ value: '', id: index });
  }

  onRemoveCellphone(cellId: number) {
    this.editor.cellphones = _.reject(this.editor.cellphones, { id: cellId });
  }

  onOpen(Company: any) {
    if (!_.isEmpty(Company)) {
      this.companyId = Company.ID;
      let editor = _.cloneDeep(Company);
      editor.status = editor.isActive && editor.post_status === 'publish' ? 1 : (editor.post_status === 'pending' ? 'pending' : 0);
      editor.branch_activity = _.isObject(editor.branch_activity) ? editor.branch_activity.term_id : '';
      editor.region = _.isObject(editor.region) ? editor.region.term_id : '';
      editor.country = _.isObject(editor.country) ? editor.country.term_id : '';
      editor.cellphones = _.map(editor.cellphones, (cell, index) => {
        return { id: index, value: cell };
      });
      this.editor = _.cloneDeep(editor);
      this.getTaxonomie('region').subscribe(response => { this.Regions = _.cloneDeep(response); });
      this.loadingArea = true;
      this.getTaxonomie('branch_activity').subscribe(response => { this.AreaActivity = _.cloneDeep(response); this.loadingArea = false; });
      this.loadingTown = true;
      this.getTaxonomie('city').subscribe(response => { this.Towns = _.cloneDeep(response); this.loadingTown = false; });

      $('#edit-company-modal').modal('show');
    }
  }

  customSearchFn(term: string, item: any) {
    var inTerm = [];
    term = term.toLocaleLowerCase();
    var paramTerms = $.trim(term).split(' ');
    $.each(paramTerms, (index, value) => {
      if (item.name.toLocaleLowerCase().indexOf($.trim(value).toLowerCase()) > -1) {
        inTerm.push(true);
      } else {
        inTerm.push(false);
      }
    });
    return _.every(inTerm, (boolean) => boolean === true);
  }

  public getTaxonomie(taxonomy: string): Observable<any> {
    return this.Http.get(`${config.itApi}/taxonomies/${taxonomy}`, { responseType: 'json' });
  }

  public saveCompany(Form: any): Observable<any> {
    let formData = new FormData();
    formData.append('company', JSON.stringify(Form));
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${currentUser.token}`
      })
    };
    return this.Http.post<any>(`${config.itApi}/company/${this.companyId}`, formData, httpOptions);
  }

}
