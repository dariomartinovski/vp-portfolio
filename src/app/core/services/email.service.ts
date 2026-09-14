import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';

export interface ContactForm {
  name: string;
  email: string;
  message: string;
  projectType?: string;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  sendMessage(form: ContactForm): Observable<void> {
    const { serviceId, templateId, publicKey } = environment.emailjs;

    const params = {
      from_name: form.name,
      from_email: form.email,
      message: form.message,
      project_type: form.projectType || 'Not specified',
    };

    return from(emailjs.send(serviceId, templateId, params, publicKey).then(() => void 0));
  }
}
