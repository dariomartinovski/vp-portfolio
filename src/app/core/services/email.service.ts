import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import emailjs from '@emailjs/browser';

export interface ContactForm {
  name: string;
  email: string;
  message: string;
  projectType?: string;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  // Replace these with real values from emailjs.com dashboard
  // Store in src/environments/environment.ts in production
  private SERVICE_ID = 'YOUR_SERVICE_ID';
  private TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  private PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

  sendMessage(form: ContactForm): Observable<void> {
    const params = {
      from_name: form.name,
      from_email: form.email,
      message: form.message,
      project_type: form.projectType || 'Not specified',
    };

    return from(
      emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, params, this.PUBLIC_KEY).then(() => void 0),
    );
  }
}
