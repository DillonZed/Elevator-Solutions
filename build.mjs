// Zero-dependency static build: src/ -> dist/
// Pages are emitted as <slug>/index.html so every URL ends in a slash, matching the old WordPress URLs.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { site } from './src/data/site.mjs';
import { services } from './src/data/services.mjs';

const SRC = 'src', DIST = 'dist';
const read = (p) => readFileSync(p, 'utf8');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const year = new Date().getFullYear();

// Cache-bust CSS/JS: the URL changes whenever the file content changes, so browsers never mix new HTML with old styles.
const ver = (p) => createHash('sha1').update(readFileSync(p)).digest('hex').slice(0, 10);
const layout = read(join(SRC, 'layout.html'))
  .replace('/assets/site.css', `/assets/site.css?v=${ver(join(SRC, 'assets/site.css'))}`)
  .replace('/assets/site.js', `/assets/site.js?v=${ver(join(SRC, 'assets/site.js'))}`);
const header = read(join(SRC, 'partials/header.html'));
const footer = read(join(SRC, 'partials/footer.html'));
const cta = read(join(SRC, 'partials/cta.html'));

const CTA_H2 = 'Talk to an independent elevator consultant.';
const CTA_P = 'Tell us about your building and what is going on with the elevators. Our team will review it and get back to you to talk it through.';

// ---------- shared fragments ----------
const svc = Object.fromEntries(services.map((s) => [s.slug, s]));
const arrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const fragments = {
  nav_services: services.map((s) => `<a href="/${s.slug}/"><span class="dd-num">${s.num}</span>${esc(s.name)}<small>${esc(s.short)}</small></a>`).join('\n          '),
  nav_services_mobile: services.map((s) => `<a class="sub" href="/${s.slug}/">${esc(s.name)}</a>`).join('\n    '),
  footer_services: services.map((s) => `<li><a href="/${s.slug}/">${esc(s.name)}</a></li>`).join('\n        '),
  services_grid: `<div class="svc-grid">${services.map((s) => `
    <a class="svc-card" href="/${s.slug}/">
      <span class="svc-num">${s.num}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.short)}</p>
      <span class="go">Learn more ${arrow}</span>
    </a>`).join('')}
    <a class="svc-card ask" href="/contact/">
      <span class="svc-num">Not sure?</span>
      <h3>Not sure which service you need?</h3>
      <p>Describe what is going on with the elevators and our team will recommend where to start.</p>
      <span class="go">Call ${site.phone} ${arrow}</span>
    </a>
  </div>`,
  regions: `<ul class="regions">${site.regions.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`,
  phone: site.phone, phone_href: site.phoneHref, email: site.email,
  street: site.address.street, city: site.address.city, region: site.address.region, postal: site.address.postal,
  rescue_url: site.rescueUrl, kron_url: site.kronUrl, site_url: site.url, year: String(year),
};

// GoHighLevel inline form, or a call/email fallback until the form exists.
function formBlock() {
  const f = site.form;
  if (!f.id) {
    return `<div class="form-fallback">
  <p class="label">Request an assessment</p>
  <h3>Call or email us, and our team will get back to you to talk it through.</h3>
  <div class="ff-actions"><a class="btn" href="${site.phoneHref}">Call ${site.phone}</a><a class="btn ghost" href="mailto:${site.email}?subject=Elevator%20consulting%20inquiry">Email ${site.email}</a></div>
  <p class="soft">Helpful to include: the building address, number of elevators, and what is prompting the call. If you have a depreciation report, attach it.</p>
</div>`;
  }
  return `<div class="ghl-form" style="--form-min:${f.minHeight}px">
  <iframe src="https://api.leadconnectorhq.com/widget/form/${f.id}" style="width:100%;height:100%;border:none;border-radius:4px" id="inline-${f.id}" data-layout="{'id':'INLINE'}" data-trigger-type="alwaysShow" data-trigger-value="" data-activation-type="alwaysActivated" data-activation-value="" data-deactivation-type="neverDeactivate" data-deactivation-value="" data-form-name="${esc(f.name)}" data-height="${f.minHeight}" data-layout-iframe-id="inline-${f.id}" data-form-id="${f.id}" title="${esc(f.name)}"></iframe>
  <script src="https://link.msgsndr.com/js/form_embed.js" defer></script>
</div>`;
}

function faqBlock(faq) {
  if (!faq || !faq.length) return '';
  return `<div class="faq">${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`;
}

// ---------- structured data ----------
const orgId = `${site.url}/#organization`;
const organization = {
  '@type': 'ProfessionalService',
  '@id': orgId,
  name: site.name,
  url: site.url + '/',
  logo: `${site.url}/assets/img/esi-logo.png`,
  image: `${site.url}/assets/img/og.jpg`,
  telephone: site.phoneIntl,
  email: site.email,
  description: 'Independent elevator consulting: condition assessments, modernization consulting, maintenance audits, due diligence, design and acceptance reviews.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postal,
    addressCountry: site.address.country,
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'British Columbia' },
    { '@type': 'AdministrativeArea', name: 'Alberta' },
    { '@type': 'AdministrativeArea', name: 'Saskatchewan' },
  ],
  founder: { '@type': 'Person', name: 'Glenn Zolnierczyk', jobTitle: 'Principal and Senior Consultant' },
  subOrganization: { '@type': 'Organization', name: 'ESI Elevator Rescue Training', url: site.rescueUrl },
};

function jsonld(meta) {
  const graph = [organization];
  if (meta.path !== '/') {
    const items = [{ name: 'Home', url: site.url + '/' }];
    if (meta.parent) items.push(meta.parent);
    items.push({ name: meta.crumb || meta.h1 || meta.title, url: site.url + meta.path });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
    });
  }
  if (meta.service) {
    graph.push({
      '@type': 'Service',
      name: meta.service.name,
      serviceType: meta.service.name,
      description: meta.description,
      provider: { '@id': orgId },
      areaServed: organization.areaServed,
      url: site.url + meta.path,
    });
  }
  if (meta.faq && meta.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: meta.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

// GA4 + GTM only fire on the production host, so previews and local builds never send data.
const gaHead = site.ga4 ? `<script>if(location.hostname==='${site.productionHost}'){var g=document.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id=${site.ga4}';document.head.appendChild(g);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config','${site.ga4}');}</script>` : '';
const gtmHead = site.gtm ? `<script>if(location.hostname==='${site.productionHost}'){(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.gtm}');}</script>` : '';

// ---------- render ----------
function fill(html, extra = {}) {
  const all = { ...fragments, ...extra };
  return html.replace(/{{(\w+)}}/g, (m, k) => (k in all ? all[k] : m));
}

function renderPage(meta, body) {
  const h = header.replace(/<li( class="dd")? data-nav="(\w+)"/g, (m, dd, k) =>
    k === meta.nav ? `<li class="${dd ? 'dd ' : ''}active" data-nav="${k}"` : m);
  const ctaHtml = fill(cta, { cta_h2: esc(meta.cta_h2 || CTA_H2), cta_p: esc(meta.cta_p || CTA_P) });
  let content = body
    .replace('{{form}}', formBlock())
    .replace('{{faq}}', faqBlock(meta.faq));
  content = content.includes('{{cta}}') ? content.replace('{{cta}}', meta.nocta ? '' : ctaHtml) : (meta.nocta ? content : content + '\n' + ctaHtml);
  return fill(layout, {
    title: esc(meta.title),
    description: esc(meta.description),
    canonical: site.url + meta.path,
    robots: meta.noindex ? '<meta name="robots" content="noindex, follow">' : '',
    jsonld: meta.noindex ? '' : jsonld(meta),
    gtm_head: gaHead + gtmHead,
    gtm_body: '',
    bodyclass: meta.bodyclass || '',
    header: fill(h),
    footer: fill(footer),
    content: fill(content),
  });
}

const built = [];
function emit(path, html, meta) {
  const out = join(DIST, path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  built.push({ path, meta });
}
const outPath = (urlPath) => (urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '') + 'index.html');

// ---------- assets ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'assets'), { recursive: true });
cpSync(join(SRC, 'assets/img'), join(DIST, 'assets/img'), { recursive: true });
cpSync(join(SRC, 'assets/site.css'), join(DIST, 'assets/site.css'));
cpSync(join(SRC, 'assets/site.js'), join(DIST, 'assets/site.js'));

// ---------- hand-written pages ----------
for (const file of readdirSync(join(SRC, 'pages')).filter((f) => f.endsWith('.html'))) {
  const raw = read(join(SRC, 'pages', file));
  const m = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) throw new Error(`Missing front matter in ${file}`);
  const meta = JSON.parse(m[1]);
  const slug = file.replace(/\.html$/, '');
  meta.path = slug === 'index' ? '/' : slug === '404' ? '/404' : `/${slug}/`;
  const body = raw.slice(m[0].length).trim();
  emit(slug === '404' ? '404.html' : outPath(meta.path), renderPage(meta, body), meta);
}

// ---------- service pages ----------
services.forEach((s) => {
  const meta = {
    title: s.metaTitle, description: s.metaDescription, nav: 'services', path: `/${s.slug}/`,
    h1: s.h1, crumb: s.name, parent: { name: 'Services', url: `${site.url}/services/` },
    service: s, faq: s.faq,
  };
  const img = s.image ? `<figure class="phero-img${s.image.wide ? ' wide' : ''}"><img src="/assets/img/${s.image.src}" alt="${esc(s.image.alt)}" width="${s.image.w}" height="${s.image.h}"></figure>` : '';
  const asks = s.asks ? `
<section class="sec asks-sec"><div class="shell">
  <p class="label">${esc(s.asksLabel || 'What clients usually ask')}</p>
  <ul class="asks">${s.asks.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
</div></section>` : '';
  const list = s.includes || s.process;
  const listHtml = list ? `
<section class="sec"><div class="shell two">
  <div>
    <p class="label">${s.process ? 'How it works' : 'What’s included'}</p>
    <h2 class="h2">${s.process ? 'From first visit to sign-off' : 'What you get'}</h2>
    ${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
  </div>
  <ol class="spec${s.process ? ' steps' : ''}">${list.map((x, i) => `<li><span class="spec-n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div></li>`).join('')}</ol>
</div></section>` : '';
  const gallery = s.gallery ? `
<section class="sec tight"><div class="shell"><div class="gallery">${s.gallery.map((g) => `<figure><img src="/assets/img/${g.src}" alt="${esc(g.alt)}" width="${g.w}" height="${g.h}" loading="lazy"><figcaption>${esc(g.alt)}</figcaption></figure>`).join('')}</div>
<p class="soft small">Engineering work by <a href="${site.kronUrl}" rel="noopener">Kron Engineering</a>.</p></div></section>` : '';
  const who = `
<section class="sec tight"><div class="shell who">
  <p class="label">Who we work with</p>
  <ul class="chips">${s.who.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
</div></section>`;
  const faq = s.faq && s.faq.length ? `
<section class="sec"><div class="shell two">
  <div><p class="label">Questions</p><h2 class="h2">Common questions</h2></div>
  {{faq}}
</div></section>` : '';
  const related = s.related.map((r) => {
    if (r === 'depreciation-report-planning') return `<a class="rel" href="/depreciation-report-planning/"><span>Depreciation Report Planning</span>${arrow}</a>`;
    if (r === 'elevator-consultant') return `<a class="rel" href="/elevator-consultant/"><span>What an Elevator Consultant Does</span>${arrow}</a>`;
    return `<a class="rel" href="/${r}/"><span>${esc(svc[r].name)}</span>${arrow}</a>`;
  }).join('');
  const body = `
<section class="phero"><div class="shell phero-grid">
  <div>
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/services/">Services</a><span>/</span><span aria-current="page">${esc(s.name)}</span></nav>
    <p class="label">${s.num} · ${esc(s.eyebrow)}</p>
    <h1>${esc(s.h1)}</h1>
    ${s.lead.map((p) => `<p class="lead">${esc(p)}</p>`).join('')}
    <div class="cta-row"><a class="btn" href="/contact/">Request an Assessment</a><a class="btn ghost" href="${site.phoneHref}">Call ${site.phone}</a></div>
  </div>
  ${img}
</div></section>
${asks}
${listHtml}
${gallery}
${who}
${faq}
<section class="sec tight"><div class="shell">
  <p class="label">Related</p>
  <div class="rels">${related}</div>
</div></section>
{{cta}}`;
  emit(outPath(meta.path), renderPage(meta, body), meta);
});

// ---------- sitemap + robots ----------
const urls = built.filter((b) => !b.meta.noindex && b.path !== '404.html').map((b) => site.url + b.meta.path)
  .sort((a, b) => (a === site.url + '/' ? -1 : b === site.url + '/' ? 1 : 0));
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nDisallow:\n\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`Built ${built.length} pages (${urls.length} in sitemap) -> ${DIST}/`);
