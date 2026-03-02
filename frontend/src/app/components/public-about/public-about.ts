import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-about',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './public-about.html',
  styleUrls: ['../public-shared/public-pages.css', './public-about.css']
})
export class PublicAboutComponent {}

