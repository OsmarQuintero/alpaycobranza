import { Component } from '@angular/core';
import { PublicNavbarComponent } from '../public-shared/public-navbar.component';
import { PublicFooterComponent } from '../public-shared/public-footer.component';

@Component({
  selector: 'app-public-features',
  standalone: true,
  imports: [PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './public-features.html',
  styleUrls: ['../public-shared/public-pages.css', './public-features.css']
})
export class PublicFeaturesComponent {}
