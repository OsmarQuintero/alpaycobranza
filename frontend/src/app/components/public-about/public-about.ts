import { Component } from '@angular/core';
import { PublicNavbarComponent } from '../public-shared/public-navbar.component';
import { PublicFooterComponent } from '../public-shared/public-footer.component';

@Component({
  selector: 'app-public-about',
  standalone: true,
  imports: [PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './public-about.html',
  styleUrls: ['../public-shared/public-pages.css', './public-about.css']
})
export class PublicAboutComponent {}
