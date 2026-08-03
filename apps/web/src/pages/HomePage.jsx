import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles, Droplets, Moon, Phone, Mail, MapPin, Instagram, Clock, Check, ShoppingCart as CartIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import ProductsList from '@/components/ProductsList';
import ShoppingCartDrawer from '@/components/ShoppingCart';
import { useCart } from '@/hooks/useCart';

const NAVY = '#001a4d';
const YELLOW = '#FFD700';

const LOGO = 'https://horizons-cdn.hostinger.com/0ee21065-9453-420a-8612-dba671feedfb/c3d2c3ca8b65cfa627c8e96ecf4b54d4.png';
const PRODUCTS_SHOT = 'https://horizons-cdn.hostinger.com/0ee21065-9453-420a-8612-dba671feedfb/8cc8f64d46ba18641957e60883c20c34.png';
const SALON = 'https://images.hostinger.com/e04b7ce7-2507-4fbb-af9b-29d32e67f1fa.png';
const TEEN = 'https://images.hostinger.com/faa0a464-03ed-459e-b0e7-31b146f4ba49.png';
const FACIAL = 'https://images.hostinger.com/ff7ff2aa-b32e-4778-8bba-6087f281b4bd.png';

const navLinks = [
  ['Story', 'story'],
  ['Shop', 'shop'],
  ['Products', 'products'],
  ['Services', 'services'],
  ['Book', 'booking'],
  ['Contact', 'contact'],
];

const products = [
  {
    name: 'Foam Wash',
    size: '40 ml',
    tag: 'Cleanse • Refresh',
    icon: Droplets,
    price: '$18',
    copy: 'A cloud-soft foam that lifts oil, sweat and sunscreen without stripping young skin. Fragrance-free and pH balanced.',
  },
  {
    name: 'Day Moisturiser',
    size: '30 ml',
    tag: 'Hydrate • Protect',
    icon: Sparkles,
    price: '$22',
    copy: 'Lightweight hydration that sits happily under school, sport and screen time. Never greasy, never heavy.',
  },
  {
    name: 'Night Serum',
    size: '20 ml',
    tag: 'Repair • Renew',
    icon: Moon,
    price: '$26',
    copy: 'Overnight repair with gentle niacinamide to calm breakouts and even out marks by morning.',
  },
];

const services = [
  { name: 'Teen Clarity Facial', time: '45 min', price: '$55', desc: 'Deep cleanse, steam and gentle extractions for congested skin.' },
  { name: 'First Facial (12-14)', time: '30 min', price: '$38', desc: 'A soft intro treatment plus a routine walkthrough with a parent.' },
  { name: 'Breakout Rescue', time: '60 min', price: '$70', desc: 'Targeted acne treatment with LED light and calming mask.' },
  { name: 'Glow Up Peel', time: '40 min', price: '$65', desc: 'Mild enzyme peel for dull skin and post-breakout marks.' },
  { name: 'Brow Shape & Tint', time: '25 min', price: '$28', desc: 'Soft natural shaping designed for growing faces.' },
  { name: 'Skyn Coaching Session', time: '30 min', price: 'Free with facial', desc: 'One-on-one routine building, product matching, zero judgement.' },
];

function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      {children}
    </section>
  );
}

function HomePage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const handleSubmit = (label) => (e) => {
    e.preventDefault();
    e.target.reset();
    toast({
      title: label === 'booking' ? 'Appointment request sent' : 'Message sent',
      description: 'Our team will get back to you within one working day.',
    });
  };

  const inputClass =
    'w-full rounded-2xl border-2 border-[#001a4d]/15 bg-white px-4 py-3 text-[#001a4d] placeholder:text-[#001a4d]/40 outline-none focus:border-[#FFD700] transition-colors';

  return (
    <div className="min-h-screen bg-white text-[#001a4d]">
      <Helmet>
        <title>Teen Skyn | Skincare Products & Teen Beauty Salon</title>
        <meta
          name="description"
          content="Teen Skyn makes gentle skincare for teens - Foam Wash, Day Moisturiser and Night Serum - plus friendly salon facials, brow shaping and skin coaching. Book online."
        />
      </Helmet>

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b-4 border-[#FFD700] bg-[#001a4d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-5 py-3">
          <a href="#top" className="flex items-center gap-3">
            <img src={LOGO} alt="Teen Skyn logo" className="h-12 w-auto" />
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full px-4 py-2 font-display text-lg text-white/90 transition-colors hover:bg-white/10 hover:text-[#FFD700]"
              >
                {label}
              </a>
            ))}
            <a
              href="#booking"
              className="ml-2 rounded-full bg-[#FFD700] px-5 py-2.5 font-display text-lg text-[#001a4d] shadow-[0_4px_0_#b89b00] transition-transform active:translate-y-px"
            >
              Book a facial
            </a>
            <button
              onClick={() => setCartOpen(true)}
              className="relative ml-2 text-white hover:text-[#FFD700] transition-colors p-1"
              aria-label="Open cart"
            >
              <CartIcon size={24} />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#FFD700] text-[#001a4d] text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </nav>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl p-2 text-[#FFD700] md:hidden"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-5 pb-5 md:hidden">
            {navLinks.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 font-display text-xl text-white"
              >
                {label}
              </a>
            ))}
            <a
              href="#booking"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-[#FFD700] px-5 py-3 text-center font-display text-xl text-[#001a4d]"
            >
              Book a facial
            </a>
          </nav>
        )}
      </header>

      <ShoppingCartDrawer isCartOpen={cartOpen} setIsCartOpen={setCartOpen} />

      {/* HERO */}
      <Section id="top">
        <div className="relative min-h-[100dvh] overflow-hidden bg-[#3a1078] ts-doodle">
          <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#FFD700]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-[#001a4d]/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-[86rem] items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-4 py-1.5 font-display text-sm uppercase tracking-wide text-[#001a4d]">
                Made for skin aged 12-19
              </span>
              <h1 className="mt-5 font-display text-[clamp(3rem,9vw,6.5rem)] font-extrabold leading-[0.92] text-[#FFD700] ts-sticker">
                Real skin.
                <br />
                Real routine.
                <br />
                <span className="text-white">Zero drama.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
                Three simple products and a salon that actually gets teen skin. No 12-step routines, no scary
                ingredients, no lectures about your fringe.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#products"
                  className="rounded-full bg-[#FFD700] px-7 py-4 font-display text-xl text-[#001a4d] shadow-[0_6px_0_#b89b00] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Shop the routine
                </a>
                <a
                  href="#booking"
                  className="rounded-full border-2 border-white/70 px-7 py-4 font-display text-xl text-white transition-colors hover:bg-white hover:text-[#3a1078]"
                >
                  Book a facial
                </a>
              </div>
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-white/80">
                {[['4,800+', 'teens treated'], ['3', 'products, that is it'], ['0%', 'harsh actives']].map(([k, v]) => (
                  <div key={v}>
                    <dt className="font-display text-3xl text-[#FFD700]">{k}</dt>
                    <dd className="text-sm uppercase tracking-wide">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="relative"
            >
              <div className="rotate-[-2deg] rounded-[2.5rem] bg-white p-6 shadow-[0_24px_0_rgba(0,26,77,.35)]">
                <img src={PRODUCTS_SHOT} alt="Teen Skyn Foam Wash, Day Moisturiser and Night Serum" className="w-full rounded-[1.8rem]" />
              </div>
              <div className="absolute -bottom-5 left-4 rotate-[-6deg] rounded-2xl bg-[#FFD700] px-5 py-2 font-display text-lg text-[#001a4d] shadow-lg">
                The full routine, $58
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y-4 border-[#001a4d] bg-[#FFD700] py-3">
        <div className="ts-marquee flex w-max gap-8 whitespace-nowrap font-display text-2xl text-[#001a4d]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-8">
              {['Dermatologist reviewed', 'Fragrance free', 'Never tested on animals', 'Made for teen skin', 'Parent approved', 'Vegan formulas'].map((t) => (
                <span key={t} className="flex items-center gap-8">
                  {t} <span className="text-[#3a1078]">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* STORY */}
      <Section id="story" className="bg-white">
        <div className="mx-auto grid max-w-[72rem] items-center gap-12 px-5 py-24 md:grid-cols-2">
          <div className="relative">
            <img src={TEEN} alt="Teenager washing her face with Teen Skyn Foam Wash" className="rounded-[2rem] shadow-[0_18px_0_#FFD700]" />
          </div>
          <div>
            <p className="font-display text-lg uppercase tracking-widest text-[#3a1078]">Our story</p>
            <h2 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-tight">
              We started because teen skin kept getting
              <span className="relative mx-2 inline-block">
                <span className="relative z-10">handed down</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 bg-[#FFD700]" />
              </span>
              adult products.
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-[#001a4d]/80">
              <p>
                Teen Skyn began in a small salon room where half our clients were 14-year-olds using their mum&apos;s
                retinol and wondering why their skin was angry. So we built the opposite: three gentle formulas, clear
                instructions, and honest conversations about hormones, sport, sunscreen and stress.
              </p>
              <p>
                Every batch is dermatologist reviewed, fragrance free and made without the actives that overwhelm young
                skin barriers. And every product comes with a real routine you can finish in 90 seconds.
              </p>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Gentle-first formulation', 'Teen-trained therapists', 'No pressure upselling', 'Parents welcome in room'].map((t) => (
                <li key={t} className="flex items-center gap-2 font-semibold">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#001a4d] text-[#FFD700]">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* PRODUCTS */}
      <Section id="products" className="bg-[#001a4d] text-white">
        <div className="mx-auto max-w-[80rem] px-5 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(2.4rem,6vw,4rem)] text-[#FFD700] ts-sticker">The routine</h2>
            <p className="max-w-md text-white/75">Morning: wash, moisturise. Night: wash, serum. That is the entire plan.</p>
          </div>
          <div className="mt-14 space-y-8">
            {products.map((p, i) => (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="grid items-center gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-7 md:grid-cols-[auto_1fr_auto]"
              >
                <div className="flex items-center gap-5">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#FFD700] text-[#001a4d]">
                    <p.icon size={28} />
                  </span>
                  <span className="font-display text-5xl text-white/15">0{i + 1}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-display text-3xl text-[#FFD700]">{p.name}</h3>
                    <span className="text-sm uppercase tracking-widest text-white/60">{p.tag} • {p.size}</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-white/80">{p.copy}</p>
                </div>
                <div className="flex items-center gap-4 md:flex-col md:items-end">
                  <span className="font-display text-3xl">{p.price}</span>
                  <a href="#contact" className="rounded-full bg-white px-5 py-2.5 font-display text-lg text-[#001a4d] transition-transform active:translate-y-px">
                    Enquire
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </Section>

      {/* SHOP */}
      <Section id="shop" className="bg-[#f8f6ff]">
        <div className="mx-auto max-w-[86rem] px-5 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-display text-lg uppercase tracking-widest text-[#3a1078]">Online Store</p>
              <h2 className="mt-2 font-display text-[clamp(2.4rem,6vw,4rem)] text-[#001a4d] ts-sticker">Shop Teen Skyn</h2>
              <p className="mt-3 max-w-xl text-[#001a4d]/70 text-lg">Order your skincare kit and have it delivered straight to your door.</p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 bg-[#001a4d] hover:bg-[#FFD700] text-white hover:text-[#001a4d] font-extrabold px-6 py-3 rounded-full transition-all duration-200 shadow-lg text-base active:scale-95"
            >
              <CartIcon size={18} />
              View Cart {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
          <ProductsList />
        </div>
      </Section>

      {/* SERVICES */}
      <Section id="services" className="bg-[#fffaf0]">
        <div className="mx-auto max-w-[80rem] px-5 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="font-display text-lg uppercase tracking-widest text-[#3a1078]">In the salon</p>
              <h2 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-tight">Services menu</h2>
              <p className="mt-4 text-lg text-[#001a4d]/75">
                Every treatment is designed around teen skin: shorter, gentler, and explained as we go. Under 16s can
                bring a parent into the room.
              </p>
              <img src={FACIAL} alt="Therapist applying a sheet mask during a teen facial" className="mt-8 rounded-[2rem] shadow-[0_16px_0_#001a4d]" />
            </div>
            <ul className="divide-y-2 divide-[#001a4d]/10">
              {services.map((s) => (
                <li key={s.name} className="flex flex-wrap items-start justify-between gap-4 py-6">
                  <div className="max-w-md">
                    <h3 className="font-display text-2xl">{s.name}</h3>
                    <p className="mt-1 text-[#001a4d]/70">{s.desc}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm uppercase tracking-widest text-[#3a1078]">
                      <Clock size={14} /> {s.time}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#FFD700] px-4 py-1.5 font-display text-xl text-[#001a4d]">{s.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* PROMO */}
      <Section id="promo">
        <div className="relative overflow-hidden bg-[#3a1078] ts-doodle">
          <div className="mx-auto flex max-w-[72rem] flex-col items-center gap-6 px-5 py-20 text-center">
            <span className="rotate-[-2deg] rounded-full bg-white px-4 py-1.5 font-display uppercase tracking-widest text-[#3a1078]">
              This month only
            </span>
            <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.95] text-[#FFD700] ts-sticker">
              Book any facial,
              <br />
              get the Foam Wash free
            </h2>
            <p className="max-w-xl text-lg text-white/85">
              Plus 20% off the full three-step routine when you buy in salon. Students and siblings both count - just
              mention it at the desk.
            </p>
            <a
              href="#booking"
              className="mt-2 rounded-full bg-[#FFD700] px-8 py-4 font-display text-xl text-[#001a4d] shadow-[0_6px_0_#b89b00] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Claim the offer
            </a>
          </div>
        </div>
      </Section>

      {/* BOOKING */}
      <Section id="booking" className="bg-white">
        <div className="mx-auto grid max-w-[80rem] gap-12 px-5 py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="font-display text-lg uppercase tracking-widest text-[#3a1078]">Appointments</p>
            <h2 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-tight">Book your spot</h2>
            <p className="mt-4 text-lg text-[#001a4d]/75">
              Choose a treatment and a time that suits - we confirm by text within one working day.
            </p>
            <img src={SALON} alt="Inside the Teen Skyn salon" className="mt-8 rounded-[2rem] shadow-[0_16px_0_#FFD700]" />
          </div>
          <form onSubmit={handleSubmit('booking')} className="rounded-[2rem] border-4 border-[#001a4d] bg-[#fffaf0] p-7">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <label htmlFor="b-name" className="font-display text-lg">Your name</label>
                <input id="b-name" name="name" required placeholder="Ava Robertson" className={inputClass} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <label htmlFor="b-phone" className="font-display text-lg">Phone</label>
                  <input id="b-phone" name="phone" required placeholder="0400 000 000" className={inputClass} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="b-age" className="font-display text-lg">Age</label>
                  <input id="b-age" name="age" type="number" min="10" max="30" required placeholder="15" className={inputClass} />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="b-service" className="font-display text-lg">Treatment</label>
                <select id="b-service" name="service" required className={inputClass} defaultValue={services[0].name}>
                  {services.map((s) => (
                    <option key={s.name} value={s.name}>{s.name} — {s.price}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <label htmlFor="b-date" className="font-display text-lg">Preferred date</label>
                  <input id="b-date" name="date" type="date" required className={inputClass} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="b-time" className="font-display text-lg">Preferred time</label>
                  <input id="b-time" name="time" type="time" required className={inputClass} />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="b-notes" className="font-display text-lg">Anything we should know?</label>
                <textarea id="b-notes" name="notes" rows="3" placeholder="Sensitive skin, allergies, first facial..." className={inputClass} />
              </div>
              <button
                type="submit"
                className="rounded-full bg-[#001a4d] px-7 py-4 font-display text-xl text-[#FFD700] shadow-[0_6px_0_#000d26] transition-transform active:translate-y-0.5"
              >
                Request appointment
              </button>
            </div>
          </form>
        </div>
      </Section>

      {/* CONTACT */}
      <Section id="contact" className="bg-[#001a4d] text-white">
        <div className="mx-auto grid max-w-[72rem] gap-12 px-5 py-24 md:grid-cols-2">
          <div>
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] text-[#FFD700] ts-sticker">Say hi</h2>
            <p className="mt-4 text-white/80">
              Questions about ingredients, a product order, or a school workshop? Send us a note - a human replies.
            </p>
            <ul className="mt-8 space-y-4 text-white/85">
              <li className="flex items-center gap-3"><Phone size={20} className="text-[#FFD700]" /> (02) 8123 4477</li>
              <li className="flex items-center gap-3"><Mail size={20} className="text-[#FFD700]" /> hello@teenskyn.com</li>
              <li className="flex items-center gap-3"><MapPin size={20} className="text-[#FFD700]" /> 18 Alba Lane, Surry Hills</li>
              <li className="flex items-center gap-3"><Instagram size={20} className="text-[#FFD700]" /> @teenskyn</li>
            </ul>
          </div>
          <form onSubmit={handleSubmit('contact')} className="grid gap-5 rounded-[2rem] bg-white p-7 text-[#001a4d]">
            <div className="grid gap-2">
              <label htmlFor="c-name" className="font-display text-lg">Name</label>
              <input id="c-name" name="name" required placeholder="Your name" className={inputClass} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="c-email" className="font-display text-lg">Email</label>
              <input id="c-email" name="email" type="email" required placeholder="you@email.com" className={inputClass} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="c-msg" className="font-display text-lg">Message</label>
              <textarea id="c-msg" name="message" rows="5" required placeholder="How can we help?" className={inputClass} />
            </div>
            <button
              type="submit"
              className="rounded-full bg-[#FFD700] px-7 py-4 font-display text-xl text-[#001a4d] shadow-[0_6px_0_#b89b00] transition-transform active:translate-y-0.5"
            >
              Send message
            </button>
          </form>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="border-t-4 border-[#FFD700] bg-[#3a1078] text-white/80">
        <div className="mx-auto grid max-w-[80rem] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src={LOGO} alt="Teen Skyn" className="h-16 w-auto" />
            <p className="mt-4 text-sm">Gentle skincare and friendly facials for skin that is still figuring itself out.</p>
          </div>
          <div>
            <h3 className="font-display text-xl text-[#FFD700]">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {navLinks.map(([label, id]) => (
                <li key={id}><a href={`#${id}`} className="hover:text-[#FFD700]">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-xl text-[#FFD700]">Salon hours</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Mon - Wed: 10am - 6pm</li>
              <li>Thu - Fri: 10am - 8pm</li>
              <li>Saturday: 9am - 4pm</li>
              <li>Sunday: closed</li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-xl text-[#FFD700]">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>18 Alba Lane, Surry Hills NSW 2010</li>
              <li>(02) 8123 4477</li>
              <li>hello@teenskyn.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 px-5 py-5 text-center text-xs">
          © {new Date().getFullYear()} Teen Skyn. All rights reserved.
        </div>
      </footer>

      <span className="hidden" style={{ color: NAVY, background: YELLOW }} />
      <Toaster />
    </div>
  );
}

export default HomePage;
