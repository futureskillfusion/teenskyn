import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Instagram } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/60000000000';
const INSTAGRAM_URL = 'https://instagram.com/teenskyn';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#3a1078] ts-doodle text-white">
      <Helmet>
        <title>Join the Community | Teen Skyn</title>
        <meta name="description" content="Join the Teen Skyn community on WhatsApp and Instagram for tips, offers and updates." />
      </Helmet>

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
        <Link to="/" className="mb-10 flex items-center gap-2 self-start text-white/80 hover:text-[#FFD700] transition-colors">
          <ArrowLeft size={18} /> Back to Teen Skyn
        </Link>

        <span className="rounded-full bg-[#FFD700] px-4 py-1.5 font-display text-sm uppercase tracking-wide text-[#001a4d]">
          VIP Community
        </span>
        <h1 className="mt-5 font-display text-[clamp(2.4rem,7vw,4.5rem)] font-extrabold leading-[0.95] text-white ts-sticker">
          Join the Teen Skyn crew
        </h1>
        <p className="mt-6 max-w-lg text-lg text-white/85">
          Get first access to new drops, salon offers and skin tips — straight from us, no spam.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 rounded-[2rem] bg-white p-8 text-[#001a4d] shadow-[0_10px_0_rgba(0,0,0,.2)] transition-transform hover:-translate-y-1"
          >
            <MessageCircle size={40} className="text-green-600" />
            <span className="font-display text-xl font-bold">WhatsApp Group</span>
            <span className="text-sm text-[#001a4d]/60">Chat with us directly</span>
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 rounded-[2rem] bg-white p-8 text-[#001a4d] shadow-[0_10px_0_rgba(0,0,0,.2)] transition-transform hover:-translate-y-1"
          >
            <Instagram size={40} className="text-pink-600" />
            <span className="font-display text-xl font-bold">Instagram</span>
            <span className="text-sm text-[#001a4d]/60">Follow @teenskyn</span>
          </a>
        </div>
      </div>
    </div>
  );
}
