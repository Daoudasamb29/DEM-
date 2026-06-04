import emailjs from '@emailjs/browser';

// Configuration keys for EmailJS.
// You can either:
// 1. Define these in your environment variables (using the VITE_ prefix for client-side)
// 2. Or replace the placeholders directly in this code.
export const EMAILJS_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "REMPLACER_PAR_MA_PUBLIC_KEY",
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "REMPLACER_PAR_SERVICE_ID",
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "REMPLACER_PAR_TEMPLATE_ID",
  TO_EMAIL: import.meta.env.VITE_EMAILJS_TO_EMAIL || "REMPLACER_PAR_VOTRE_EMAIL"
};

export interface EmailParams {
  reservation_code: string;
  trajet: string;
  date: string;
  heure: string;
  pickup: string;
  passagers: number | string;
  prix_total: string;
  to_email: string;
  client_nom?: string;
  client_telephone?: string;
  jstelephone?: string;
  telephone?: string;
  phone?: string;
  client_phone?: string;
  client_tel?: string;
  telephone_client?: string;
  phone_client?: string;
  tel?: string;
}

/**
 * Sends a reservation email via EmailJS browser SDK.
 * In case of error or unconfigured state: throws an error (handled gracefully by showing a discrete banner)
 */
export async function sendReservationEmail(params: Omit<EmailParams, 'to_email'>): Promise<void> {
  console.log("Initiating backend email submission...", params);

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errorMessage = errorJson?.error || await response.text() || `Erreur serveur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log("Email sent successfully via secure server-side proxy!");
  } catch (err: any) {
    console.error("Failed to route email via proxy, checking client-side sdk fallback:", err);

    const { PUBLIC_KEY, SERVICE_ID, TEMPLATE_ID, TO_EMAIL } = EMAILJS_CONFIG;

    // Check if client-side fallback is configured in code
    if (
      !PUBLIC_KEY || PUBLIC_KEY === "REMPLACER_PAR_MA_PUBLIC_KEY" ||
      !SERVICE_ID || SERVICE_ID === "REMPLACER_PAR_SERVICE_ID" ||
      !TEMPLATE_ID || TEMPLATE_ID === "REMPLACER_PAR_TEMPLATE_ID"
    ) {
      console.warn("No client-side fallback configured either.");
      throw err;
    }

    // Attempt client-side direct EmailJS as secondary safety mechanism
    try {
      emailjs.init(PUBLIC_KEY);
      const phoneValue = params.jstelephone || params.client_telephone || params.phone || params.telephone || "Non renseigné";
      const payload: EmailParams = {
        ...params,
        telephone: phoneValue,
        phone: phoneValue,
        client_telephone: phoneValue,
        jstelephone: phoneValue,
        client_phone: phoneValue,
        client_tel: phoneValue,
        telephone_client: phoneValue,
        phone_client: phoneValue,
        tel: phoneValue,
        to_email: TO_EMAIL
      };
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, payload as any);
      console.log("Client-side direct EmailJS fallback succeeded!");
    } catch (fallbackErr: any) {
      console.error("Both backend proxy and client-side fallback failed:", fallbackErr);
      throw new Error("Impossible d'envoyer l'e-mail: " + (err?.message || "Erreur service"));
    }
  }
}
