"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { useQuote } from "./QuoteProvider";
import { COMPANY, whatsappHref } from "@/lib/company";

const SECTOR_OPTIONS = [
  "Laverie industrielle / délavage",
  "Blanchisserie",
  "Pressing",
  "Teinture / impression textile",
  "Fabrication de détergents",
  "Cosmétique",
  "Autre",
];
const FREQUENCY_OPTIONS = ["Achat ponctuel", "Mensuel", "Trimestriel", "À définir"];
const PACKAGING_OPTIONS = ["", "Bidon 25 kg", "Fût 200 kg", "IBC 1000 L", "Sac 25 kg", "Échantillon"];

const EMPTY = { name: "", company: "", email: "", phone: "", city: "", sector: "", frequency: "", message: "", wantsDatasheet: false, wantsSample: false };

// One form for both the quote request (/devis, with the basket) and the plain
// contact page. The site is static (no backend): the request is written out as
// a message and handed to WhatsApp or the visitor's e-mail app, pre-filled.
export default function LeadForm({ type = "devis" }) {
  const quote = useQuote();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const isQuote = type === "devis";
  const items = isQuote ? quote.items : [];

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  function localErrors() {
    const er = {};
    if (!form.name.trim()) er.name = "Votre nom est obligatoire.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) er.email = "Adresse e-mail invalide.";
    if (!/^[\d\s+().-]{6,30}$/.test(form.phone.trim())) er.phone = "Numéro de téléphone invalide.";
    if (isQuote && !items.length && !form.message.trim()) er.message = "Ajoutez au moins un produit ou décrivez votre besoin.";
    if (!isQuote && !form.message.trim()) er.message = "Votre message est vide.";
    return er;
  }

  function buildMessage() {
    const line = (label, value) => (value ? `${label} : ${value}` : null);
    const parts = [
      isQuote ? "Demande de devis (site ANJELAB)" : "Message (site ANJELAB)",
      "",
      line("Nom", form.name.trim()),
      line("Société", form.company.trim()),
      line("Téléphone", form.phone.trim()),
      line("E-mail", form.email.trim()),
      line("Ville", form.city.trim()),
      line("Activité", form.sector),
      isQuote ? line("Fréquence d'achat", form.frequency) : null,
    ];
    if (items.length) {
      parts.push("", "Produits :");
      for (const i of items) parts.push(`- ${[i.name, i.quantity, i.packaging].filter(Boolean).join(" | ")}`);
    }
    if (form.message.trim()) parts.push("", isQuote ? "Précisions :" : "Message :", form.message.trim());
    if (form.wantsDatasheet || form.wantsSample) parts.push("");
    if (form.wantsDatasheet) parts.push("Je souhaite recevoir les fiches techniques / FDS.");
    if (form.wantsSample) parts.push("Je souhaite un échantillon.");
    return parts.filter((p) => p !== null).join("\n");
  }

  function send(channel) {
    const er = localErrors();
    setErrors(er);
    if (Object.keys(er).length) {
      setStatus({ state: "error", message: "Merci de corriger les champs signalés." });
      return;
    }
    const text = buildMessage();
    if (channel === "whatsapp") {
      window.open(whatsappHref(text), "_blank", "noopener");
    } else {
      const subject = isQuote ? `Demande de devis - ${form.company.trim() || form.name.trim()}` : `Contact - ${form.name.trim()}`;
      window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    }
    setStatus({ state: "opened", message: channel });
  }

  function onSubmit(e) {
    e.preventDefault();
    send("whatsapp");
  }

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={`f-${name}`}>{label}</label>
      <input
        id={`f-${name}`}
        className="input"
        value={form[name]}
        onChange={set(name)}
        aria-invalid={errors[name] ? "true" : undefined}
        aria-describedby={errors[name] ? `e-${name}` : undefined}
        {...props}
      />
      {errors[name] ? (
        <p className="error" id={`e-${name}`}>
          {errors[name]}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className={isQuote ? "quote-layout" : ""}>
      {isQuote ? (
        <div>
          <h2 style={{ fontSize: "1.35rem" }}>
            Produits sélectionnés {quote.ready ? `(${items.length})` : ""}
          </h2>
          {quote.ready && items.length ? (
            <ul className="quote-items">
              {items.map((i) => (
                <li key={i.slug} className="quote-item">
                  <div className="quote-item-head">
                    <Link href={`/produit/${i.slug}/`}>{i.name}</Link>
                    <button type="button" className="icon-btn" aria-label={`Retirer ${i.name}`} onClick={() => quote.remove(i.slug)}>
                      <Icon name="trash" />
                    </button>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor={`q-${i.slug}`}>Quantité estimée</label>
                      <input id={`q-${i.slug}`} className="input" placeholder="ex. 200 kg / mois" maxLength={80} value={i.quantity} onChange={(e) => quote.update(i.slug, { quantity: e.target.value })} />
                    </div>
                    <div className="field">
                      <label htmlFor={`p-${i.slug}`}>Conditionnement</label>
                      <select id={`p-${i.slug}`} className="select" value={i.packaging} onChange={(e) => quote.update(i.slug, { packaging: e.target.value })}>
                        {PACKAGING_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o || "Indifférent"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <p>Votre demande ne contient encore aucun produit.</p>
              <p className="muted">Parcourez le catalogue et cliquez sur « Ajouter au devis », ou décrivez directement votre besoin dans le formulaire.</p>
              <Link href="/produits/" className="btn btn-primary">
                Parcourir le catalogue
              </Link>
            </div>
          )}
        </div>
      ) : null}

      <form className="form card" onSubmit={onSubmit} noValidate>
        <h2 style={{ fontSize: "1.35rem", margin: 0 }}>{isQuote ? "Vos coordonnées" : "Écrivez-nous"}</h2>
        <div className="form-row">
          {field("name", "Nom et prénom *", { autoComplete: "name", maxLength: 120 })}
          {field("company", "Société", { autoComplete: "organization", maxLength: 160 })}
        </div>
        <div className="form-row">
          {field("phone", "Téléphone / WhatsApp *", { type: "tel", autoComplete: "tel", maxLength: 30 })}
          {field("email", "E-mail", { type: "email", autoComplete: "email", maxLength: 160 })}
        </div>
        <div className="form-row">
          {field("city", "Ville", { autoComplete: "address-level2", maxLength: 80 })}
          <div className="field">
            <label htmlFor="f-sector">Votre activité</label>
            <select id="f-sector" className="select" value={form.sector} onChange={set("sector")}>
              <option value="">Choisir…</option>
              {SECTOR_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
        {isQuote ? (
          <div className="field">
            <label htmlFor="f-frequency">Fréquence d&apos;achat</label>
            <select id="f-frequency" className="select" value={form.frequency} onChange={set("frequency")}>
              <option value="">Choisir…</option>
              {FREQUENCY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="f-message">{isQuote ? "Précisions (procédé, matériel, autre produit recherché…)" : "Message *"}</label>
          <textarea
            id="f-message"
            className="textarea"
            maxLength={5000}
            value={form.message}
            onChange={set("message")}
            aria-invalid={errors.message ? "true" : undefined}
          />
          {errors.message ? <p className="error">{errors.message}</p> : null}
        </div>
        {isQuote ? (
          <div style={{ display: "grid", gap: 10 }}>
            <label className="check">
              <input type="checkbox" checked={form.wantsDatasheet} onChange={set("wantsDatasheet")} /> Je souhaite recevoir les fiches techniques / FDS
            </label>
            <label className="check">
              <input type="checkbox" checked={form.wantsSample} onChange={set("wantsSample")} /> Je souhaite un échantillon
            </label>
          </div>
        ) : null}
        {status.state === "error" ? (
          <p className="alert alert-error" role="alert">
            {status.message}
          </p>
        ) : null}
        {status.state === "opened" ? (
          <p className="alert alert-success" role="status">
            {status.message === "whatsapp" ? "WhatsApp" : "Votre messagerie"} s&apos;est ouvert avec votre demande
            pré-remplie : il ne vous reste qu&apos;à appuyer sur « Envoyer ».
          </p>
        ) : null}
        <button type="submit" className="btn btn-whatsapp btn-block">
          <Icon name="whatsapp" /> {isQuote ? "Envoyer ma demande par WhatsApp" : "Envoyer par WhatsApp"}
        </button>
        <button type="button" className="btn btn-outline btn-block" onClick={() => send("email")}>
          <Icon name="mail" /> Envoyer par e-mail
        </button>
        <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
          Vos données servent uniquement à répondre à votre demande et ne sont jamais cédées à des tiers.
        </p>
      </form>
    </div>
  );
}
