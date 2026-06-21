"use client";
import { useState } from "react";
import { submitContactForm } from "@/lib/api";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitContactForm({ name, email, message });
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-green-50 rounded-2xl p-8 border border-green-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto">✅</div>
        <h3 className="font-display font-black text-lg text-green-800">Message Sent!</h3>
        <p className="text-green-700/70 text-sm">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
        <button
          onClick={() => setStatus("idle")}
          className="text-brand-gold-600 font-medium text-sm hover:underline mt-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-brand-ivory-200 shadow-sm space-y-4">
      <h2 className="font-display font-black text-xl text-brand-green-900">Send a Message</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your Name"
        required
        className="w-full border border-brand-ivory-200 rounded-xl px-4 py-3 text-brand-green-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address"
        required
        className="w-full border border-brand-ivory-200 rounded-xl px-4 py-3 text-brand-green-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your Message"
        rows={4}
        required
        className="w-full border border-brand-ivory-200 rounded-xl px-4 py-3 text-brand-green-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 resize-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-4 bg-brand-gold-500 text-brand-green-950 font-semibold rounded-xl hover:bg-brand-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
      {status === "error" && (
        <p className="text-red-500 text-sm text-center">Failed to send. Please try again or email us directly.</p>
      )}
    </form>
  );
}
