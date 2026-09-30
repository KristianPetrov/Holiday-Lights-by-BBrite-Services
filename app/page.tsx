import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";
import Snow from "@/components/Snow";
import StringLights from "@/components/StringLights";
import { getSiteImages, type SiteImage } from "@/lib/images";
import { formatUsd, site } from "@/lib/site";

const { pricing } = site;
const typicalRange = `${formatUsd(pricing.typical.min)}–${formatUsd(pricing.typical.max)}`;
const showRange = `${formatUsd(pricing.showstopper.min)}–${formatUsd(pricing.showstopper.max)}`;

const services = [
  {
    title: "Custom Design",
    body: "Tell us what you picture, whether it's classic warm white, bold multicolor, or something the neighborhood has never seen. We design a display around your home and your vision.",
    icon: (
      <path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1z" strokeLinejoin="round" />
    ),
  },
  {
    title: "Professional Installation",
    body: "Our experienced crew handles every ladder, clip, and connection. Rooflines, trees, bushes, and pathways are hung clean and precise so it looks as good by day as it does at night.",
    icon: <path d="M4 20h16M7 20V9l5-5 5 5v11M10 20v-5h4v5" strokeLinejoin="round" strokeLinecap="round" />,
  },
  {
    title: "Takedown After Christmas",
    body: "When the season wraps up, we come back and take it all down. No tangled cords, no ladders, no January chores. You just enjoy the holidays.",
    icon: <path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3M18 3v4h-4M6 21v-4h4" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

const steps = [
  { title: "Free consultation", body: "Share your ideas and your home. We'll talk through what you love and what's possible." },
  { title: "Your custom design", body: "We map out the display and give you a clear, up-front quote." },
  { title: "Installation day", body: "Our crew arrives, and hangs everything with care and precision." },
  { title: "Flip the switch", body: "Your home glows all season. That's the moment we live for." },
  { title: "Takedown", body: "After Christmas we remove it all, so the holidays end as easy as they began." },
];

const faqs = [
  {
    q: "How much does professional Christmas light installation cost?",
    a: `Most homes fall between ${typicalRange}, depending on the size of the home and how much you want lit. Large, extravagant displays typically run ${showRange}. Every quote is custom and free.`,
  },
  {
    q: "Do you take the lights down after Christmas?",
    a: "Yes. Takedown is part of what we do. After the holidays, our crew comes back and removes everything so you never have to touch a ladder.",
  },
  {
    q: "Can you bring my own idea to life?",
    a: "Absolutely, that's our favorite part. Bring us a photo, a color scheme, or just a feeling, and we'll design a display around your vision.",
  },
  {
    q: "What areas do you serve?",
    a: `We install throughout Orange County, including ${site.serviceArea.slice(0, 8).join(", ")}, and surrounding cities.`,
  },
  {
    q: "When should I book?",
    a: "As early as you can. The schedule fills up as December gets closer, and booking early gives you the best choice of install dates.",
  },
];

function Photo({
  img,
  className = "",
  sizes,
  preload,
}: {
  img?: SiteImage;
  className?: string;
  sizes: string;
  preload?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {img ? (
        <Image src={img.src} alt={img.alt} fill sizes={sizes} preload={preload} className="object-cover" />
      ) : (
        <div className="photo-fallback absolute inset-0" />
      )}
    </div>
  );
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {children && <p className="mt-6 text-lg leading-relaxed text-mist">{children}</p>}
    </Reveal>
  );
}

export default function Home() {
  const { logo, houses, crew } = getSiteImages();
  const hero = houses[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${site.url}/#business`,
    name: site.name,
    url: site.url,
    description: site.description,
    ...(logo ? { logo: `${site.url}${logo}` } : {}),
    ...(hero ? { image: `${site.url}${hero.src}` } : {}),
    ...(site.isContactPlaceholder ? {} : { telephone: site.phoneDisplay, email: site.email }),
    priceRange: `${formatUsd(pricing.typical.min)}-${formatUsd(pricing.showstopper.max)}`,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Orange County, California",
    },
    address: { "@type": "PostalAddress", addressRegion: "CA", addressCountry: "US" },
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Christmas light design and installation" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Christmas light takedown and removal" } },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, faqLd]).replace(/</g, "\\u003c") }}
      />
      <Header logo={logo} name={site.name} />

      <main id="top">
        {/* ---------------- Hero ---------------- */}
        <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-20 pt-32 sm:items-center sm:pb-24">
          <Photo img={hero} sizes="100vw" preload className="!absolute inset-0 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/60" />
          <Snow />
          <StringLights className="absolute inset-x-0 top-16 h-16 sm:top-18 sm:h-20" swags={7} />

          <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow flex items-center gap-3">
                <span className="h-px w-10 bg-gold" /> Orange County · {site.yearsInBusiness} Years of Holiday Magic
              </p>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                We bring the <span className="text-gold-gradient text-glow italic">Christmas spirit</span> home.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-snow/80 sm:text-xl">
                Custom Christmas light design, professional installation, and takedown after the holidays.
                You dream it. We light it.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#contact" className="btn-primary">
                  Get Your Free Quote
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="#work" className="btn-ghost">
                  See Our Work
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Stats ---------------- */}
        <section className="relative border-y border-white/10 bg-night-2">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-white/10 px-5 sm:px-8 md:grid-cols-4 md:divide-x">
            {[
              { k: `${site.yearsInBusiness}`, v: "Years lighting up OC" },
              { k: "100%", v: "Custom designs" },
              { k: "Full", v: "Install & takedown" },
              { k: "Local", v: "Orange County crew" },
            ].map((s) => (
              <div key={s.v} className="px-4 py-8 text-center md:py-10">
                <dt className="font-display text-4xl font-semibold text-gold-gradient sm:text-5xl">{s.k}</dt>
                <dd className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-mist">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------- About ---------------- */}
        <section id="about" className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-berry/20 blur-[120px]" />
          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-pine/25 blur-[120px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
            <Reveal className="relative">
              <Photo
                img={houses[1] ?? houses[0]}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="aspect-[4/5] rounded-3xl border border-white/10 shadow-2xl shadow-black/60"
              />
              <Photo
                img={crew[0]}
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="!absolute -bottom-10 -right-4 aspect-square w-2/5 rounded-2xl border-4 border-night shadow-2xl sm:-right-10"
              />
              <div className="absolute -left-4 top-8 rounded-2xl border border-gold/30 bg-night/80 px-5 py-4 backdrop-blur sm:-left-8">
                <p className="font-display text-4xl font-semibold text-gold-gradient">{site.yearsInBusiness}</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-mist">Christmases</p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <p className="eyebrow">Our Story</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Twenty years of turning houses into <span className="italic text-gold-gradient">holiday memories.</span>
              </h2>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-snow/80">
                <p>
                  For two decades, Christmas lights have been more than our business. They&apos;re how we share
                  the Christmas spirit with Orange County, one home at a time.
                </p>
                <p>
                  Our biggest love is bringing joy to every family we work with and bringing their vision to
                  life. Whether you picture a timeless warm-white roofline or a full-blown spectacle the whole
                  street stops to see, we design it around you and install it with the care of a crew that
                  has done this for {site.yearsInBusiness} years.
                </p>
                <p>
                  And when the season ends, we come back and take it all down. You get the magic without the
                  ladders, the tangles, or the January cleanup.
                </p>
              </div>
              <p className="mt-8 font-display text-2xl italic text-gold">
                &ldquo;You dream it. We make it glow.&rdquo;
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- Services ---------------- */}
        <section id="services" className="relative bg-night-2 py-24 sm:py-32">
          <StringLights className="absolute inset-x-0 top-0 h-14" swags={9} bulbsPerSwag={4} />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading eyebrow="What We Do" title={<>Everything, start to finish.</>}>
              From the first sketch to the last clip coming down in January, we handle the whole season so
              you can simply enjoy it.
            </SectionHeading>
            <ul className="mt-16 grid gap-6 md:grid-cols-3">
              {services.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 120} className="glow-card rounded-3xl p-8">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/25 to-ember/10 text-gold ring-1 ring-gold/30">
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                      {s.icon}
                    </svg>
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-mist">{s.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------- Gallery ---------------- */}
        <section id="work" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Our Work"
              title={
                <>
                  Homes that <span className="italic text-gold-gradient">glow.</span>
                </>
              }
            >
              A few of the Orange County homes we&apos;ve had the joy of lighting up.
            </SectionHeading>
            <div className="mt-16">
              {houses.length > 0 ? (
                <Gallery images={houses} limit={12} />
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="photo-fallback aspect-[4/3] rounded-2xl border border-white/10" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------------- Crew ---------------- */}
        <section className="relative overflow-hidden bg-night-2 py-24 sm:py-32">
          <div className="absolute left-1/2 top-0 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.3fr]">
            <Reveal>
              <p className="eyebrow">Behind the Glow</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                A crew that sweats the details.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-mist">
                Straight lines, even spacing, clean connections, and no loose wires. Our installers treat
                your home like their own, because a great display is built one clip at a time.
              </p>
              <ul className="mt-8 space-y-3 text-snow/90">
                {["Experienced, careful installers", "Clean wraps on trees and landscaping", "Straight, even rooflines", "Full takedown after the season"].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_12px_var(--gold)]" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150}>
              {crew.length > 1 ? (
                <Gallery images={crew} limit={5} compact />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Photo img={crew[0]} sizes="(min-width: 1024px) 30vw, 50vw" className="col-span-2 aspect-[16/9] rounded-2xl border border-white/10" />
                  <Photo sizes="25vw" className="aspect-square rounded-2xl border border-white/10" />
                  <Photo sizes="25vw" className="aspect-square rounded-2xl border border-white/10" />
                </div>
              )}
            </Reveal>
          </div>
        </section>

        {/* ---------------- Process ---------------- */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading eyebrow="How It Works" title="Simple, from hello to takedown." />
            <ol className="relative mt-16 grid gap-6 md:grid-cols-5">
              <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent md:block" />
              {steps.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 100} className="relative">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-night font-display text-xl font-semibold text-gold shadow-[0_0_30px_-5px_var(--gold)]">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{s.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Pricing ---------------- */}
        <section id="pricing" className="relative overflow-hidden bg-night-2 py-24 sm:py-32">
          <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-berry/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading eyebrow="Pricing" title="Honest pricing. Unforgettable results.">
              Every home is different, so every quote is custom and free. Here&apos;s what most of our
              customers invest.
            </SectionHeading>
            <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
              <Reveal className="glow-card rounded-3xl p-10">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-mist">Most Homes</p>
                <p className="mt-4 whitespace-nowrap font-display text-4xl font-semibold sm:text-5xl">{typicalRange}</p>
                <p className="mt-4 leading-relaxed text-mist">
                  Beautiful, professionally installed displays for the typical Orange County home, designed
                  around your style and your budget.
                </p>
                <ul className="mt-8 space-y-3 text-snow/90">
                  {["Custom design consultation", "Rooflines, trees, and landscaping", "Professional installation", "Post-Christmas takedown"].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <Check /> {t}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="btn-ghost mt-10">
                  Get My Quote
                </a>
              </Reveal>
              <Reveal delay={120} className="glow-card relative rounded-3xl border-gold/40 bg-gradient-to-b from-gold/10 to-transparent p-10">
                <span className="absolute -top-3 right-8 rounded-full bg-gradient-to-r from-berry to-ember px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]">
                  Showstopper
                </span>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Large &amp; Extravagant</p>
                <p className="mt-4 whitespace-nowrap font-display text-4xl font-semibold text-gold-gradient sm:text-5xl">{showRange}</p>
                <p className="mt-4 leading-relaxed text-mist">
                  For the homes that become a neighborhood destination. Big properties, bold ideas, and
                  displays designed to stop traffic.
                </p>
                <ul className="mt-8 space-y-3 text-snow/90">
                  {["Everything in a classic display", "Large-scale, whole-property design", "Trees, yards, and architectural features", "Post-Christmas takedown"].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <Check /> {t}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="btn-primary mt-10">
                  Dream Big With Us
                </a>
              </Reveal>
            </div>
            <p className="mt-10 text-center text-sm text-mist">
              Pricing depends on home size, roof height, and design. Every quote is free and tailored to your home.
            </p>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <SectionHeading eyebrow="FAQ" title="Good questions." />
            <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
              {faqs.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-gold transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-mist">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Contact ---------------- */}
        <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
          <Photo img={houses[2] ?? hero} sizes="100vw" className="!absolute inset-0 opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-night via-night/90 to-night" />
          <Snow count={35} />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <p className="eyebrow">Let&apos;s Light It Up</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Make this your <span className="italic text-gold-gradient text-glow">brightest</span> Christmas yet.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-mist">
                Tell us about your home and your vision. We&apos;ll get back to you with a free, no-pressure
                quote.
              </p>
              <div className="mt-10 space-y-4">
                <a href={site.phoneHref} className="flex items-center gap-4 text-xl font-semibold hover:text-gold">
                  <IconCircle>
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" strokeLinejoin="round" />
                  </IconCircle>
                  {site.phoneDisplay}
                </a>
                <a href={`mailto:${site.email}`} className="flex items-center gap-4 text-xl font-semibold hover:text-gold">
                  <IconCircle>
                    <path d="M4 6h16v12H4zM4 7l8 6 8-6" strokeLinejoin="round" />
                  </IconCircle>
                  {site.email}
                </a>
                <p className="flex items-center gap-4 text-lg text-mist">
                  <IconCircle>
                    <path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z" strokeLinejoin="round" />
                    <circle cx="12" cy="9" r="2.5" />
                  </IconCircle>
                  Serving all of {site.region}
                </p>
              </div>
            </Reveal>
            <Reveal delay={150} className="rounded-3xl border border-white/10 bg-night/70 p-6 backdrop-blur-xl sm:p-10">
              <ContactForm email={site.email} />
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative border-t border-white/10 bg-night-2">
        <StringLights className="absolute inset-x-0 -top-1 h-12 opacity-80" swags={10} bulbsPerSwag={4} />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-10 pt-20 sm:px-8 md:grid-cols-3">
          <div>
            {logo ? (
              <Image src={logo} alt={`${site.name} logo`} width={200} height={70} className="h-14 w-auto object-contain" />
            ) : (
              <p className="font-display text-2xl font-semibold text-gold-gradient">Holiday Lights</p>
            )}
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
              {site.name}. Bringing the Christmas spirit to Orange County for {site.yearsInBusiness} years.
            </p>
          </div>
          <div>
            <p className="eyebrow">Service Area</p>
            <p className="mt-4 text-sm leading-relaxed text-mist">{site.serviceArea.join(" · ")}</p>
          </div>
          <div>
            <p className="eyebrow">Get In Touch</p>
            <ul className="mt-4 space-y-2 text-sm text-mist">
              <li>
                <a href={site.phoneHref} className="hover:text-gold">{site.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-gold">{site.email}</a>
              </li>
              <li>
                <a href="#contact" className="font-semibold text-gold hover:underline">Request a free quote →</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-6 text-center text-xs text-mist/70">
          © {new Date().getFullYear()} {site.name} · {site.domain}
        </div>
      </footer>
    </>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        {children}
      </svg>
    </span>
  );
}
