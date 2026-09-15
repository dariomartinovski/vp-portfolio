import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ContactFormComponent } from './contact-form.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { EmailService } from '../../../core/services/email.service';

describe('ContactFormComponent', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let component: ContactFormComponent;
  let root: HTMLElement;
  let sendMessage: ReturnType<typeof vi.fn>;
  let sent$: Subject<void>;

  const fill = (values: Record<string, string>): void => {
    component.form.patchValue(values);
  };

  const validValues = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'I would like to commission an illustration.',
    projectType: 'Illustration',
  };

  beforeEach(async () => {
    sent$ = new Subject<void>();
    sendMessage = vi.fn(() => sent$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslatePipe],
      declarations: [ContactFormComponent],
      providers: [{ provide: EmailService, useValue: { sendMessage } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  const submitButton = (): HTMLButtonElement => root.querySelector('.cform__submit')!;

  describe('form construction', () => {
    it('builds every expected control', () => {
      expect(Object.keys(component.form.controls)).toEqual([
        'name',
        'email',
        'projectType',
        'message',
        'honeypot',
      ]);
    });

    it('offers the five project types as options', () => {
      const options = Array.from(root.querySelectorAll('.cform__select option')).map((o) =>
        o.textContent?.trim(),
      );

      expect(options).toEqual([
        'Select a type...',
        'Illustration',
        'Brand Identity',
        'UI Design',
        'Print Design',
        'Other',
      ]);
    });

    it('starts in the idle state with an enabled submit button', () => {
      expect(component.state).toBe('idle');
      expect(submitButton().disabled).toBe(false);
    });
  });

  describe('validation', () => {
    it('rejects an empty submission without calling the email service', () => {
      component.onSubmit();

      expect(sendMessage).not.toHaveBeenCalled();
      expect(component.state).toBe('idle');
    });

    it('marks every control touched so hints become visible', () => {
      component.onSubmit();
      fixture.detectChanges();

      expect(component.form.controls['name']!.touched).toBe(true);
      expect(root.querySelector('.cform__hint')).toBeTruthy();
      expect(root.querySelector('.cform__input')!.classList.contains('invalid')).toBe(true);
    });

    it('requires at least 10 characters in the message', () => {
      fill({ ...validValues, message: 'too short' });

      expect(component.form.invalid).toBe(true);
    });

    it('rejects a malformed email address', () => {
      fill({ ...validValues, email: 'not-an-email' });

      expect(component.form.controls['email']!.invalid).toBe(true);
    });

    it('reports isInvalid only once a field has been touched', () => {
      expect(component.isInvalid('name')).toBe(false);

      component.form.controls['name']!.markAsTouched();

      expect(component.isInvalid('name')).toBe(true);
    });
  });

  describe('honeypot', () => {
    it('reports success without sending when the hidden field is filled', () => {
      fill({ ...validValues, honeypot: 'i am a bot' });

      component.onSubmit();

      expect(sendMessage).not.toHaveBeenCalled();
      expect(component.state).toBe('success');
    });
  });

  describe('submission lifecycle', () => {
    it('sends the form values and enters the submitting state', () => {
      fill(validValues);

      component.onSubmit();
      fixture.detectChanges();

      expect(sendMessage).toHaveBeenCalledWith({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        projectType: 'Illustration',
        message: 'I would like to commission an illustration.',
      });
      expect(component.state).toBe('submitting');
      expect(submitButton().disabled).toBe(true);
    });

    it('renders the success message and resets the form once sending resolves', () => {
      fill(validValues);
      component.onSubmit();
      fixture.detectChanges();

      sent$.next();
      sent$.complete();
      fixture.detectChanges();

      expect(component.state).toBe('success');
      expect(root.querySelector('.cform__success')).toBeTruthy();
      expect(root.querySelector('form')).toBeNull();
      expect(component.form.get('name')!.value).toBeNull();
    });

    it('renders the error message with a retry affordance when sending fails', () => {
      fill(validValues);
      component.onSubmit();
      fixture.detectChanges();

      sent$.error(new Error('network down'));
      fixture.detectChanges();

      expect(component.state).toBe('error');
      expect(root.querySelector('.cform__error-msg')).toBeTruthy();
      expect(root.querySelector('.cform__retry')).toBeTruthy();
    });

    it('returns to the form when retry is used', () => {
      fill(validValues);
      component.onSubmit();
      sent$.error(new Error('network down'));
      fixture.detectChanges();

      root.querySelector<HTMLButtonElement>('.cform__retry')!.click();
      fixture.detectChanges();

      expect(component.state).toBe('idle');
      expect(root.querySelector('form')).toBeTruthy();
    });
  });

  describe('teardown', () => {
    it('unsubscribes from an in-flight send on destroy', () => {
      fill(validValues);
      component.onSubmit();

      expect(sent$.observed).toBe(true);

      fixture.destroy();

      expect(sent$.observed).toBe(false);
    });
  });
});
