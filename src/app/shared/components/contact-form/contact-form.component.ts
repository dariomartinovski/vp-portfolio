import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EmailService } from '../../../core/services/email.service';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-contact-form',
  standalone: false,
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  state: FormState = 'idle';
  private sub?: Subscription;

  projectTypes = ['Illustration', 'Brand Identity', 'UI Design', 'Print Design', 'Other'];

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      projectType: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
      honeypot: [''], // hidden spam trap
    });
  }

  get f() {
    return this.form.controls;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Honeypot check — if filled, silently reject (bot)
    if (this.form.get('honeypot')?.value) {
      this.state = 'success';
      return;
    }

    this.state = 'submitting';
    const { name, email, projectType, message } = this.form.value;

    this.sub = this.emailService.sendMessage({ name, email, projectType, message }).subscribe({
      // The EmailJS promise resolves outside Angular's event wrapping, so in this
      // zoneless + OnPush app the state change would never reach the template and
      // the spinner would spin forever.
      next: () => {
        this.state = 'success';
        this.form.reset();
        this.cdr.markForCheck();
      },
      error: () => {
        this.state = 'error';
        this.cdr.markForCheck();
      },
    });
  }

  retry(): void {
    this.state = 'idle';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
