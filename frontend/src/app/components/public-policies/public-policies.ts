import { Component } from '@angular/core';
import { PublicNavbarComponent } from '../public-shared/public-navbar.component';
import { PublicFooterComponent } from '../public-shared/public-footer.component';

@Component({
  selector: 'app-public-policies',
  standalone: true,
  imports: [PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './public-policies.html',
  styleUrls: ['../public-shared/public-pages.css', './public-policies.css']
})
export class PublicPoliciesComponent {}
