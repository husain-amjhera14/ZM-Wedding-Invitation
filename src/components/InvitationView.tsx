"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ArrowDown,
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  WEDDING,
  DEVELOPER_CREDIT,
  ParsedInvite,
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildWhatsAppRsvpUrl,
  buildWhatsAppWishesUrl,
} from "@/lib/invitation";
import Countdown from "./Countdown";
import OpeningCurtain from "./OpeningCurtain";
import FallingLeaves from "./FallingLeaves";

interface Props {
  invite: ParsedInvite;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function DiamondDivider({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 my-4">
      <span
        className={`h-px w-12 sm:w-16 ${light ? "bg-[#d3b270]/45" : "bg-[#b68d40]/45"
          }`}
      />
      <span
        className={`w-2 h-2 rotate-45 ${light ? "bg-[#d3b270]" : "bg-[#b68d40]"
          }`}
      />
      <span
        className={`h-px w-12 sm:w-16 ${light ? "bg-[#d3b270]/45" : "bg-[#b68d40]/45"
          }`}
      />
    </div>
  );
}

function HangingLantern({
  cordHeight = 76,
  delayed = false,
}: {
  cordHeight?: number;
  delayed?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none flex flex-col items-center ${delayed ? "lantern-sway-delayed" : "lantern-sway"
        }`}
    >
      <div
        className="w-px bg-gradient-to-b from-[#d3b270]/40 to-[#d3b270]/85"
        style={{ height: `${cordHeight}px` }}
      />
      <div className="relative flex items-center justify-center">
        {/* Soft warm candle glow */}
        <div className="absolute w-24 h-24 rounded-full bg-[#f5cf7b]/25 blur-2xl" />
        <svg
          width="46"
          height="68"
          viewBox="0 0 46 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_0_14px_rgba(245,207,123,0.45)]"
        >
          {/* Ring & top cap */}
          <circle cx="23" cy="5" r="3" stroke="#d3b270" strokeWidth="1.5" />
          <path
            d="M15 16C15 11.5 18.5 8.5 23 8.5C27.5 8.5 31 11.5 31 16H15Z"
            fill="#8c6426"
            stroke="#e4c27a"
            strokeWidth="1"
          />
          <rect x="12" y="16" width="22" height="3" rx="1.5" fill="#d3b270" />
          {/* Lantern body with warm glowing panes */}
          <path
            d="M13 19L9.5 36L13.5 52H32.5L36.5 36L33 19H13Z"
            fill="url(#lanternGlow)"
            stroke="#d3b270"
            strokeWidth="1.4"
          />
          {/* Decorative lattice mullions */}
          <path
            d="M18.5 19L17 36L19 52M27.5 19L29 36L27 52M10.5 36H35.5"
            stroke="#8c5f1f"
            strokeWidth="1.1"
            strokeOpacity="0.85"
          />
          {/* Base & finial */}
          <rect x="13" y="52" width="20" height="3" rx="1.5" fill="#d3b270" />
          <path d="M18 55L23 63L28 55H18Z" fill="#a87c32" />
          <defs>
            <radialGradient
              id="lanternGlow"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(23 35) rotate(90) scale(17 12)"
            >
              <stop stopColor="#fff7d6" />
              <stop offset="0.55" stopColor="#f3c563" />
              <stop offset="1" stopColor="#b07625" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function InvitationView({ invite }: Props) {
  // RSVP form state
  const [rsvpName, setRsvpName] = useState(invite.guestName ?? "");
  const [rsvpGuests, setRsvpGuests] = useState(invite.invitees ?? "1");
  const [attending, setAttending] = useState<"accept" | "decline">("accept");

  // Wishes form state
  const [wishName, setWishName] = useState(invite.guestName ?? "");
  const [wishMessage, setWishMessage] = useState("");
  const [wishSent, setWishSent] = useState(false);

  // Copy address feedback
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Background music state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userMutedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const tryPlayMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || userMutedRef.current) return;
    audio.volume = 0.45;
    audio.muted = false;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch(() => {
          // Browser blocked autoplay before user gesture; will retry on interaction
        });
    }
  }, []);

  // Attempt to play unmuted on mount; if browser blocks autoplay, start on first user gesture
  useEffect(() => {
    tryPlayMusic();

    const handleFirstInteraction = () => {
      if (!userMutedRef.current) {
        tryPlayMusic();
      }
      if (audioRef.current && !audioRef.current.paused) {
        window.removeEventListener("pointerdown", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
        window.removeEventListener("scroll", handleFirstInteraction);
      }
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { passive: true });
    window.addEventListener("keydown", handleFirstInteraction, { passive: true });
    window.addEventListener("scroll", handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
    };
  }, [tryPlayMusic]);

  const handleToggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isMuted) {
      userMutedRef.current = true;
      audio.muted = true;
      setIsMuted(true);
    } else {
      userMutedRef.current = false;
      audio.volume = 0.45;
      audio.muted = false;
      setIsMuted(false);
      if (audio.paused) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => { });
      }
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(WEDDING.venue.fullAddress);
    } catch {
      const el = document.createElement("textarea");
      el.value = WEDDING.venue.fullAddress;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2200);
  };

  const handleDownloadIcs = () => {
    const ics = buildIcsContent();
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Zahra-Mufaddal-Wedding.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildWhatsAppRsvpUrl(
      rsvpName || invite.displayName,
      rsvpGuests,
      attending
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSendWishes = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildWhatsAppWishesUrl(
      wishName || invite.displayName,
      wishMessage
    );
    window.open(url, "_blank", "noopener,noreferrer");
    setWishSent(true);
    setTimeout(() => setWishSent(false), 4000);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Background Music */}
      <audio
        ref={audioRef}
        src="/music/bg-music.mp3"
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Bottom-Right Audio Mute/Unmute Toggle */}
      <button
        type="button"
        onClick={handleToggleMute}
        aria-label={!isMuted ? "Mute background music" : "Unmute background music"}
        title={!isMuted ? "Mute music" : "Unmute music"}
        className="cursor-pointer fixed bottom-5 right-5 z-[60] w-11 h-11 rounded-full bg-[#4f0a1d]/92 hover:bg-[#661028] text-[#f1d899] border border-[#d3b270]/65 shadow-[0_10px_28px_-6px_rgba(20,2,8,0.65)] backdrop-blur-sm flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {!isMuted ? (
          <Volume2 className="w-4.5 h-4.5" />
        ) : (
          <VolumeX className="w-4.5 h-4.5 opacity-85" />
        )}
      </button>

      {/* Split-door opening screen for personalized invite links */}
      {invite.isPersonalized && (
        <OpeningCurtain invite={invite} onStartOpen={tryPlayMusic} />
      )}

      {/* ========================================================= */}
      {/* 1. FULL-BLEED DEEP BURGUNDY HERO WITH ARCHED CENTERPIECE  */}
      {/* ========================================================= */}
      <section className="hero-burgundy-lattice relative min-h-[94vh] w-full flex flex-col items-center justify-center px-5 pt-14 pb-12 overflow-hidden">
        {/* Soft Falling Golden Leaves */}
        <FallingLeaves />

        {/* Hanging Glowing Lanterns */}
        <div className="absolute top-0 left-[6%] sm:left-[12%] md:left-[16%] z-10 opacity-90">
          <HangingLantern cordHeight={56} />
        </div>
        <div className="absolute top-0 right-[6%] sm:right-[12%] md:right-[16%] z-10 opacity-90">
          <HangingLantern cordHeight={88} delayed />
        </div>

        {/* Centered Ivory Architectural Arch */}
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="arch-card relative z-20 w-full max-w-[450px] px-7 sm:px-12 pt-12 sm:pt-14 pb-10 sm:pb-12 text-center flex flex-col items-center"
        >
          {/* Authentic Bismillah & Alhamdulillah Calligraphy from Card */}
          <img
            src="/images/bismillah-header.svg"
            alt="Bismillahir Rahmanir Raheem — Alhamdulillah Shukran Lillah"
            className="h-16 sm:h-[74px] w-auto opacity-95 mb-1"
          />

          {/* Save The Date & Date Line */}
          <p className="font-sans-ui text-[10px] tracking-[0.28em] uppercase text-[#9a7942] mt-2 font-medium">
            Save The Date
          </p>
          <p className="font-serif-display text-sm sm:text-base tracking-[0.24em] text-[#5e0e24] mt-1.5 font-medium">
            12 &nbsp;|&nbsp; JAN &nbsp;|&nbsp; 2027
          </p>

          {/* Couple Names in Refined Script */}
          <h1 className="font-script text-5xl sm:text-[62px] text-[#5e0e24] leading-[1.08] mt-6">
            {WEDDING.bride.name}
          </h1>
          <span className="font-script text-2xl sm:text-3xl text-[#b68d40] my-0.5">
            &amp;
          </span>
          <h2 className="font-script text-5xl sm:text-[62px] text-[#5e0e24] leading-[1.08]">
            {WEDDING.groom.name}
          </h2>

          <DiamondDivider />

          <p className="font-serif-body italic text-base sm:text-lg text-[#6c4c55] mb-6">
            Wedding Celebration &amp; Dinner
          </p>

          <a
            href="#dua"
            className="btn-burgundy inline-flex items-center justify-center px-8 py-3 rounded-full font-sans-ui text-[11px] tracking-[0.22em] uppercase font-semibold"
          >
            View Details
          </a>
        </motion.div>

        {/* Scroll Down Cue */}
        <a
          href="#dua"
          aria-label="Scroll down"
          className="relative z-20 mt-7 text-[#d3b270]/85 hover:text-[#f5cf7b] transition-colors animate-bounce"
        >
          <ArrowDown className="w-6 h-6 stroke-[1.75]" />
        </a>
      </section>

      {/* ========================================================= */}
      {/* 2. DUA BAND (Textured Paper Background — no header)       */}
      {/* ========================================================= */}
      <section
        id="dua"
        className="relative w-full bg-[#f3ece1] py-16 sm:py-20 px-5 text-center overflow-hidden"
      >
        {/* Fine Handmade Paper Texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat opacity-70 mix-blend-multiply pointer-events-none select-none"
          style={{
            backgroundImage: 'url("/images/paper-texture.png")',
            backgroundSize: "520px auto",
          }}
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <DiamondDivider />

          <div className="mt-5 space-y-2 text-[#5e0e24] font-serif-body text-lg sm:text-[21px] leading-relaxed">
            {WEDDING.blessings.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="mt-5">
            <DiamondDivider />
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 3. ELDERS, PARENTS & COUPLE (Floral Watermark Background) */}
      {/* ========================================================= */}
      <section className="relative w-full bg-[#faf7f2] py-20 sm:py-24 px-5 text-center overflow-hidden">
        {/* Authentic Soft Watercolor Floral Watermark from PDF Card */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none select-none"
          style={{ backgroundImage: 'url("/images/floral-watermark.webp")' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/75 via-[#faf7f2]/20 to-[#faf7f2]/75 pointer-events-none"
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          {/* Grandparents */}
          <div className="space-y-1">
            <p className="font-serif-body italic text-base sm:text-lg text-[#6c4c55]">
              With the Blessings of Grand Parents
            </p>
            <p className="font-serif-body text-lg sm:text-xl font-medium text-[#5e0e24]">
              {WEDDING.bride.grandparents}
            </p>
          </div>

          {/* Bride's Parents & Formal Invitation */}
          <div className="mt-8 space-y-1.5">
            <p className="font-serif-body text-xl sm:text-2xl font-semibold text-[#5e0e24]">
              {WEDDING.bride.parents}
            </p>
            <p className="font-serif-body text-base sm:text-lg text-[#6c4c55] leading-relaxed max-w-xl mx-auto">
              solicit the honour of your presence at the auspicious occasion of
              the wedding of their beloved daughter
            </p>
          </div>

          {/* Couple Names */}
          <div className="my-10 sm:my-12 flex flex-col items-center">
            <h2 className="font-script text-6xl sm:text-7xl text-[#5e0e24] leading-[1.08]">
              {WEDDING.bride.name}
            </h2>
            <span className="font-serif-display text-xs sm:text-sm tracking-[0.3em] uppercase text-[#9a7942] font-semibold my-2">
              Weds
            </span>
            <h2 className="font-script text-6xl sm:text-7xl text-[#5e0e24] leading-[1.08]">
              {WEDDING.groom.name}
            </h2>
            <p className="font-serif-body text-base sm:text-lg text-[#6c4c55] mt-5">
              S/o.{" "}
              <span className="font-semibold text-[#3c1822]">
                {WEDDING.groom.parents}
              </span>
            </p>
          </div>

          {/* Nikah Note between Gold Hairlines */}
          <div className="border-y border-[#b68d40]/35 py-6 px-4 space-y-2">
            <p className="font-serif-body text-lg sm:text-xl font-semibold text-[#5e0e24]">
              {WEDDING.nikahNote}
            </p>
            {invite.invitees && (
              <p className="font-sans-ui text-xs tracking-[0.2em] uppercase text-[#9a7942] font-semibold">
                Invitees ({invite.invitees})
              </p>
            )}
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 4. WHEN & WHERE + COUNTDOWN + MAP (Textured Sand)         */}
      {/* ========================================================= */}
      <section
        id="venue"
        className="relative w-full bg-[#f3ece1] py-20 sm:py-24 px-5 text-center overflow-hidden"
      >
        {/* Fine Handmade Paper Texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat opacity-70 mix-blend-multiply pointer-events-none select-none"
          style={{
            backgroundImage: 'url("/images/paper-texture.png")',
            backgroundSize: "520px auto",
          }}
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <p className="font-sans-ui text-[11px] tracking-[0.26em] uppercase text-[#9a7942] font-medium">
            When &amp; Where
          </p>
          <h2 className="font-serif-body text-4xl sm:text-[42px] font-medium text-[#5e0e24] mt-2 mb-9">
            Program Inshaallah
          </h2>

          {/* 3 Clean Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="soft-card rounded-xl px-6 py-8 flex flex-col items-center">
              <div className="w-12 h-12 sm:w-11 sm:h-11 rounded-full border border-[#b68d40]/50 bg-[#faf7f2] flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-[#b68d40]" />
              </div>
              <p className="font-sans-ui text-xs sm:text-[11px] tracking-[0.24em] uppercase text-[#9a7942] font-semibold">
                Date
              </p>
              <p className="font-serif-body text-2xl sm:text-[22px] font-semibold text-[#3c1822] mt-2">
                {WEDDING.event.fullDate}
              </p>
              <p className="font-serif-body text-lg sm:text-[17px] text-[#6c4c55] mt-1">
                {WEDDING.event.hijriDate}
              </p>
            </div>

            <div className="soft-card rounded-xl px-6 py-8 flex flex-col items-center">
              <div className="w-12 h-12 sm:w-11 sm:h-11 rounded-full border border-[#b68d40]/50 bg-[#faf7f2] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-[#b68d40]" />
              </div>
              <p className="font-sans-ui text-xs sm:text-[11px] tracking-[0.24em] uppercase text-[#9a7942] font-semibold">
                Time
              </p>
              <p className="font-serif-body text-2xl sm:text-[22px] font-semibold text-[#3c1822] mt-2">
                8:00 P.M. Onwards
              </p>
              <p className="font-serif-body text-lg sm:text-[17px] text-[#6c4c55] mt-1">
                Wedding Dinner
              </p>
            </div>

            <div className="soft-card rounded-xl px-6 py-8 flex flex-col items-center">
              <div className="w-12 h-12 sm:w-11 sm:h-11 rounded-full border border-[#b68d40]/50 bg-[#faf7f2] flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 sm:w-4 sm:h-4 text-[#b68d40]" />
              </div>
              <p className="font-sans-ui text-xs sm:text-[11px] tracking-[0.24em] uppercase text-[#9a7942] font-semibold">
                Venue
              </p>
              <p className="font-serif-body text-2xl sm:text-[22px] font-semibold text-[#3c1822] mt-2">
                {WEDDING.venue.name}
              </p>
              <p className="font-serif-body text-lg sm:text-[17px] text-[#6c4c55] mt-1">
                {WEDDING.venue.city}
              </p>
            </div>
          </div>

          {/* Countdown Timer directly below the 3 Program Boxes */}
          <div id="countdown" className="my-12">
            <p className="font-sans-ui text-[10px] sm:text-[11px] tracking-[0.26em] uppercase text-[#9a7942] font-medium mb-5">
              Counting Down To The Blessed Evening
            </p>
            <Countdown />
          </div>

          {/* Embedded Google Map */}
          <div className="rounded-xl overflow-hidden shadow-[0_18px_45px_-20px_rgba(60,24,34,0.28)] border border-[#b68d40]/25 bg-[#faf7f2] aspect-[16/9] sm:aspect-[21/9]">
            <iframe
              title="Taheri Masjid, Siyaganj (Siyaganj Jamat Khana), Indore"
              src={WEDDING.venue.mapEmbedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Primary Action Pills */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href={WEDDING.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-burgundy inline-flex items-center justify-center px-7 py-3 rounded-full font-sans-ui text-[11px] tracking-[0.2em] uppercase font-semibold"
            >
              Get Directions
            </a>
            <a
              href={buildGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-burgundy inline-flex items-center justify-center px-7 py-3 rounded-full font-sans-ui text-[11px] tracking-[0.2em] uppercase font-semibold"
            >
              Add To Calendar
            </a>
          </div>

          {/* Subtle Utility Links */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 font-sans-ui text-xs text-[#6c4c55]">
            <button
              type="button"
              onClick={handleCopyAddress}
              className="cursor-pointer inline-flex items-center gap-1.5 hover:text-[#5e0e24] transition-colors"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  Address Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Address
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="cursor-pointer inline-flex items-center gap-1.5 hover:text-[#5e0e24] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .ics (Apple / Outlook)
            </button>
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 5. KINDLY RESPOND — WILL YOU JOIN US? (Floral Ivory)      */}
      {/* ========================================================= */}
      <section
        id="rsvp"
        className="relative w-full bg-[#faf7f2] py-20 sm:py-24 px-5 text-center overflow-hidden"
      >
        {/* Soft Watercolor Floral Watermark */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none select-none"
          style={{ backgroundImage: 'url("/images/floral-watermark.webp")' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/75 via-[#faf7f2]/20 to-[#faf7f2]/75 pointer-events-none"
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="relative z-10 max-w-xl mx-auto"
        >
          <p className="font-sans-ui text-[10px] sm:text-[11px] tracking-[0.26em] uppercase text-[#9a7942] font-medium">
            Kindly Respond
          </p>
          <h2 className="font-serif-body text-3xl sm:text-[42px] font-medium text-[#5e0e24] mt-2 mb-9">
            Will You Join Us?
          </h2>

          <form
            onSubmit={handleConfirmRsvp}
            className="soft-card rounded-2xl p-6 sm:p-9 text-left space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="rsvp-name"
                  className="block font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#9a7942] font-semibold mb-2"
                >
                  Your Name
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg bg-[#f3ece1]/85 border border-[#b68d40]/25 px-4 py-2.5 font-serif-body text-lg text-[#3c1822] placeholder:text-[#6c4c55]/50 focus:outline-none focus:border-[#5e0e24]"
                />
              </div>

              <div>
                <label
                  htmlFor="rsvp-guests"
                  className="block font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#9a7942] font-semibold mb-2"
                >
                  Guests
                </label>
                <input
                  id="rsvp-guests"
                  type="text"
                  value={rsvpGuests}
                  onChange={(e) => setRsvpGuests(e.target.value)}
                  placeholder="1"
                  className="w-full rounded-lg bg-[#f3ece1]/85 border border-[#b68d40]/25 px-4 py-2.5 font-serif-body text-lg text-[#3c1822] placeholder:text-[#6c4c55]/50 focus:outline-none focus:border-[#5e0e24]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-serif-body text-base text-[#6c4c55] mr-1">
                Attending?
              </span>
              <button
                type="button"
                onClick={() => setAttending("accept")}
                className={`cursor-pointer px-5 py-2 rounded-full font-serif-body text-sm sm:text-base transition-colors ${attending === "accept"
                  ? "bg-[#5e0e24] text-[#faf7f2] shadow-sm"
                  : "border border-[#b68d40]/40 text-[#5e0e24] hover:bg-[#5e0e24]/5"
                  }`}
              >
                Joyfully Accept
              </button>
              <button
                type="button"
                onClick={() => setAttending("decline")}
                className={`cursor-pointer px-5 py-2 rounded-full font-serif-body text-sm sm:text-base transition-colors ${attending === "decline"
                  ? "bg-[#5e0e24] text-[#faf7f2] shadow-sm"
                  : "border border-[#b68d40]/40 text-[#5e0e24] hover:bg-[#5e0e24]/5"
                  }`}
              >
                Regretfully Decline
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="submit"
                className="btn-burgundy cursor-pointer inline-flex items-center justify-center px-9 py-3 rounded-full font-sans-ui text-[11px] tracking-[0.22em] uppercase font-semibold"
              >
                Send Confirmation
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 6. DUAS FOR THE COUPLE — SEND YOUR WISHES (Textured Sand) */}
      {/* ========================================================= */}
      <section className="relative w-full bg-[#f3ece1] py-20 sm:py-24 px-5 text-center overflow-hidden">
        {/* Fine Handmade Paper Texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat opacity-70 mix-blend-multiply pointer-events-none select-none"
          style={{
            backgroundImage: 'url("/images/paper-texture.png")',
            backgroundSize: "520px auto",
          }}
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="relative z-10 max-w-xl mx-auto"
        >
          <p className="font-sans-ui text-[10px] sm:text-[11px] tracking-[0.26em] uppercase text-[#9a7942] font-medium">
            Duas For The Couple
          </p>
          <h2 className="font-serif-body text-3xl sm:text-[42px] font-medium text-[#5e0e24] mt-2 mb-9">
            Send Your Wishes
          </h2>

          <form
            onSubmit={handleSendWishes}
            className="soft-card rounded-2xl p-6 sm:p-9 text-left space-y-5"
          >
            <div>
              <label
                htmlFor="wish-name"
                className="block font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#9a7942] font-semibold mb-2"
              >
                Name
              </label>
              <input
                id="wish-name"
                type="text"
                required
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg bg-[#f3ece1]/85 border border-[#b68d40]/25 px-4 py-2.5 font-serif-body text-lg text-[#3c1822] placeholder:text-[#6c4c55]/50 focus:outline-none focus:border-[#5e0e24]"
              />
            </div>

            <div>
              <label
                htmlFor="wish-message"
                className="block font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#9a7942] font-semibold mb-2"
              >
                Your Dua / Message
              </label>
              <textarea
                id="wish-message"
                rows={4}
                required
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                placeholder="Write a warm dua or blessing for Zahra & Mufaddal..."
                className="w-full rounded-lg bg-[#f3ece1]/85 border border-[#b68d40]/25 px-4 py-3 font-serif-body text-lg text-[#3c1822] placeholder:text-[#6c4c55]/50 focus:outline-none focus:border-[#5e0e24] resize-none"
              />
            </div>

            <div className="pt-1 text-left sm:text-center space-y-2">
              <button
                type="submit"
                className="btn-burgundy cursor-pointer inline-flex items-center justify-center px-9 py-3 rounded-full font-sans-ui text-[11px] tracking-[0.22em] uppercase font-semibold"
              >
                Send Wishes
              </button>
              {wishSent && (
                <p className="font-serif-body italic text-sm text-[#5e0e24]">
                  JazakAllah Khair! Opening WhatsApp to deliver your wishes.
                </p>
              )}
            </div>
          </form>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 7. FULL-BLEED DEEP BURGUNDY FOOTER                        */}
      {/* ========================================================= */}
      <footer className="hero-burgundy-lattice w-full text-[#faf7f2] py-16 sm:py-20 px-5 text-center">
        <div className="max-w-2xl mx-auto space-y-2.5">
          <p className="font-sans-ui text-[10px] tracking-[0.28em] uppercase text-[#d3b270]/85 font-medium">
            Awaiting Your Presence
          </p>
          <p className="font-serif-body text-xl sm:text-2xl text-[#faf7f2]/95">
            With Warm Regards
          </p>
          <p className="font-script text-4xl sm:text-5xl text-[#e2c27f] pt-1">
            {WEDDING.host.family}
          </p>
          <p className="font-serif-body italic text-base sm:text-lg text-[#f3ece1]/85">
            {WEDDING.host.signoff}
          </p>

          <div className="py-2">
            <DiamondDivider light />
          </div>

          <p className="font-serif-body text-base text-[#f3ece1]/85">
            Firm: {WEDDING.host.firms.join("  |  ")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-sans-ui text-xs text-[#e2c27f]/90 pt-1">
            {WEDDING.host.contacts.map((c) => (
              <a
                key={c.display}
                href={`tel:+${c.e164}`}
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Phone className="w-3 h-3" />
                {c.display}
              </a>
            ))}
          </div>

          <p className="font-sans-ui text-[11px] tracking-[0.24em] text-[#f3ece1]/45 pt-6 uppercase">
            {WEDDING.bride.name} &amp; {WEDDING.groom.name} &nbsp;·&nbsp; 12 ·
            01 · 2027
          </p>
        </div>
      </footer>

      {/* Developer Credit Bar */}
      <div
        className="relative w-full bg-[#f3ece1] border-t border-[#b68d40]/30 pt-4 pb-6 px-10 text-center overflow-hidden"
      >
        {/* Fine Handmade Paper Texture matching all cream sections */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat opacity-70 mix-blend-multiply pointer-events-none select-none"
          style={{
            backgroundImage: 'url("/images/paper-texture.png")',
            backgroundSize: "520px auto",
          }}
        />
        <div className="relative z-10 font-sans-ui text-sm sm:text-[14px] text-[#6c4c55] tracking-wide leading-relaxed">
          <a
            href={DEVELOPER_CREDIT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-col min-[500px]:flex-row items-center justify-center gap-0.5 min-[500px]:gap-1.5"
          >
            <span>
              Crafted by{" "}
              <span className="font-semibold text-[#5e0e24] group-hover:text-[#7c1431] transition-colors">
                {DEVELOPER_CREDIT.name}.
              </span>
            </span>
            <span className="font-semibold text-[#5e0e24] underline decoration-[#b68d40]/70 underline-offset-4 group-hover:text-[#7c1431] group-hover:decoration-[#5e0e24] transition-colors">
              Get in touch ↗
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
