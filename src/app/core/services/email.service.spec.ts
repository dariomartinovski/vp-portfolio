import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import emailjs from '@emailjs/browser';
import { EmailService } from './email.service';
import { environment } from '../../../environments/environment';

describe('EmailService', () => {
  let service: EmailService;
  let sendSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sendSpy = vi.spyOn(emailjs, 'send').mockResolvedValue({ status: 200, text: 'OK' } as never);
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailService);
  });

  afterEach(() => {
    sendSpy.mockRestore();
  });

  it('maps the contact form onto the EmailJS template params', async () => {
    await firstValueFrom(
      service.sendMessage({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Lets talk about a commission.',
        projectType: 'Illustration',
      }),
    );

    expect(sendSpy).toHaveBeenCalledWith(
      environment.emailjs.serviceId,
      environment.emailjs.templateId,
      {
        from_name: 'Ada Lovelace',
        from_email: 'ada@example.com',
        message: 'Lets talk about a commission.',
        project_type: 'Illustration',
      },
      environment.emailjs.publicKey,
    );
  });

  it('falls back to "Not specified" when projectType is omitted', async () => {
    await firstValueFrom(service.sendMessage({ name: 'A', email: 'a@example.com', message: 'Hi' }));

    expect(sendSpy.mock.calls[0]![2]).toMatchObject({ project_type: 'Not specified' });
  });

  it('completes without emitting a value', async () => {
    const result = await firstValueFrom(
      service.sendMessage({ name: 'A', email: 'a@example.com', message: 'Hi' }),
    );

    expect(result).toBeUndefined();
  });

  it('surfaces an EmailJS failure to the subscriber', async () => {
    sendSpy.mockRejectedValue(new Error('network down') as never);

    await expect(
      firstValueFrom(service.sendMessage({ name: 'A', email: 'a@example.com', message: 'Hi' })),
    ).rejects.toThrow('network down');
  });
});
