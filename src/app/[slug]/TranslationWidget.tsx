"use client";

import { useState, useEffect, useRef } from "react";

const LANG_LABELS: Record<string, { label: string; flag: string }> = {
  "pt": { label: "Português", flag: "🇧🇷" },
  "en": { label: "English", flag: "🇺🇸" },
  "es": { label: "Español", flag: "🇪🇸" },
  "fr": { label: "Français", flag: "🇫🇷" },
  "it": { label: "Italiano", flag: "🇮🇹" },
  "de": { label: "Deutsch", flag: "🇩🇪" },
  "ja": { label: "日本語", flag: "🇯🇵" },
  "zh-CN": { label: "中文", flag: "🇨🇳" },
  "ar": { label: "العربية", flag: "🇸🇦" },
};

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (opts: object, el: string) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export function TranslationWidget({ languages }: { languages: string[] }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => {
    if (typeof document === "undefined") return "pt";
    const match = document.cookie.match(/googtrans=\/pt\/([^;]+)/);
    return match ? match[1] : "pt";
  });
  const [_gtReady, setGtReady] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Load Google Translate script once
  useEffect(() => {
    if (document.getElementById("gt-script")) { setGtReady(true); return; }
    window.googleTranslateElementInit = () => {
      new window.google!.translate!.TranslateElement(
        { pageLanguage: "pt", autoDisplay: false },
        "google_translate_element"
      );
      setGtReady(true);
    };
    const script = document.createElement("script");
    script.id = "gt-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function selectLanguage(code: string) {
    setCurrent(code);
    setOpen(false);

    if (code === "pt") {
      // Remove translation cookie and reload
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      window.location.reload();
      return;
    }

    // Set the googtrans cookie and reload — most reliable method
    const cookieVal = `/pt/${code}`;
    document.cookie = `googtrans=${cookieVal}; path=/`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`;
    window.location.reload();
  }

  const allLangs = [{ code: "pt", ...LANG_LABELS["pt"] }, ...languages.map(c => ({ code: c, ...(LANG_LABELS[c] ?? { label: c, flag: "🌐" }) }))];
  const currentLang = allLangs.find(l => l.code === current) ?? allLangs[0];

  return (
    <>
      {/* Hidden Google Translate container */}
      <div id="google_translate_element" className="hidden" />

      <div ref={dropRef} className="fixed bottom-6 right-6 z-50">
        {open && (
          <div className="mb-2 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden min-w-[170px]">
            {allLangs.map(lang => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={["w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-neutral-50", lang.code === current ? "font-semibold text-sage" : "text-neutral-700"].join(" ")}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === current && (
                  <svg className="ml-auto" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:shadow-xl transition-all notranslate"
        >
          <span className="text-base">{currentLang.flag}</span>
          <span>{currentLang.label}</span>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className={open ? "rotate-180 transition-transform" : "transition-transform"}>
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </>
  );
}
