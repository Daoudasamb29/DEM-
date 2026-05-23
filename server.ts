import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support reading JSON bodies
  app.use(express.json());

  // Static logo routes for PWA offline installation and assets
  app.get("/logo.png", (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/assets/images/logo.png"));
  });
  app.get("/assets/images/logo.png", (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/assets/images/logo.png"));
  });

  /**
   * Initialize Supabase client
   * Supports both server environment variables and dynamic client-passed override headers.
   */
  function getSupabaseClient(req?: express.Request) {
    let url = (req?.headers['x-supabase-url'] as string) || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    let key = (req?.headers['x-supabase-key'] as string) || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    url = url.trim();
    key = key.trim();

    // Check for empty or mock credentials
    if (!url || !key || url.includes('votre-projet') || key.includes('votre_cle')) {
      return null;
    }

    return createClient(url, key);
  }

  // API to verify backend configuration status
  app.get("/api/supabase/status", (req, res) => {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    const isServerConfigured = url && key && !url.includes('votre-projet') && !key.includes('votre_cle');
    res.json({ configured: !!isServerConfigured });
  });

  // API to test specific credentials
  app.post("/api/supabase/test", async (req, res) => {
    const { url, key } = req.body;
    if (!url || !key) {
      return res.status(400).json({ success: false, message: "L'URL et la clé anonyme sont requises." });
    }

    try {
      const client = createClient(url, key);
      const { data, error } = await client.from('bookings').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('404')) {
          return res.json({
            success: true,
            message: "Connecté à Supabase, mais la table 'bookings' est manquante. Utilisez le schéma SQL pour la créer."
          });
        }
        return res.json({ success: false, message: `Erreur Supabase: ${error.message}` });
      }
      return res.json({ success: true, message: "Connexion réussie ! Vos données sont prêtes à être synchronisées." });
    } catch (err: any) {
      return res.json({ success: false, message: err?.message || "Erreur de connexion." });
    }
  });

  // API to fetch all bookings from Supabase
  app.get("/api/bookings", async (req, res) => {
    const client = getSupabaseClient(req);
    if (!client) {
      return res.status(400).json({ error: "Client Supabase non configuré. Veuillez renseigner l'URL et la clé anonyme." });
    }
    try {
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json(data || []);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API to create a booking on Supabase
  app.post("/api/bookings", async (req, res) => {
    const client = getSupabaseClient(req);
    if (!client) {
      return res.status(400).json({ error: "Client Supabase non configuré." });
    }
    try {
      const { error } = await client.from('bookings').insert([req.body]);
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API to delete a booking from Supabase
  app.delete("/api/bookings/:id", async (req, res) => {
    const client = getSupabaseClient(req);
    if (!client) {
      return res.status(400).json({ error: "Client Supabase non configuré." });
    }
    try {
      const { id } = req.params;
      const { error } = await client.from('bookings').delete().eq('id', id);
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Connect Vite developer middleware in non-production mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static dist assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
