import React, { useEffect, useState, useRef } from "react";
import * as htmlToImage from "html-to-image";
import batman from "../assets/batman.jpg";
import superman from "../assets/superman.jpg";

// --- GitHub Login Button ---
function GitHubLoginButton() {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 rounded-2xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition"
    >
      Login with GitHub
    </button>
  );
}

// --- Theme Button ---
function ThemeButton({ label, onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-white text-black shadow-lg"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

const handleLogout = async () => {
  await fetch("http://localhost:3000/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  window.location.reload();
};

// --- Stat Display ---
function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-xl font-semibold mt-1 text-white truncate">{value}</p>
    </div>
  );
}

// --- Main Card Component ---
function Card() {
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState("classic");
  const cardRef = useRef(null);

  // Fetch user wrapped data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/wrapped", {
          credentials: "include",
        });

        if (res.status === 401) {
          // User not logged in
          setData(null);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching wrapped data:", err);
      }
    };

    fetchData();
  }, []);

  // Download card as PNG
  const handleDownload = async () => {
    if (!cardRef.current) return;

    // Wait for all images to load
    const images = cardRef.current.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            else img.onload = () => resolve();
          })
      )
    );

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `sde-wrapped-${theme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  };

  // If not logged in, show login
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <h2 className="text-white text-2xl font-bold mb-4">
          Generate your SDE Wrapped
        </h2>
        <GitHubLoginButton />
      </div>
    );
  }

  // Background options
  const backgrounds = {
    classic: "#111111",
    batman,
    superman,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#0b0b0b]">
      {/* Theme Switcher */}
      <div className="mb-10 flex flex-col items-center">
        <h2 className="text-white text-2xl font-bold mb-2 tracking-tight">
          Personalize your card
        </h2>
        <p className="text-gray-500 text-sm mb-6 font-medium">
          Choose a visual style for your 2025 summary
        </p>

        <div className="flex p-1.5 bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-2xl">
          <ThemeButton
            label="Classic"
            isActive={theme === "classic"}
            onClick={() => setTheme("classic")}
          />
          <ThemeButton
            label="Batman"
            isActive={theme === "batman"}
            onClick={() => setTheme("batman")}
          />
          <ThemeButton
            label="Superman"
            isActive={theme === "superman"}
            onClick={() => setTheme("superman")}
          />
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="absolute top-25 right-60 text-sm text-gray-400 hover:text-white border-2 p-1.5 rounded-2xl"
      >
        Logout
      </button>

      {/* Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-105 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        style={
          theme === "classic"
            ? { backgroundColor: backgrounds.classic }
            : {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${backgrounds[theme]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
        }
      >
        <div className="relative z-10 p-8 text-white">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">
            SDE WRAPPED · 2025
          </p>

          <h1 className="mt-4 text-[40px] font-black leading-[1.05]">
            This was
            <br />
            your year
            <br />
            in code.
          </h1>

          <p className="mt-4 text-lg text-gray-300">@{data.username}</p>

          <div className="mt-14">
            <p className="text-sm text-gray-400">Repositories shipped</p>
            <p className="text-[96px] font-black mt-2">{data.totalRepos}</p>
          </div>

          <div className="h-px my-10 bg-gray-700" />

          <div className="space-y-6">
            <Stat label="Most used language" value={data.mostUsedLanguage} />
            <Stat label="Top repository" value={data.topRepo} />
            <Stat label="Stars earned" value={data.totalStars} />
            <Stat label="Forks" value={data.totalForks} />
          </div>

          <div className="mt-12 flex justify-between items-end text-xs text-gray-500">
            <p>sdewrapped.dev</p>
            <p>#{theme}</p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="mt-10 px-10 py-4 rounded-2xl text-black bg-white font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-xl flex items-center gap-2"
      >
        <span>Download Card</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      </button>
      
    </div>
  );
}

export default Card;
