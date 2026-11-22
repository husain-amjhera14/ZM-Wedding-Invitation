"use client";

import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/invitation";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function computeTimeLeft(targetMs: number): TimeLeft {
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isPast: false };
}

export default function Countdown() {
  const targetMs = new Date(WEDDING.event.isoStart).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(computeTimeLeft(targetMs));
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft(targetMs));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetMs]);

  if (timeLeft?.isPast) {
    return (
      <p className="font-serif-body text-xl sm:text-2xl text-[#5e0e24] italic">
        The blessed celebration has arrived!
      </p>
    );
  }

  const units = [
    { label: "DAYS", value: timeLeft ? String(timeLeft.days).padStart(2, "0") : "--" },
    { label: "HOURS", value: timeLeft ? String(timeLeft.hours).padStart(2, "0") : "--" },
    { label: "MINUTES", value: timeLeft ? String(timeLeft.minutes).padStart(2, "0") : "--" },
    { label: "SECONDS", value: timeLeft ? String(timeLeft.seconds).padStart(2, "0") : "--" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-[440px] mx-auto">
      {units.map((u) => (
        <div
          key={u.label}
          className="soft-card rounded-xl py-4 sm:py-5 px-2 flex flex-col items-center justify-center"
        >
          <span className="font-serif-body text-3xl sm:text-[38px] font-medium text-[#5e0e24] tabular-nums leading-none">
            {u.value}
          </span>
          <span className="font-sans-ui text-[9px] sm:text-[10px] tracking-[0.2em] text-[#9a7942] mt-2 font-medium">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
