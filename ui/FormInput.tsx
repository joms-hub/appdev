"use client";
import { useRef } from "react";

export default function FormInput({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  const inputRef: React.RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement>(null);
  return (
    <div
      className="cursor-text rounded-md border px-5 py-3"
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      <label htmlFor={name} className="cursor-text opacity-60">
        {label}
      </label>
      <br />
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        className="w-full focus:outline-none"
      />
    </div>
  );
}
