import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContactComponent } from '../contact/contact';
import { PublicNavbarComponent } from '../public-shared/public-navbar.component';
import { PublicFooterComponent } from '../public-shared/public-footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, ContactComponent, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPageComponent {}
