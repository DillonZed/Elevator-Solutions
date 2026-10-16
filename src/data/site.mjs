// Business facts used across the site. Confirmed by Glenn, 2026-10-06.
export const site = {
  url: 'https://elevatorsolutions.ca',
  name: 'ESI Elevator Solutions Inc.',
  shortName: 'ESI Elevator Solutions',
  phone: '778-402-5465',
  phoneHref: 'tel:+17784025465',
  phoneIntl: '+1-778-402-5465',
  email: 'info@elevatorsolutions.ca',
  address: {
    street: '1055 West Georgia Street, Suite 2100',
    city: 'Vancouver',
    region: 'BC',
    postal: 'V6E 3P3',
    country: 'CA',
  },
  regions: ['Lower Mainland', 'Fraser Valley', 'Vancouver Island', 'Okanagan and Interior', 'Northern BC', 'Alberta', 'Saskatchewan'],
  rescueUrl: 'https://elevatorrescue.ca/',
  kronUrl: 'https://www.kronengineering.ca/',
  // Legacy WordPress GTM container GTM-MJB56MD removed 2026-10-16 (it only held a dead Universal Analytics tag
  // feeding a leftover GA4 property, plus Hotjar 1189116). Set an ID here to load a GTM container again.
  gtm: '',
  // GA4 (gtag.js), added 2026-10-16. Also production host only.
  ga4: 'G-6BSG5TS8LB',
  productionHost: 'elevatorsolutions.ca',
  // GoHighLevel form in the ESI Elevator Solutions Inc. sub-account (3B7UGyzwnXXEWyf7Mu7l).
  // Leave id empty until the form exists; pages then show call/email options instead.
  form: {
    id: 'MhTMknybuXYqfgRpbZPF',
    name: 'Contact Form',
    minHeight: 880,
  },
};
