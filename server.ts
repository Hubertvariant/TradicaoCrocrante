import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini API client
// Always use server-side initialization with process.env.GEMINI_API_KEY
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not defined. The support chat will operate in offline mock mode.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API client:", error);
}

// API Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Gemini Chat Endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  const { messages, language } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const lang = language || "pt";

  // System instruction based on selected language
  const systemInstructions: Record<string, string> = {
    pt: "Você é o 'Pãozinho', o assistente de IA amigável do App de Pão de Queijo. Seu objetivo é ajudar os clientes a escolherem os melhores pães de queijo, agendar encomendas, entender o sistema de fidelidade, localizar padarias próximas e tirar dúvidas gerais de forma carismática, alegre e fofinha. Sempre cite o quanto pão de queijo quentinho é maravilhoso. Seja conciso e use formatação markdown amigável com emojis.",
    en: "You are 'Pãozinho' (Little Cheese Bread), the friendly AI assistant for the Cheese Bread App. Your goal is to help customers choose the best cheese breads, schedule orders, understand the loyalty program, locate nearby bakeries, and answer general questions in a charismatic, cheerful, and cute way. Always mention how wonderful warm cheese bread is. Be concise and use friendly markdown formatting with emojis.",
    es: "Eres 'Pãozinho' (Pancito de Queso), el amigable asistente de IA de la App de Pan de Queso. Tu objetivo es ayudar a los clientes a elegir los mejores panes de queso, programar pedidos, entender el programa de fidelidad, ubicar panaderías cercanas y responder preguntas generales de una manera carismática, alegre y linda. Siempre menciona lo maravilloso que es el pan de queso calientito. Sé conciso y usa un formato markdown amigable con emojis."
  };

  const systemInstruction = systemInstructions[lang] || systemInstructions.pt;

  // Fallback offline mock response generator if Gemini key is missing or request fails
  const getOfflineResponse = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    if (lang === "pt") {
      if (msg.includes("fidelidade") || msg.includes("ponto") || msg.includes("conquista")) {
        return "🧀 *Uau!* Nosso sistema de fidelidade é incrível! A cada pão de queijo comprado, você ganha 10 pontos de queijo. Junte 100 pontos e troque por uma fornada quentinha de graça! Acesse a aba 'Fidelidade' para ver suas conquistas!";
      }
      if (msg.includes("padaria") || msg.includes("onde") || msg.includes("localiz") || msg.includes("perto")) {
        return "📍 *Bateu a fome?* Temos várias padarias parceiras pertinho de você! Vá na aba 'Padarias' para ver o mapa interativo com as rotas mais rápidas para buscar seu pão de queijo saindo do forno!";
      }
      if (msg.includes("encomenda") || msg.includes("agendar") || msg.includes("pedir") || msg.includes("comprar")) {
        return "⏰ *Super prático!* Você pode escolher seus pães de queijo favoritos, agendar o melhor horário para buscar e pagar diretamente pelo aplicativo. Vá na aba 'Encomendar' e garanta o seu lanche!";
      }
      return "🧀 *Oi! Eu sou o Pãozinho!* Estou em modo de contingência local no momento, mas posso te contar que nossos pães de queijo são feitos com queijo canastra artesanal e muito amor! Como posso te ajudar hoje com suas encomendas, fidelidade ou padarias?";
    } else if (lang === "es") {
      if (msg.includes("fidelidad") || msg.includes("puntos") || msg.includes("logro")) {
        return "🧀 *¡Gana puntos con cada mordisco!* Cada pan de queso te da 10 puntos de queso. ¡Acumula 100 puntos y canjéalos por una bandeja caliente gratis! ¡Mira la pestaña de 'Fidelidad'!";
      }
      return "🧀 *¡Hola! ¡Soy Pãozinho!* En este momento estoy operando en modo local. ¡Nuestros panes de queso son deliciosos, crujientes y llenos de queso de verdad! ¿En qué puedo ayudarte hoy?";
    } else {
      if (msg.includes("loyalty") || msg.includes("points") || msg.includes("rewards")) {
        return "🧀 *Wow!* Our rewards program is cheese-tastic! Every single cheese bread gives you 10 points. Collect 100 points and redeem them for a free, warm, fresh basket! Check the 'Loyalty' tab!";
      }
      return "🧀 *Hi! I'm Pãozinho!* I am currently in offline standby mode, but I can tell you that our cheese breads are made with genuine artisanal cheese and lots of love! How can I help you today?";
    }
  };

  const userLastMessage = messages[messages.length - 1]?.content || "";

  if (!ai) {
    // If Gemini client is not initialized, return offline response immediately
    return res.json({ text: getOfflineResponse(userLastMessage), mode: "offline" });
  }

  try {
    // Map the conversation history format to Gemini SDK standard
    // We can compile history into a single prompt or feed a simplified prompt with context
    const recentHistory = messages.slice(-5).map((m: any) => {
      const role = m.role === "user" ? "user" : "model";
      return `${role === "user" ? "User" : "Pãozinho"}: ${m.content}`;
    }).join("\n");

    const prompt = `Conversa anterior:\n${recentHistory}\n\nPor favor, responda à última mensagem acima seguindo suas instruções.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const replyText = response.text || getOfflineResponse(userLastMessage);
    res.json({ text: replyText, mode: "online" });
  } catch (error) {
    console.error("Gemini API calling error:", error);
    res.json({ text: getOfflineResponse(userLastMessage), mode: "fallback" });
  }
});

// Setup Vite development server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite middleware for development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from /dist in production...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
