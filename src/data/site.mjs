// Business facts used across the site. Confirmed by Glenn, 2026-10-06.
export const site = {
  url: 'https://elevatorsolutions.ca',
  name: 'ESI Elevator Solutions Inc.',
  shortName: 'ESI Elevator Solutions',
  phone: '604-862-5432',
  phoneHref: 'tel:+16048625432',
  phoneIntl: '+1-604-862-5432',
  email: 'info@elevatorsolutions.ca',
  address: {
    street: '1055 West Georgia Street, Suite 2100',
    city: 'Vancouver',
    region: 'BC',
    postal: 'V6E 3P3',
    country: 'CA',
  },
  regions: ['Lower Mainland', 'Fraser Valley', 'Vancouver Island', 'Okanagan and Interior', 'Northern BC', 'Alberta'],
  rescueUrl: 'https://elevatorrescue.ca/',
  kronUrl: 'https://www.kronengineering.ca/',
  // Google Tag Manager container carried over from the WordPress site. Loads on the production host only.
  gtm: 'GTM-MJB56MD',
  productionHost: 'elevatorsolutions.ca',
  // GoHighLevel form in the ESI Elevator Solutions Inc. sub-account (3B7UGyzwnXXEWyf7Mu7l).
  // Leave id empty until the form exists; pages then show call/email options instead.
  form: {
    id: '',
    name: 'Elevator Solutions Inquiry',
    minHeight: 820,
  },
};
