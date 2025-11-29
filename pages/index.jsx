import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://nlp-backend-production-45a0.up.railway.app";

// Crée / récupère un userId anonyme et configure axios pour l'envoyer en header
async function ensureUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  let stored = window.localStorage.getItem("userId");

  if (!stored) {
    const res = await axios.post(`${API_BASE}/api/auth/anonymous`);
    stored = res.data.userId;
    window.localStorage.setItem("userId", stored);
  }

  // On configure axios pour toujours envoyer le userId
  axios.defaults.headers.common["x-user-id"] = stored;

  return stored;
}

export default function Home() {
  const [prompt, setPrompt] = useState("Tu es un expert en création de mini-SaaS viraux, ultra rentables, optimisés pour la pub et la scalabilité.\n\nTâche:\n- À partir de la tendance suivante, conçois un mini-SaaS complet.\n\nTendance:\n\"Nom du mini-SaaS : NotionFlow\nPromesse principale : Gérez leads, factures et contenu en un seul système Notion boosté à l’IA, prêt à l’emploi.\nPain point principal : Perte de temps et confusion dans la gestion manuelle des leads, factures et contenu sans outil intégré accessible aux freelances.\nFonctionnalités clés :\n- Templates Notion clés en main pour gestion leads, factures et planning contenu\n- Assistant IA intégré pour génération automatique de relances, devis, contenus et résumés\n- Dashboard Notion personnalisé avec suivi en temps réel et alertes\nUtilisation de l'IA : L’IA rédige automatiquement emails de relance, propositions commerciales, planifie des idées de contenu adaptées au profil client, et analyse les données de gestion pour recommandations proactives dans Notion.\nModèle de monétisation : Abonnement mensuel pour accès aux templates + abonnement à crédits IA pour génération automatique, avec upsells type modèles avancés, coaching productivité Notion et intégrations API.\nStratégie de viralité : Création de reels et shorts démonstratifs \"Avant/Après\" gestion freelance, tutoriels express \"1 minute pour booster ta gestion avec Notion+IA\", et challenges \"Réduis ton temps de facturation à 5 min\" avec hashtag dédié.\nBase de prompt produit :\nBuild a mini-SaaS with Next.js frontend, Node.js API backend, PostgreSQL DB storing user data and templates, integrating an AI API to generate automated email relances, proposals and content ideas; connect with Notion API to deploy customizable templates and dashboards for lead, invoice and content management; offer subscription and credit-based AI usage system.\nHooks / accroches publicitaires à tester :\n- Passez de l’enfer des factures à la fluidité totale en 5 minutes avec NotionFlow !\n- Le système tout-en-un que tout freelance attendait pour gérer et créer sans stress.\n- Dites adieu à la paperasse : votre assistant IA Notion est prêt à bosser à votre place.\nTendance d'origine : Les freelances cherchent des systèmes clé en main pour gérer leads, factures et contenu via Notion + IA.\"\n\nContraintes:\n- Cible principale: Freelances, créateurs et petites équipes souhaitant automatiser leur gestion et création de contenu via Notion et IA.\n- Objectif business: Monétiser avec abonnement SaaS récurrent, crédits IA à l’usage, et montée en gamme par offres spécialisées et contenus premium.\n- Plateformes de diffusion: TikTok, Instagram Reels, YouTube Shorts, landing pages web\n\nDétaille obligatoirement:\n1. Nom du mini-SaaS (court, mémorisable, brandable).\n2. Promesse principale en une phrase ultra claire.\n3. Fonctionnalités principales.\n4. Comment l'IA est utilisée dans le produit.\n5. Modèle de monétisation:\n   - Crédits IA (générations limitées / packs payants).\n   - Version gratuite avec pub.\n   - Version premium sans pub + bonus.\n6. Stratégie de viralité:\n   - Formats de contenus (TikTok, Reels, Shorts, etc.).\n   - Mécanismes de partage.\n7. Prompt clair et structuré à utiliser pour générer le code du mini-SaaS (stack: Next.js + API Node, connecté à un backend d'IA).\n\nRéponds dans un format structuré, prêt à être utilisé directement pour générer le code du mini-SaaS et son marketing.");
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  async function fetchCredits() {
    try {
      const res = await axios.get(`${API_BASE}/api/credits`);
      setCredits(res.data.balance);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        // 1) on s'assure d'avoir un userId
        const uid = await ensureUserId();
        setUserId(uid);

        // 2) on charge les crédits pour cet utilisateur
        await fetchCredits();
      } catch (e) {
        console.error("Erreur d'initialisation:", e);
        setError("Erreur lors de l'initialisation de l'utilisateur.");
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, []);

  async function handleWatchAd() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/api/credits/reward`, {});
      setCredits(res.data.balance);
    } catch (e) {
      console.error(e);
      setError("Erreur pendant l'obtention du crédit.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/api/generate`, { prompt });
      setResult(res.data.project);
      setCredits(res.data.project.remainingCredits);
    } catch (e) {
      console.error(e);
      if (e.response?.data?.error === "INSUFFICIENT_CREDITS") {
        setError("Aucun crédit disponible. Regarde une pub pour en obtenir.");
      } else {
        setError("Erreur pendant la génération du SaaS.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <main
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050816",
          color: "white",
          padding: "2rem"
        }}
      >
        <p>Initialisation de ton espace IA...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050816",
        color: "white",
        padding: "2rem"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "rgba(15,23,42,0.95)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          border: "1px solid rgba(148,163,184,0.3)"
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>
          {projectNameToTitle("nlp-7a5ca857-8d83-439c-837e-d1044f6f29eb")}
        </h1>
        <p style={{ marginBottom: "0.25rem", color: "#9ca3af", fontSize: "0.85rem" }}>
          Utilisateur : {userId ? userId.slice(0, 8) + "..." : "inconnu"}
        </p>
        <p style={{ marginBottom: "1rem", color: "#9ca3af" }}>
          1 pub regardée = 1 génération IA. Quand tu n'as plus de crédits,
          tu dois regarder une nouvelle pub.
        </p>

        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>Crédits disponibles :</span>
          <span
            style={{
              fontWeight: "bold",
              color: credits > 0 ? "#22c55e" : "#f97316"
            }}
          >
            {credits}
          </span>
        </div>

        <label style={{ fontSize: "0.9rem" }}>
          Prompt utilisé :
          <textarea
            style={{
              width: "100%",
              marginTop: "0.25rem",
              background: "#020617",
              color: "white",
              borderRadius: "8px",
              padding: "0.5rem",
              border: "1px solid #1e293b",
              minHeight: "70px"
            }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>

        {error && (
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.5)",
              color: "#fecaca"
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1rem",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={handleWatchAd}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              background:
                "linear-gradient(to right, #f97316, #ec4899, #8b5cf6)",
              color: "white",
              fontWeight: 600
            }}
          >
            🎥 Regarder une pub ( +1 crédit )
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              borderRadius: "999px",
              border: "1px solid #38bdf8",
              cursor: "pointer",
              background: "transparent",
              color: "#e0f2fe",
              fontWeight: 600
            }}
          >
            ⚙️ Générer le mini-SaaS
          </button>
        </div>

        {loading && (
          <p style={{ marginTop: "0.75rem", color: "#93c5fd" }}>
            Génération en cours...
          </p>
        )}

        {result && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              background: "#020617",
              border: "1px solid #1e293b",
              fontSize: "0.9rem"
            }}
          >
            <h2 style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>
              Résultat de la génération
            </h2>
            <p>ID projet : {result.projectId}</p>
            <p>Nom : {result.projectName}</p>
            <p>Crédits restants : {result.remainingCredits}</p>
          </div>
        )}
      </div>
    </main>
  );
}

function projectNameToTitle(name) {
  return name.replace(/^nlp-/, "").slice(0, 8).toUpperCase() + " — mini-SaaS IA";
}