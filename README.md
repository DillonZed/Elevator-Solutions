# elevatorsolutions.ca

Static site for ESI Elevator Solutions Inc. Zero-dependency Node build (`src/` -> `dist/`), deployed on Vercel (team `convert-lab`) from `main`.

## Work on it

```bash
node build.mjs                       # build to dist/
cd dist && python3 -m http.server 4173   # preview at http://localhost:4173
```

- Business facts (phone, address, GHL form ID, GTM ID): `src/data/site.mjs`
- Service pages are generated from `src/data/services.mjs` at `/<slug>/`
- Hand-written pages: `src/pages/*.html` with JSON front matter (`title`, `description`, `nav`, `h1`, `crumb`, `faq`, `noindex`, `nocta`, `cta_h2`, `cta_p`)
- Tokens available in pages: `{{form}}`, `{{faq}}`, `{{cta}}`, `{{services_grid}}`, `{{regions}}`, `{{phone}}`, `{{phone_href}}`, `{{email}}`
- Images: `src/assets/img/` (WebP, made with `cwebp`). Originals from the WordPress site are archived on Drive under the client's `media/elevatorsolutions-site/` folder.

Every page is emitted as `<slug>/index.html` with `trailingSlash: true`, so the old WordPress URLs keep working unchanged.

## Lead form

The contact form is a GoHighLevel form in the **ESI Elevator Solutions Inc.** sub-account (`3B7UGyzwnXXEWyf7Mu7l`). Put its form ID in `site.form.id`. While the ID is empty, the site shows call/email buttons in place of the form. Set the form's on-submit redirect to `https://elevatorsolutions.ca/thank-you/`.

## Tracking

GTM `GTM-MJB56MD` (carried over from WordPress) loads only on `elevatorsolutions.ca`. Every other host (Vercel previews, localhost) gets `X-Robots-Tag: noindex` from `vercel.json`.

## Launch checklist

1. GHL form built, ID set in `src/data/site.mjs`, test lead received and Glenn notified.
2. Glenn has approved the copy.
3. Vercel project has `elevatorsolutions.ca` and `www.elevatorsolutions.ca` attached.
4. At GoDaddy, change only the apex A record and the `www` CNAME to the values Vercel shows. Do not touch the MX (Google Workspace) or TXT records.
5. After DNS: HTTPS works on both hosts, `www` redirects to the apex, `dig MX elevatorsolutions.ca` is unchanged, a test email reaches Glenn.
6. Submit `https://elevatorsolutions.ca/sitemap.xml` in Google Search Console.
7. Keep the WordPress hosting for 30 days as a rollback, then cancel it.
