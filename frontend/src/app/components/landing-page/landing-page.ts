import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContactComponent } from '../contact/contact';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, ContactComponent],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPageComponent {}
