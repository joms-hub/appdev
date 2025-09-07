"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="m-7">
      <div className="flex items-center justify-between">
        {/* Logo and website name */}
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Image
            src="/favicon.ico"
            alt="DevMate Logo"
            width={25}
            height={25}
            className="ml-10 rounded-full"
          />
          <span className="text-3xl">DevMate</span>
        </Link>

        {/* Menu icon for narrower screens. */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {/* Actual SVG that displays the hamburger icon. */}
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Main navigation links */}
        <div className="hidden items-center gap-10 *:font-bold md:flex">
          {["home", "features", "how-it-works", "tracks", "FAQ"].map(
            (text, i) => (
              <Link
                key={i}
                href={text === "home" ? "/" : `/#${text}`}
                className="px-2 py-1 capitalize transition hover:rounded-md hover:bg-white hover:text-black"
              >
                {text.replace("-", " ")}
              </Link>
            ),
          )}

          {/* Login button */}
          <Link
            href="/login"
            className="block rounded-md border-2 px-5 py-1 capitalize transition hover:bg-white hover:text-black"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Navigation bar, but for narrow screens */}
      <div
        className={`mt-4 flex transform flex-col gap-4 transition-all duration-300 ease-in-out *:font-bold md:hidden ${
          isOpen
            ? "max-h-screen translate-y-0 opacity-100"
            : "max-h-0 -translate-y-5 overflow-hidden opacity-0"
        }`}
      >
        {/* Main links */}
        {["home", "features", "how-it-works", "tracks", "FAQ"].map(
          (text, i) => (
            <Link
              key={i}
              href={`#${text === "home" ? "" : text}`}
              className="px-2 py-1 capitalize transition hover:rounded-md hover:bg-white hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              {text.replace("-", " ")}
            </Link>
          ),
        )}

        {/* Login button */}
        <Link
          href="/login"
          className="block rounded-md border-2 px-5 py-1 capitalize transition hover:bg-white hover:text-black"
          onClick={() => setIsOpen(false)}
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
