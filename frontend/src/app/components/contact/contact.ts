import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { resolveApiUrl } from '../../core/utils/api-url';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ContactComponent {
  private readonly endpoint = `${resolveApiUrl(environment.apiUrl)}/contacto`;

  status: 'idle' | 'sending' | 'ok' | 'error' = 'idle';
  readonly form;

  constructor(private readonly fb: FormBuilder, private readonly http: HttpClient) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      message: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      nombre: this.form.value.name,
      email: this.form.value.email,
      empresa: this.form.value.company,
      mensaje: this.form.value.message
    };

    this.status = 'sending';
    this.http.post(this.endpoint, payload).subscribe({
      next: () => {
        this.status = 'ok';
        this.form.reset();
      },
      error: () => {
        this.status = 'error';
      }
    });
  }
}

