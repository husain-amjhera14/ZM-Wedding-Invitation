"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ParsedInvite, WEDDING } from "@/lib/invitation";

interface Props {
  invite: ParsedInvite;
  onStartOpen?: () => void;
}

type CurtainStage = "closed" | "hiding-card" | "opening-doors" | "open";

// Toggle entrance animation for the center card: false = immediate, true = fade in
const ANIMATE_CARD_ENTRANCE = false;

export default function OpeningCurtain({ invite, onStartOpen }: Props) {
  const [stage, setStage] = useState<CurtainStage>("closed");

  useEffect(() => {
    if (stage === "open") {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [stage]);

  if (stage === "open") return null;

  const handleOpen = () => {
    if (stage !== "closed") return;
    // Trigger background music directly inside the click gesture
    onStartOpen?.();
    // Step 1: Smoothly fade out the center arch card
    setStage("hiding-card");
    // Step 2: Glide left & right doors apart right as the card dissolves (no awkward pause)
    window.setTimeout(() => {
      setStage("opening-doors");
    }, 280);
  };

  const doorsOpen = stage === "opening-doors";
  const cardHidden = stage === "hiding-card" || stage === "opening-doors";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wedding Invitation Cover"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      {/* Left Sliding Door */}
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: doorsOpen ? "-100%" : "0%" }}
        transition={{
          duration: 1.15,
          ease: [0.65, 0, 0.35, 1],
        }}
        onAnimationComplete={() => {
          if (doorsOpen) setStage("open");
        }}
        className="curtain-burgundy-pattern will-change-transform transform-gpu absolute top-0 left-0 w-1/2 h-full border-r border-[#d3b270]/70 shadow-[12px_0_48px_rgba(20,2,8,0.5)]"
      />

      {/* Right Sliding Door */}
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: doorsOpen ? "100%" : "0%" }}
        transition={{
          duration: 1.15,
          ease: [0.65, 0, 0.35, 1],
        }}
        className="curtain-burgundy-pattern will-change-transform transform-gpu absolute top-0 right-0 w-1/2 h-full border-l border-[#d3b270]/70 shadow-[-12px_0_48px_rgba(20,2,8,0.5)]"
      />

      {/* Center Arched Invitation Box */}
      <motion.div
        initial={ANIMATE_CARD_ENTRANCE ? { opacity: 0, scale: 0.96, y: 12 } : false}
        animate={
          cardHidden
            ? { opacity: 0, scale: 0.94, y: -10 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={{
          duration: cardHidden ? 0.42 : 0.65,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ pointerEvents: cardHidden ? "none" : "auto" }}
        className="arch-card will-change-transform transform-gpu relative z-10 w-[88vw] max-w-[360px] sm:max-w-[390px] px-7 sm:px-10 pt-12 sm:pt-14 pb-9 sm:pb-11 text-center flex flex-col items-center"
      >
        {/* Bismillah Calligraphy */}
        <img
          src="/images/bismillah-header.svg"
          alt="Bismillahir Rahmanir Raheem — Alhamdulillah Shukran Lillah"
          className="h-16 sm:h-18 w-auto opacity-95 mb-4"
        />

        {/* Cordially Inviting + Guest Name */}
        <p className="font-sans-ui text-[10px] tracking-[0.28em] uppercase text-[#9a7942] font-semibold">
          Cordially Inviting
        </p>

        <p className="font-serif-body text-2xl sm:text-[28px] font-semibold tracking-wide text-[#5e0e24] leading-snug mt-1.5 break-words max-w-full">
          {invite.displayName}
        </p>

        {invite.invitees && (
          <p className="font-sans-ui text-[11px] tracking-[0.18em] uppercase text-[#9a7942] font-semibold mt-1">
            Invitees ({invite.invitees})
          </p>
        )}

        {/* Small Gold Diamond Ornament */}
        <span className="w-2 h-2 rotate-45 bg-[#c59d52] my-4 block" />

        {/* Couple Names */}
        <h2 className="font-script text-4xl sm:text-[48px] text-[#5e0e24] leading-[1.32]">
          {WEDDING.bride.name} &amp;
          <span className="block mt-1">{WEDDING.groom.name}</span>
        </h2>

        {/* Open Invitation CTA */}
        <button
          type="button"
          onClick={handleOpen}
          className="btn-burgundy cursor-pointer mt-7 px-8 py-3 rounded-full font-sans-ui text-[11px] tracking-[0.22em] uppercase font-semibold"
        >
          Open Invitation
        </button>
      </motion.div>
    </div>
  );
}
