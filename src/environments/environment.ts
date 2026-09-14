/**
 * Development configuration. Committed to the repository.
 *
 * Put your EmailJS *development* keys here if you want the contact form working
 * locally. These values are baked into the dev bundle at build time.
 */
export const environment = {
  production: false,
  emailjs: {
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY',
  },
};
