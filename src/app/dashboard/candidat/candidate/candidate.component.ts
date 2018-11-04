import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.css']
})
export class CandidateComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
