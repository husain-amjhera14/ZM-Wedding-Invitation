"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Users,
  Link2,
  ListChecks,
  Globe,
  Plus,
} from "lucide-react";
import {
  WEDDING,
  buildInvitePath,
  buildShareWhatsAppMessage,
  formatSlugToName,
  slugifyPart,
} from "@/lib/invitation";

interface Props {
  initialOrigin?: string;
}

export default function InviteLinkGenerator({ initialOrigin = "" }: Props) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [origin, setOrigin] = useState(initialOrigin);

  const [guestName, setGuestName] = useState("");
  const [invitees, setInvitees] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const guestInputRef = useRef<HTMLInputElement | null>(null);

  const [bulkInput, setBulkInput] = useState(
    "Husain Amjhera\nMr. Abbas Bhai & Family, 4\nDr. Juzer Presswala, 2"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const normalizedBaseUrl = origin.trim().replace(/\/+$/, "");

  const singlePath = useMemo(
    () => buildInvitePath(guestName, invitees),
    [guestName, invitees]
  );

  const singleFullUrl = useMemo(
    () => `${normalizedBaseUrl}${singlePath}`,
    [normalizedBaseUrl, singlePath]
  );

  const previewDisplayName = useMemo(() => {
    const slug = slugifyPart(guestName);
    return slug ? formatSlugToName(slug) : "Dear Family & Friends";
  }, [guestName]);

  const singleWhatsAppMessage = buildShareWhatsAppMessage(
    guestName.trim() ? previewDisplayName : "",
    singleFullUrl,
    invitees.trim() || undefined
  );

  const bulkItems = useMemo(() => {
    return bulkInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const parts = line.split(",");
        const rawName = parts[0]?.trim() ?? "";
        const rawInv = parts[1]?.trim() ?? "";
        const path = buildInvitePath(rawName, rawInv || undefined);
        const fullUrl = `${normalizedBaseUrl}${path}`;
        const formattedName = formatSlugToName(slugifyPart(rawName));
        const waMsg = buildShareWhatsAppMessage(
          formattedName,
          fullUrl,
          rawInv || undefined
        );
        return {
          id: `${index}-${path}`,
          name: formattedName || rawName,
          invitees: rawInv,
          path,
          fullUrl,
          waUrl: `https://wa.me/?text=${encodeURIComponent(waMsg)}`,
        };
      });
  }, [bulkInput, normalizedBaseUrl]);

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const focusGuestInputAtEnd = (nextValue: string) => {
    const input = guestInputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      const len = nextValue.length;
      input.setSelectionRange(len, len);
    });
  };

  const applyNamePreset = (label: string, position: "prefix" | "suffix") => {
    if (label.toLowerCase().includes("family")) {
      setInvitees("All");
    }
    const trimmed = guestName.trim();
    let nextValue = guestName;

    if (position === "prefix") {
      // Extract any existing leading Janab / Shk. tokens so order is always "Janab Shk."
      let rest = trimmed;
      let hasJanab = false;
      let hasShk = false;

      let matched = true;
      while (matched) {
        matched = false;
        if (/^janab\b\.?\s*/i.test(rest)) {
          hasJanab = true;
          rest = rest.replace(/^janab\b\.?\s*/i, "");
          matched = true;
        } else if (/^shk\b\.?\s*/i.test(rest)) {
          hasShk = true;
          rest = rest.replace(/^shk\b\.?\s*/i, "");
          matched = true;
        }
      }

      if (label.toLowerCase() === "janab") hasJanab = true;
      if (label.toLowerCase().startsWith("shk")) hasShk = true;

      const orderedPrefixes = [
        hasJanab ? "Janab" : "",
        hasShk ? "Shk." : "",
      ]
        .filter(Boolean)
        .join(" ");

      nextValue = rest ? `${orderedPrefixes} ${rest}` : `${orderedPrefixes} `;
    } else if (!trimmed) {
      nextValue = label;
    } else {
      nextValue = trimmed.toLowerCase().endsWith(label.toLowerCase())
        ? trimmed
        : `${trimmed} ${label}`;
    }

    setGuestName(nextValue);
    focusGuestInputAtEnd(nextValue);
  };

  return (
    <div className="min-h-screen bg-[#f3ece1]">
      {/* Top Burgundy Banner */}
      <header className="hero-burgundy-lattice text-center text-[#faf7f2] py-12 px-5">
        <div className="max-w-2xl mx-auto space-y-2">
          <img
            src="/images/zm-monogram.svg"
            alt="ZM Monogram"
            className="w-16 h-auto mx-auto opacity-90"
          />
          <p className="font-sans-ui text-[10px] uppercase tracking-[0.26em] text-[#d3b270] font-semibold">
            {WEDDING.bride.name} &amp; {WEDDING.groom.name} · Wedding Invitation
          </p>
          <h1 className="font-serif-body text-3xl sm:text-4xl font-medium">
            Create Personalized Invitation
          </h1>
          <p className="font-sans-ui text-xs sm:text-sm text-[#f3ece1]/85 max-w-md mx-auto">
            Enter a guest&apos;s name to generate a personalized invitation link
            and ready-to-share WhatsApp message.
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Mode Switcher + Domain Setting */}
        <div className="soft-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans-ui text-xs font-semibold transition-colors ${
                mode === "single"
                  ? "bg-[#5e0e24] text-[#faf7f2]"
                  : "text-[#5e0e24] hover:bg-[#5e0e24]/10"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Single Guest
            </button>
            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={`cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans-ui text-xs font-semibold transition-colors ${
                mode === "bulk"
                  ? "bg-[#5e0e24] text-[#faf7f2]"
                  : "text-[#5e0e24] hover:bg-[#5e0e24]/10"
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              Bulk Guest List
            </button>
          </div>

          {normalizedBaseUrl && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans-ui text-xs text-[#9a7942] bg-[#f3ece1]/70">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-[260px]">
                {normalizedBaseUrl.replace(/^https?:\/\//, "")}
              </span>
            </span>
          )}
        </div>

        {mode === "single" ? (
          <div className="gold-top-card rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Guest Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="guest-name"
                className="block font-sans-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a7942]"
              >
                Guest Name
              </label>
              <input
                ref={guestInputRef}
                id="guest-name"
                type="text"
                autoFocus
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Husain Amjhera or Mr. Abbas Bhai"
                className="w-full rounded-xl border border-[#b68d40]/35 bg-[#f3ece1]/65 px-4 py-3.5 font-serif-body text-xl text-[#3c1822] placeholder:text-[#6c4c55]/50 focus:outline-none focus:border-[#5e0e24]"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(
                  [
                    { label: "Janab", position: "prefix" },
                    { label: "Shk.", position: "prefix" },
                    { label: "Bhai", position: "suffix" },
                    { label: "Ben", position: "suffix" },
                    { label: "Saheb", position: "suffix" },
                    { label: "& Family", position: "suffix" },
                  ] as const
                ).map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => applyNamePreset(chip.label, chip.position)}
                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#b68d40]/35 bg-[#faf7f2] hover:bg-[#5e0e24] hover:text-[#faf7f2] text-[#5e0e24] font-sans-ui text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {chip.label}
                  </button>
                ))}
                {guestName && (
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setGuestName("");
                      setInvitees("");
                      focusGuestInputAtEnd("");
                    }}
                    className="cursor-pointer px-2.5 py-1 rounded-full text-[#9a7942] hover:text-[#5e0e24] font-sans-ui text-xs font-medium ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Optional Invitees Count */}
            <div className="space-y-2">
              <label
                htmlFor="invitees-count"
                className="flex items-center gap-1.5 font-sans-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a7942]"
              >
                <Users className="w-3.5 h-3.5" />
                Invitees{" "}
                <span className="font-normal normal-case text-[#6c4c55]/80">
                  (Optional)
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="invitees-count"
                  type="text"
                  value={invitees}
                  onChange={(e) => setInvitees(e.target.value)}
                  placeholder="Leave blank or enter 2, 4, All..."
                  className="flex-1 min-w-[180px] rounded-xl border border-[#b68d40]/35 bg-[#f3ece1]/65 px-4 py-2.5 font-sans-ui text-sm text-[#3c1822] placeholder:text-[#6c4c55]/50 focus:outline-none focus:border-[#5e0e24]"
                />
                {["1", "2", "4", "All"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setInvitees((curr) => (curr === preset ? "" : preset))
                    }
                    className={`cursor-pointer px-3.5 py-2 rounded-xl border font-sans-ui text-xs font-semibold transition-colors ${
                      invitees === preset
                        ? "bg-[#5e0e24] text-[#faf7f2] border-[#5e0e24]"
                        : "bg-[#faf7f2] text-[#5e0e24] border-[#b68d40]/35 hover:bg-[#5e0e24]/10"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Greeting Preview */}
            <div className="rounded-xl bg-[#f3ece1]/80 border border-[#b68d40]/30 p-4 text-center space-y-1">
              <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-[#9a7942] font-semibold flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Hero Greeting Preview
              </p>
              <p className="font-serif-body text-2xl font-semibold text-[#5e0e24]">
                {previewDisplayName}
                {invitees.trim() && (
                  <span className="font-sans-ui text-xs font-medium text-[#9a7942] ml-2">
                    ({invitees.trim()})
                  </span>
                )}
              </p>
            </div>

            {/* Generated URL */}
            <div className="space-y-3">
              <p className="font-sans-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a7942]">
                Personalized Invite URL
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-[#5e0e24]/25 bg-[#faf7f2] p-2 pl-4">
                <code className="flex-1 font-sans-ui text-sm text-[#3c1822] font-semibold break-all">
                  {singleFullUrl}
                </code>
                <button
                  type="button"
                  onClick={() => copyText(singleFullUrl, "single-url")}
                  className="btn-burgundy cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-sans-ui text-xs font-semibold"
                >
                  {copiedId === "single-url" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    singleWhatsAppMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#1f7a4c] hover:bg-[#19653e] text-white font-sans-ui text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() =>
                    copyText(singleWhatsAppMessage, "single-wa-msg")
                  }
                  className="btn-outline-burgundy cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-sans-ui text-xs font-semibold"
                >
                  {copiedId === "single-wa-msg" ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      Copied Text
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Message
                    </>
                  )}
                </button>

                <a
                  href={singlePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#f3ece1] hover:bg-[#e7dccb] border border-[#b68d40]/40 text-[#5e0e24] font-sans-ui text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview Invite
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="gold-top-card rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="bulk-list"
                className="block font-sans-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a7942]"
              >
                Guest Names (one per line — optionally add <code>, 4</code> for
                invitees)
              </label>
              <textarea
                id="bulk-list"
                rows={5}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={"Husain Amjhera\nMr. Abbas Bhai & Family, 4"}
                className="w-full rounded-xl border border-[#b68d40]/35 bg-[#f3ece1]/65 px-4 py-3 font-sans-ui text-sm text-[#3c1822] focus:outline-none focus:border-[#5e0e24]"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="font-sans-ui text-xs font-semibold text-[#5e0e24]">
                {bulkItems.length} Invitation Links Ready
              </p>
              {bulkItems.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      bulkItems
                        .map((item) => `${item.name}: ${item.fullUrl}`)
                        .join("\n"),
                      "bulk-all"
                    )
                  }
                  className="btn-burgundy cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans-ui text-xs font-semibold"
                >
                  {copiedId === "bulk-all" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      All Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy All Links
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {bulkItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-[#b68d40]/25 bg-[#faf7f2] p-3.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-serif-body text-lg font-semibold text-[#5e0e24] truncate">
                        {item.name}
                      </p>
                      {item.invitees && (
                        <span className="font-sans-ui text-[10px] bg-[#5e0e24]/10 text-[#5e0e24] px-2 py-0.5 rounded-full font-semibold">
                          Invitees: {item.invitees}
                        </span>
                      )}
                    </div>
                    <p className="font-sans-ui text-xs text-[#6c4c55] truncate">
                      {item.fullUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyText(item.fullUrl, item.id)}
                      className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#5e0e24]/30 text-[#5e0e24] hover:bg-[#5e0e24]/10 font-sans-ui text-xs font-semibold"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedId === item.id ? "Copied" : "Copy"}
                    </button>
                    <a
                      href={item.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1f7a4c] hover:bg-[#19653e] text-white font-sans-ui text-xs font-semibold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center p-1.5 rounded-full border border-[#b68d40]/40 text-[#5e0e24] hover:bg-[#f3ece1]"
                      title="Preview invite"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pb-6">
          <Link
            href="/"
            className="font-sans-ui text-xs text-[#5e0e24] hover:underline font-medium"
          >
            ← View Wedding Invitation
          </Link>
        </div>
      </main>
    </div>
  );
}
