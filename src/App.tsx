import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Clock,
  Phone,
  Compass,
  Search,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Trash2,
  Send,
  Sparkles,
  ShieldCheck,
  Award,
  Share2,
  TrendingUp,
  Coins,
  Globe,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Eye,
  Star,
  User,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  CreditCard,
  Lock,
  Bell,
  CheckCircle,
  X,
  ArrowRight
} from "lucide-react";

import { Language, Theme, CheeseBreadItem, Bakery, Order, OrderItem, Achievement, Message, Review } from "./types";
import { MENU_ITEMS, MOCK_BAKERIES, INITIAL_ACHIEVEMENTS, MOCK_METRICS, TRANSLATIONS } from "./data";
import BiometricAuth from "./components/BiometricAuth";

export default function App() {
  // Theme and Internationalization States
  const [language, setLanguage] = useState<Language>("pt");
  const [theme, setTheme] = useState<Theme>("dark");
  
  // Simulation States
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isBiometricOpen, setIsBiometricOpen] = useState<boolean>(false);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<"menu" | "dashboard">("menu");

  // Core Data States
  const [bakeries, setBakeries] = useState<Bakery[]>(MOCK_BAKERIES);
  const [selectedBakery, setSelectedBakery] = useState<Bakery>(MOCK_BAKERIES[0]);
  const [distanceLimit, setDistanceLimit] = useState<number>(5); // max 5km default
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Order & Scheduling States
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [pickupTime, setPickupTime] = useState<string>("16:30");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "applepay">("pix");
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  
  // Checkout Form States (Simulated Card)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  
  // User Profile, Loyalty & Achievements
  const [points, setPoints] = useState<number>(120);
  const [level, setLevel] = useState<number>(2);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [selectedAchievementToShare, setSelectedAchievementToShare] = useState<Achievement | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Customer Service AI Chat
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      content: TRANSLATIONS[language].chatGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Custom User Reviews Appending
  const [userReviewText, setUserReviewText] = useState("");
  const [userReviewRating, setUserReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Intelligent Push Notifications Queue
  const [notifications, setNotifications] = useState<{ id: string; message: string; title: string }[]>([]);

  // Localization and translation dictionary helper
  const t = TRANSLATIONS[language];

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle Order Status Cycle & Push Notification Simulation
  useEffect(() => {
    if (activeOrders.length === 0) return;

    const timer = setInterval(() => {
      setActiveOrders((prevOrders) => {
        let stateChanged = false;
        const updated = prevOrders.map((order) => {
          if (order.status === "pending") {
            triggerPushNotification(
              language === "pt" ? "Pedido Confirmado" : language === "es" ? "Pedido Confirmado" : "Order Confirmed",
              language === "pt"
                ? `O forno de ${order.bakery.name} já foi aceso para os seus pães de queijo!`
                : `The oven at ${order.bakery.name} is preheated for your cheese breads!`
            );
            return { ...order, status: "preparing" as const };
          } else if (order.status === "preparing") {
            triggerPushNotification(
              language === "pt" ? "Saindo do Forno!" : language === "es" ? "¡Saliendo del Horno!" : "Fresh & Hot!",
              language === "pt"
                ? `Seu pedido está prontinho esperando por você às ${order.pickupTime}!`
                : `Your order is ready and waiting for you at ${order.pickupTime}!`
            );
            return { ...order, status: "ready" as const };
          } else if (order.status === "ready") {
            // Check off achievement morning person if applicable
            const hour = parseInt(order.pickupTime.split(":")[0]);
            if (hour < 8) {
              unlockAchievement("morning_person");
            }
            // Move to completed orders
            setCompletedOrders((prev) => [order, ...prev]);
            stateChanged = true;
            return { ...order, status: "picked_up" as const };
          }
          return order;
        });

        // Filter out those that have been picked up from active view
        return updated.filter((o) => o.status !== "picked_up");
      });
    }, 15000); // cycle state every 15s for high engagement demo simulation

    return () => clearInterval(timer);
  }, [activeOrders, language]);

  // Function to show a clean push notification on the interface
  const triggerPushNotification = (title: string, message: string) => {
    const id = Math.random().toString();
    setNotifications((prev) => [{ id, title, message }, ...prev]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000); // auto-dismiss in 5s
  };

  // Helper to unlock achievements
  const unlockAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          triggerPushNotification(
            language === "pt" ? "🏆 Conquista Desbloqueada!" : "🏆 Achievement Unlocked!",
            language === "pt"
              ? `Você desbloqueou: "${ach.title.pt}" (+${ach.pointsAwarded} pts)`
              : `You unlocked: "${ach.title.en}" (+${ach.pointsAwarded} pts)`
          );
          setPoints((p) => p + ach.pointsAwarded);
          return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return ach;
      })
    );
  };

  // Switch Translation effect
  useEffect(() => {
    // Reset initial chat welcoming message on language change
    setChatMessages([
      {
        id: "welcome",
        sender: "bot",
        content: TRANSLATIONS[language].chatGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  // Filter menu items
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchSearch =
        item.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description[language].toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery, language]);

  // Filter bakeries by distance limit
  const filteredBakeries = useMemo(() => {
    return bakeries.filter((bakery) => bakery.distance <= distanceLimit);
  }, [bakeries, distanceLimit]);

  // Cart operations
  const addToCart = (item: CheeseBreadItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) => (i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { item, quantity: 1 }];
    });
    triggerPushNotification("Carrinho Atualizado 🧀", `${item.name[language]} adicionado!`);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.item.id === itemId) {
            const newQty = i.quantity + delta;
            return { ...i, quantity: newQty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, current) => sum + current.item.price * current.quantity, 0);
  }, [cart]);

  const cartPoints = useMemo(() => {
    return cart.reduce((sum, current) => sum + current.item.points * current.quantity, 0);
  }, [cart]);

  // Add review to current bakery
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewText.trim()) return;

    const newReview: Review = {
      id: Math.random().toString(),
      userName: "Você",
      rating: userReviewRating,
      comment: userReviewText,
      date: new Date().toISOString().split("T")[0],
      cheeseBreadType: MENU_ITEMS[0].name[language],
    };

    setBakeries((prev) =>
      prev.map((b) => {
        if (b.id === selectedBakery.id) {
          const updatedReviews = [newReview, ...b.reviews];
          const averageRating = parseFloat(
            ((b.rating * b.reviewsCount + userReviewRating) / (b.reviewsCount + 1)).toFixed(2)
          );
          return {
            ...b,
            reviews: updatedReviews,
            reviewsCount: b.reviewsCount + 1,
            rating: averageRating,
          };
        }
        return b;
      })
    );

    // Also update selected bakery locally
    setSelectedBakery((prev) => {
      const updatedReviews = [newReview, ...prev.reviews];
      const averageRating = parseFloat(
        ((prev.rating * prev.reviewsCount + userReviewRating) / (prev.reviewsCount + 1)).toFixed(2)
      );
      return {
        ...prev,
        reviews: updatedReviews,
        reviewsCount: prev.reviewsCount + 1,
        rating: averageRating,
      };
    });

    setUserReviewText("");
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
    triggerPushNotification("Feedback Enviado ⭐", "Sua avaliação foi registrada com sucesso!");
  };

  // Complete Checkout Order Trigger
  const handleCheckoutInit = () => {
    if (cart.length === 0) return;
    setIsBiometricOpen(true);
  };

  const handleBiometricSuccess = () => {
    setIsBiometricOpen(false);
    
    // Create new order
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newOrder: Order = {
      id: Math.random().toString(),
      code: randomCode,
      bakery: selectedBakery,
      items: [...cart],
      pickupTime: pickupTime,
      status: "pending",
      total: cartTotal,
      paymentMethod: paymentMethod,
      paymentStatus: "paid",
      pointsEarned: cartPoints,
      createdAt: new Date().toISOString(),
    };

    setActiveOrders((prev) => [...prev, newOrder]);
    
    // Update Loyalty Points
    setPoints((p) => {
      const nextPoints = p + cartPoints;
      if (nextPoints >= 200 && level < 3) {
        setLevel(3);
        setTimeout(() => unlockAchievement("cheese_lover"), 500);
      }
      return nextPoints;
    });

    // Reset checkout forms
    setCart([]);
    
    // Auto unlock explorer achievement if they order from multiple bakeries
    const orderedBakeryIds = new Set([selectedBakery.id, ...completedOrders.map((o) => o.bakery.id)]);
    if (orderedBakeryIds.size >= 3) {
      setTimeout(() => unlockAchievement("explorer"), 2000);
    }

    // Direct push notification simulation for ordering
    triggerPushNotification(
      language === "pt" ? "🧀 Encomenda Agendada!" : "🧀 Order Scheduled!",
      language === "pt"
        ? `Seu pedido código ${randomCode} foi agendado para as ${pickupTime}!`
        : `Your order code ${randomCode} was scheduled for pickup at ${pickupTime}!`
    );
  };

  // AI Assistant integration with Server-side route /api/chat and Offline fallback
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      if (isOnline) {
        // Query server side API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatMessages.concat(userMsg).map((m) => ({
              role: m.sender === "user" ? "user" : "model",
              content: m.content
            })),
            language: language
          })
        });
        
        const data = await response.json();
        const botMsg: Message = {
          id: Math.random().toString(),
          sender: "bot",
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, botMsg]);
      } else {
        // Simulated Offline quick AI response
        setTimeout(() => {
          let responseContent = "";
          const msg = userMsgText.toLowerCase();
          
          if (language === "pt") {
            if (msg.includes("fidelidade") || msg.includes("ponto") || msg.includes("conquista")) {
              responseContent = "🧀 *Modo Offline:* Nosso sistema de fidelidade dá 10 pontos por cada Pão de Queijo Tradicional. Complete conquistas para subir de nível e ganhar pães de queijo extras!";
            } else if (msg.includes("perto") || msg.includes("onde") || msg.includes("padaria")) {
              responseContent = "📍 *Modo Offline:* A padaria mais próxima de você agora é " + selectedBakery.name + " (" + selectedBakery.distance + "km). Você pode ver as rotas na aba esquerda.";
            } else {
              responseContent = "🧀 *Modo Offline:* O Pãozinho está operando no cache offline. Nosso cardápio tradicional e os dados das padarias estão salvos localmente e funcionam 100%!";
            }
          } else {
            responseContent = "🧀 *Offline Cache:* Operating without internet. All your menu choices, scheduled pickups, and locations are saved securely on your device!";
          }

          const botMsg: Message = {
            id: Math.random().toString(),
            sender: "bot",
            content: responseContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages((prev) => [...prev, botMsg]);
        }, 800);
      }
    } catch (error) {
      console.error("Failed to fetch chat response", error);
      // Fallback response
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        content: "Oops! Houve uma pequena oscilação na rede, mas posso confirmar que os melhores pães de queijo estão quentinhos aqui! O que gostaria de encomendar?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Chat Suggestion Chips Click
  const handleChipClick = (text: string) => {
    setChatInput(text);
  };

  // Social Sharing Simulation Dialog open
  const openShareModal = (achievement: Achievement) => {
    setSelectedAchievementToShare(achievement);
    setIsShareModalOpen(true);
  };

  const handleShareOnSocial = (platform: "twitter" | "facebook" | "whatsapp") => {
    if (!selectedAchievementToShare) return;
    const caption = `${t.shareCaption} "${selectedAchievementToShare.title[language]}" ${selectedAchievementToShare.icon} no Pão de Ouro! 🧀🔥 #PaodeQueijo #BeloHorizonte`;
    
    // Copy to clipboard simulation
    navigator.clipboard?.writeText?.(caption);
    
    triggerPushNotification(
      "Compartilhado!",
      `${platform.toUpperCase()} simulado com sucesso. Link copiado para área de transferência.`
    );
    setIsShareModalOpen(false);
  };

  // Quick Engagement simulated notification trigger
  const handleSmartEngagementNotification = () => {
    triggerPushNotification(
      language === "pt" ? "Dica do Pãozinho 🧀" : "Pãozinho Suggestion 🧀",
      t.smartPushMsg
    );
  };

  // Custom visual components for the metrics graphs (handcrafted minimal editorial SVG)
  const renderPointsChart = () => {
    const data = MOCK_METRICS;
    const width = 450;
    const height = 110;
    const padding = 20;
    
    // find max
    const maxVal = Math.max(...data.map(d => d.pointsEarned)) * 1.15;
    
    const pointsStr = data.map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (data.length - 1);
      const y = height - padding - (d.pointsEarned * (height - padding * 2)) / maxVal;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
        {/* Horizontal grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke={theme === "dark" ? "#2A2620" : "#E5E1D8"} strokeWidth="1" strokeDasharray="3,3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={theme === "dark" ? "#2A2620" : "#E5E1D8"} strokeWidth="1" strokeDasharray="3,3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={theme === "dark" ? "#2A2620" : "#E5E1D8"} strokeWidth="1" />
        
        {/* Area fill */}
        <polyline
          fill={theme === "dark" ? "rgba(217, 163, 71, 0.08)" : "rgba(197, 145, 50, 0.08)"}
          stroke="none"
          points={`${padding},${height - padding} ${pointsStr} ${width - padding},${height - padding}`}
        />
        
        {/* Trend line */}
        <polyline
          fill="none"
          stroke="#D9A347"
          strokeWidth="2.5"
          points={pointsStr}
        />

        {/* Dots and Labels */}
        {data.map((d, i) => {
          const x = padding + (i * (width - padding * 2)) / (data.length - 1);
          const y = height - padding - (d.pointsEarned * (height - padding * 2)) / maxVal;
          return (
            <g key={i} className="group cursor-pointer">
              <circle cx={x} cy={y} r="4" fill={theme === "dark" ? "#0F0F0D" : "#FAF9F6"} stroke="#D9A347" strokeWidth="2" />
              <text x={x} y={y - 10} textAnchor="middle" className="text-[9px] font-mono font-bold fill-stone-500 dark:fill-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.pointsEarned}p
              </text>
              <text x={x} y={height - 5} textAnchor="middle" className="text-[8px] font-mono fill-stone-400">
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderBreadsChart = () => {
    const data = MOCK_METRICS;
    const width = 450;
    const height = 110;
    const padding = 20;
    const maxVal = Math.max(...data.map(d => d.breadsEaten)) * 1.2;
    const colWidth = 24;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke={theme === "dark" ? "#2A2620" : "#E5E1D8"} strokeWidth="1" strokeDasharray="3,3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={theme === "dark" ? "#2A2620" : "#E5E1D8"} strokeWidth="1" />
        
        {data.map((d, i) => {
          const x = padding + (i * (width - padding * 2)) / (data.length - 1);
          const barHeight = (d.breadsEaten * (height - padding * 2)) / maxVal;
          const y = height - padding - barHeight;

          return (
            <g key={i} className="group cursor-pointer">
              {/* Highlight bar behind */}
              <rect
                x={x - colWidth / 2}
                y={padding}
                width={colWidth}
                height={height - padding * 2}
                fill="transparent"
                className="hover:fill-stone-200/20 dark:hover:fill-stone-850/40"
              />
              {/* Main styled bar */}
              <rect
                x={x - colWidth / 4}
                y={y}
                width={colWidth / 2}
                height={barHeight}
                fill={theme === "dark" ? "#2A2620" : "#E3E1DC"}
                stroke="#D9A347"
                strokeWidth="1.5"
                rx="2"
                className="group-hover:fill-[#D9A347] transition-all"
              />
              <text x={x} y={y - 8} textAnchor="middle" className="text-[9px] font-mono font-bold fill-stone-600 dark:fill-stone-300">
                {d.breadsEaten}
              </text>
              <text x={x} y={height - 5} textAnchor="middle" className="text-[8px] font-mono fill-stone-400">
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${
      theme === "dark" ? "bg-[#0F0F0D] text-[#E8E4D9]" : "bg-[#FAF9F6] text-[#1C1917]"
    }`}>
      
      {/* Dynamic Push Notification Overlay Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`p-4 rounded-2xl border shadow-xl flex gap-3 pointer-events-auto ${
                theme === "dark"
                  ? "bg-[#1A1814] border-[#2A2620] text-[#E8E4D9]"
                  : "bg-white border-[#E7E5E4] text-[#1C1917]"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#D9A347]/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-[#D9A347]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-mono font-bold uppercase text-[#D9A347] tracking-wider">
                  {notif.title}
                </p>
                <p className="text-xs leading-relaxed mt-0.5 font-medium">
                  {notif.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Container mirroring the requested template layout box exactly */}
      <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen">
        
        {/* HEADER SECTION */}
        <header className={`h-24 px-6 md:px-10 border-b flex items-center justify-between transition-colors ${
          theme === "dark" ? "border-[#2A2620] bg-[#0F0F0D]" : "border-[#E7E5E4] bg-[#FAF9F6]"
        }`}>
          <div className="flex items-center gap-6 md:gap-10">
            {/* Elegant serif identity */}
            <div className="flex flex-col">
              <span className="font-serif italic text-2xl md:text-3xl font-black text-[#D9A347] tracking-tight">
                Pão de Ouro
              </span>
              <span className="text-[8px] font-mono tracking-[0.25em] uppercase opacity-50 mt-0.5">
                Artisanal Cheese Bread
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex gap-6 text-[10px] uppercase font-bold tracking-widest opacity-80">
              <button
                onClick={() => setActiveTab("menu")}
                className={`py-2 transition-all border-b-2 hover:text-[#D9A347] ${
                  activeTab === "menu" ? "border-[#D9A347] text-[#D9A347]" : "border-transparent"
                }`}
              >
                {t.tabOrder}
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-2 transition-all border-b-2 hover:text-[#D9A347] ${
                  activeTab === "dashboard" ? "border-[#D9A347] text-[#D9A347]" : "border-transparent"
                }`}
              >
                {t.tabDashboard}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Network / Offline Switch Simulation */}
            <button
              onClick={() => {
                setIsOnline(!isOnline);
                triggerPushNotification(
                  isOnline ? "Modo Offline" : "Modo Online",
                  isOnline ? t.statusOffline : "Conectado à rede em tempo real!"
                );
              }}
              className={`flex items-center gap-2 border rounded-full px-3 py-1 text-[9px] font-mono tracking-wider transition-all ${
                isOnline
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              {isOnline ? "SYNC ONLINE" : "LOCAL CACHE ACTIVE"}
            </button>

            {/* Language Selection bar */}
            <div className="flex items-center border rounded-full px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest gap-2 bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              {(["pt", "en", "es"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-1.5 py-0.5 rounded ${
                    language === lang ? "bg-[#D9A347] text-stone-950" : "opacity-40 hover:opacity-80"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Custom Theme Mode switch */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors border-stone-200 dark:border-stone-800 hover:text-[#D9A347]"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* OFFLINE BANNER */}
        {!isOnline && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{t.offlineNotice}</span>
            </div>
            <button
              onClick={() => setIsOnline(true)}
              className="underline text-xs font-mono font-bold hover:text-amber-400"
            >
              Reconectar
            </button>
          </div>
        )}

        {/* MAIN BODY GRID - 12 Columns matching theme mockup */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-visible">
          
          {/* COLUMN 1: LEFT SECTION (3/12 GRID) - Bakery Finder, Location Filter & Scheduling Controls */}
          <aside className={`lg:col-span-3 p-6 md:p-8 flex flex-col border-r transition-colors ${
            theme === "dark" ? "border-[#2A2620] bg-[#0F0F0D]" : "border-[#E7E5E4] bg-[#FAF9F6]"
          }`}>
            <h2 className="font-serif text-3xl font-medium tracking-tight mb-2 leading-none italic">
              {language === "pt" ? "Onde está o aroma?" : language === "es" ? "¿Dónde está el aroma?" : "Where is that scent?"}
            </h2>
            <p className="text-xs opacity-60 mb-6">
              {language === "pt" ? "Localize padarias próximas saindo fornadas" : "Locate nearby bakeries baking fresh batches right now"}
            </p>

            {/* Distance filter slider */}
            <div className="mb-6 bg-stone-100/50 dark:bg-stone-900/40 p-4 rounded-2xl border border-stone-200/50 dark:border-stone-800/60">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  {t.distanceFilter}
                </span>
                <span className="text-xs font-mono font-bold text-[#D9A347]">{distanceLimit} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={distanceLimit}
                onChange={(e) => setDistanceLimit(parseFloat(e.target.value))}
                className="w-full accent-[#D9A347] h-1 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-pointer"
              />
              <p className="text-[9px] opacity-40 mt-1">
                {language === "pt" ? "Mostrando apenas padarias no raio de busca" : "Showing bakeries within range"}
              </p>
            </div>

            {/* Bakeries List */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] lg:max-h-[380px] pr-2 mb-6">
              {filteredBakeries.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                  <Compass className="w-8 h-8 mx-auto text-stone-400 animate-spin" />
                  <p className="text-xs text-stone-400 mt-2">Nenhuma padaria nesta distância.</p>
                </div>
              ) : (
                filteredBakeries.map((bakery) => {
                  const isSelected = selectedBakery.id === bakery.id;
                  return (
                    <motion.div
                      key={bakery.id}
                      onClick={() => {
                        setSelectedBakery(bakery);
                        triggerPushNotification("Padaria Selecionada 📍", bakery.name);
                      }}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? theme === "dark"
                            ? "border-[#D9A347] bg-[#1A1814]"
                            : "border-[#C59132] bg-stone-100"
                          : theme === "dark"
                          ? "border-[#2A2620] hover:border-stone-700 bg-stone-900/10"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-100 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D9A347]" /> {bakery.name}
                        </p>
                        <span className="text-[10px] font-mono font-bold bg-[#D9A347]/10 text-[#D9A347] px-1.5 py-0.5 rounded shrink-0">
                          {bakery.distance}km
                        </span>
                      </div>
                      <p className="text-[10px] opacity-60 mt-1.5 line-clamp-1">{bakery.address}</p>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] opacity-75 font-medium">
                        <span className="flex items-center gap-1 font-mono text-[#D9A347]">
                          ★ {bakery.rating} <span className="opacity-50 text-[9px]">({bakery.reviewsCount})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {bakery.hours}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Schedulers Quick Display Card */}
            <div className={`mt-auto p-4 border rounded-xl transition-colors ${
              theme === "dark" ? "bg-[#1A1814] border-[#2A2620]" : "bg-stone-50 border-stone-200"
            }`}>
              <p className="text-[9px] font-mono opacity-50 uppercase tracking-widest font-bold mb-1">
                {t.scheduleTime}
              </p>
              <div className="flex justify-between items-center gap-3">
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className={`bg-transparent text-xl font-serif font-black focus:outline-none border-b border-dashed focus:border-[#D9A347] ${
                    theme === "dark" ? "text-[#E8E4D9]" : "text-stone-900"
                  }`}
                />
                <div className="flex gap-1.5">
                  {["08:00", "12:00", "17:00"].map((tPreset) => (
                    <button
                      key={tPreset}
                      onClick={() => setPickupTime(tPreset)}
                      className="px-2 py-1 text-[9px] font-mono font-bold border rounded hover:border-[#D9A347] transition-all bg-white dark:bg-stone-900"
                    >
                      {tPreset}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[9px] opacity-40 mt-1.5">
                {language === "pt" ? "Agende sua retirada no balcão sem filas" : "Pre-order to skip the counter line"}
              </p>
            </div>
          </aside>

          {/* COLUMN 2: CENTER SECTION (6/12 GRID) - MENU DISCOVERY OR METRICS DASHBOARD */}
          <main className="lg:col-span-6 flex flex-col relative overflow-y-auto max-h-[calc(100vh-96px)]">
            
            {/* Header tab buttons for Mobile */}
            <div className="flex md:hidden border-b border-stone-200 dark:border-stone-800 p-2 bg-stone-50 dark:bg-stone-950">
              <button
                onClick={() => setActiveTab("menu")}
                className={`flex-1 py-2 text-center text-xs font-bold tracking-widest uppercase ${
                  activeTab === "menu" ? "text-[#D9A347] border-b-2 border-[#D9A347]" : "opacity-60"
                }`}
              >
                {t.tabOrder}
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex-1 py-2 text-center text-xs font-bold tracking-widest uppercase ${
                  activeTab === "dashboard" ? "text-[#D9A347] border-b-2 border-[#D9A347]" : "opacity-60"
                }`}
              >
                {t.tabDashboard}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "menu" ? (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 md:p-10 space-y-8 flex-1"
                >
                  {/* Hero Poster */}
                  <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-[#2A2620] p-8 md:p-10 bg-[#0F0F0D] text-white">
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#D9A347_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#D9A347]/10 blur-3xl rounded-full"></div>
                    <span className="text-[#D9A347] text-[10px] tracking-[0.3em] font-mono font-bold uppercase block mb-3">
                      {t.tagline}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif leading-[0.95] mb-4 uppercase tracking-tighter">
                      Tradição <br /> <span className="italic ml-8 md:ml-12 text-[#D9A347]">Crocrante</span>
                    </h1>
                    <p className="max-w-md text-xs md:text-sm text-stone-300 opacity-80 leading-relaxed mb-6 font-sans">
                      {language === "pt"
                        ? "Pães de queijo feitos artesanalmente com queijo mineiro curado na tábua de madeira. Sem aditivos artificiais, só amor, queijo e polvilho."
                        : "Artisanal cheese breads baked with premium aged Brazilian cheese. 100% natural, crisp, light, gluten-free, and delightful."}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSmartEngagementNotification}
                        className="bg-[#D9A347] hover:bg-[#c3913d] text-stone-950 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors shadow-lg flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Smart Push Engagement
                      </button>
                    </div>
                  </div>

                  {/* Category Selection Filter & Search bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "all", label: language === "pt" ? "Todos" : "All" },
                        { id: "classic", label: t.classic },
                        { id: "special", label: t.special },
                        { id: "filled", label: t.filled },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-4 py-2 text-[10px] font-mono font-bold rounded-full border tracking-wide uppercase transition-all ${
                            selectedCategory === cat.id
                              ? "bg-stone-900 dark:bg-white text-white dark:text-stone-950 border-stone-900 dark:border-white"
                              : theme === "dark"
                              ? "border-stone-800 hover:border-stone-700 hover:bg-stone-900/50"
                              : "border-stone-200 hover:border-stone-300 hover:bg-stone-100"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={language === "pt" ? "Buscar no cardápio..." : "Search menu..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-10 pr-4 py-2 rounded-full border text-xs focus:outline-none focus:border-[#D9A347] w-full md:w-48 transition-all ${
                          theme === "dark" ? "bg-stone-900/30 border-stone-800 text-[#E8E4D9]" : "bg-stone-50 border-stone-200 text-stone-800"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Cheese Bread Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredMenuItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className={`rounded-2xl border overflow-hidden flex flex-col transition-all group ${
                          theme === "dark" ? "border-stone-800 bg-stone-900/20" : "border-stone-200 bg-white"
                        }`}
                      >
                        <div className="h-40 overflow-hidden relative">
                          <img
                            src={item.image}
                            alt={item.name[language]}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2 bg-stone-950/85 backdrop-blur text-white text-[9px] font-mono px-2 py-1 rounded-full flex items-center gap-1 border border-stone-800">
                            <Coins className="w-3.5 h-3.5 text-[#D9A347]" /> +{item.points} pts
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-serif text-lg font-bold tracking-tight">
                                {item.name[language]}
                              </h3>
                              <span className="text-sm font-mono font-bold text-[#D9A347] whitespace-nowrap">
                                R$ {item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs opacity-70 mt-2 leading-relaxed">
                              {item.description[language]}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-200/50 dark:border-stone-800/50">
                            <span className="text-[10px] font-mono text-[#D9A347]">
                              ★ {item.rating}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-[#D9A347] hover:bg-[#c1913f] text-stone-950 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              {t.addCart}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Reviews Segment of Selected Bakery inside main column */}
                  <div className={`p-6 rounded-2xl border transition-colors ${
                    theme === "dark" ? "bg-stone-900/10 border-stone-800" : "bg-stone-50 border-stone-200"
                  }`}>
                    <h3 className="font-serif text-xl mb-4 font-bold tracking-tight flex items-center gap-2">
                      <span>★</span> {language === "pt" ? `Opinião dos Clientes sobre ${selectedBakery.name}` : `Customer Reviews of ${selectedBakery.name}`}
                    </h3>

                    {/* Submit Review Form */}
                    <form onSubmit={handleSubmitReview} className="mb-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono uppercase tracking-wider">{language === "pt" ? "Sua nota:" : "Your Rating:"}</span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setUserReviewRating(star)}
                              className={`text-lg transition-colors ${
                                star <= userReviewRating ? "text-[#D9A347]" : "text-stone-300"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t.reviewPlaceholder}
                          value={userReviewText}
                          onChange={(e) => setUserReviewText(e.target.value)}
                          className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D9A347] ${
                            theme === "dark" ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-200 text-stone-800"
                          }`}
                        />
                        <button
                          type="submit"
                          className="bg-stone-900 dark:bg-white text-white dark:text-stone-950 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-95 transition-all shrink-0"
                        >
                          {t.addReview}
                        </button>
                      </div>
                      {reviewSubmitted && (
                        <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> {t.reviewSuccess}
                        </p>
                      )}
                    </form>

                    {/* Existing Reviews List */}
                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                      {selectedBakery.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className={`p-3 rounded-xl border ${
                            theme === "dark" ? "bg-stone-950/50 border-stone-800/80" : "bg-white border-stone-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#D9A347]/10 flex items-center justify-center shrink-0">
                                {rev.userAvatar ? (
                                  <img src={rev.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <User className="w-3 h-3 text-[#D9A347]" />
                                )}
                              </div>
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                {rev.userName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#D9A347]">
                              {"★".repeat(rev.rating)}
                            </span>
                          </div>
                          <p className="text-xs italic opacity-85 mt-2 leading-relaxed">
                            "{rev.comment}"
                          </p>
                          <div className="flex justify-between items-center mt-2 text-[8px] font-mono opacity-50">
                            <span>{rev.cheeseBreadType}</span>
                            <span>{rev.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                // COLUMN 2 ALTERNATE: METRICS DASHBOARD
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 md:p-10 space-y-8 flex-1"
                >
                  <div className="border-b border-stone-200 dark:border-stone-850 pb-4">
                    <h2 className="font-serif text-3xl font-bold italic tracking-tight text-[#D9A347]">
                      {t.metricTitle}
                    </h2>
                    <p className="text-xs opacity-60">
                      {language === "pt" ? "Relatórios de consumo ecológico e fidelidade calculados localmente" : "Eco-friendly indicators and points accrued this semester"}
                    </p>
                  </div>

                  {/* Top Stats Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-stone-900/20 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                      <p className="text-[9px] font-mono uppercase tracking-wider opacity-60">{t.pointsLabel}</p>
                      <p className="text-2xl font-serif font-black text-[#D9A347] mt-1">{points}</p>
                      <p className="text-[8px] opacity-40 mt-1">{language === "pt" ? "Saldo Atual" : "Current balance"}</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-stone-900/20 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                      <p className="text-[9px] font-mono uppercase tracking-wider opacity-60">{t.levelLabel}</p>
                      <p className="text-2xl font-serif font-black text-stone-800 dark:text-stone-100 mt-1">{level}</p>
                      <p className="text-[8px] opacity-40 mt-1">Tier: Golden Baker</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-stone-900/20 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                      <p className="text-[9px] font-mono uppercase tracking-wider opacity-60">CO₂ POUPADO</p>
                      <p className="text-2xl font-serif font-black text-emerald-500 mt-1">12.7 kg</p>
                      <p className="text-[8px] opacity-40 mt-1">Por buscar a pé</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-stone-900/20 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                      <p className="text-[9px] font-mono uppercase tracking-wider opacity-60">PÃES CONSUMIDOS</p>
                      <p className="text-2xl font-serif font-black text-stone-800 dark:text-stone-100 mt-1">85</p>
                      <p className="text-[8px] opacity-40 mt-1">No ano de 2026</p>
                    </div>
                  </div>

                  {/* Handcrafted Area Chart - Points Accumulation */}
                  <div className={`p-6 rounded-2xl border ${theme === "dark" ? "bg-stone-900/10 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D9A347]">
                        {t.metricPoints}
                      </h3>
                      <span className="text-[10px] font-mono opacity-50 uppercase">Semestre corrente</span>
                    </div>
                    {renderPointsChart()}
                  </div>

                  {/* Handcrafted Bar Chart - Breads Consumed */}
                  <div className={`p-6 rounded-2xl border ${theme === "dark" ? "bg-stone-900/10 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-stone-800 dark:text-stone-200">
                        {t.metricBreads}
                      </h3>
                      <span className="text-[10px] font-mono opacity-50 uppercase">Quantidade mensal</span>
                    </div>
                    {renderBreadsChart()}
                  </div>

                  {/* Ecological Footprint Carbon Metric details */}
                  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 flex items-start gap-4">
                    <Compass className="w-8 h-8 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase text-emerald-500 tracking-wider">
                        {t.metricCo2} • ECO-PICKUP
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed text-stone-700 dark:text-stone-300">
                        Cada vez que você agenda uma encomenda e vai buscá-la caminhando em vez de solicitar um serviço de entrega por moto, você economiza aproximadamente <strong>150g de emissão de CO₂</strong>. Parabéns por apoiar o comércio do seu bairro de forma sustentável!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* COLUMN 3: RIGHT SECTION (3/12 GRID) - CART/ORDERS, SUPORT CHAT & REWARDS */}
          <aside className={`lg:col-span-3 p-6 md:p-8 flex flex-col border-l gap-6 transition-colors ${
            theme === "dark" ? "border-[#2A2620] bg-[#0A0A09]" : "border-[#E7E5E4] bg-white"
          }`}>
            
            {/* Active Orders Status Tracking Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest">
                  {language === "pt" ? "Sua Encomenda Ativa" : "Active Pickup status"}
                </h4>
                <div className="w-2 h-2 rounded-full bg-[#D9A347] animate-pulse"></div>
              </div>

              {activeOrders.length === 0 ? (
                <div className="p-4 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-center">
                  <p className="text-[11px] opacity-50">Nenhuma encomenda em andamento.</p>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-xl border ${
                      theme === "dark" ? "bg-[#1A1814] border-[#2A2620]" : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-mono bg-[#D9A347]/10 text-[#D9A347] px-2 py-0.5 rounded font-black">
                        #{order.code}
                      </span>
                      <span className="text-[9px] font-mono opacity-50">{order.pickupTime}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="w-8 h-8 rounded bg-[#D9A347]/10 flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-800">
                        <Clock className="w-4 h-4 text-[#D9A347]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-100">
                          {order.status === "pending" && t.statusPending}
                          {order.status === "preparing" && t.statusPreparing}
                          {order.status === "ready" && t.statusReady}
                        </p>
                        <p className="text-[8px] opacity-40 uppercase tracking-tighter mt-0.5">
                          {order.bakery.name}
                        </p>
                      </div>
                    </div>

                    {/* Progress slider bar matching theme */}
                    <div className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-full mt-4 relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-[#D9A347] transition-all duration-1000"
                        style={{
                          width:
                            order.status === "pending"
                              ? "20%"
                              : order.status === "preparing"
                              ? "60%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Shopping Cart Scheduler section */}
            <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
              theme === "dark" ? "bg-stone-900/10 border-stone-800" : "bg-stone-50 border-stone-200"
            }`}>
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-800 dark:text-stone-200 flex items-center gap-1">
                <ShoppingBag className="w-4 h-4 text-[#D9A347]" /> {language === "pt" ? "Sacola de Encomenda" : "Order Bag"}
              </h4>

              {cart.length === 0 ? (
                <p className="text-[10px] opacity-40 italic py-4 text-center">{t.emptyCart}</p>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                    {cart.map((cartItem) => (
                      <div key={cartItem.item.id} className="flex items-center justify-between text-xs">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-bold truncate text-stone-800 dark:text-stone-200">{cartItem.item.name[language]}</p>
                          <p className="text-[10px] opacity-50 font-mono">R$ {cartItem.item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, -1)}
                            className="w-5 h-5 rounded border border-stone-300 dark:border-stone-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 text-[10px]"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-mono font-bold">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, 1)}
                            className="w-5 h-5 rounded border border-stone-300 dark:border-stone-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 text-[10px]"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(cartItem.item.id)}
                            className="text-stone-400 hover:text-rose-500 ml-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-stone-300 dark:border-stone-800 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between opacity-70">
                      <span>Subtotal</span>
                      <span className="font-mono">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-800 dark:text-stone-100">
                      <span>Total</span>
                      <span className="font-mono text-[#D9A347]">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-[#D9A347] font-bold">
                      <span>+ {t.pointsLabel}</span>
                      <span>+ {cartPoints} pts</span>
                    </div>
                  </div>

                  {/* Payment selection methods within layout */}
                  <div className="border-t border-dashed border-stone-300 dark:border-stone-800 pt-3">
                    <p className="text-[9px] font-mono font-bold uppercase mb-2 opacity-50">{t.choosePayment}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["pix", "card", "applepay"] as const).map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-1.5 rounded-lg border text-[9px] font-bold uppercase font-mono tracking-wider transition-all ${
                            paymentMethod === method
                              ? "bg-stone-900 dark:bg-white text-white dark:text-stone-950 border-stone-900 dark:border-white"
                              : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:opacity-80"
                          }`}
                        >
                          {method === "pix" && "Pix"}
                          {method === "card" && "Cartão"}
                          {method === "applepay" && "Apple Pay"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutInit}
                    className="w-full bg-[#D9A347] hover:bg-[#c2903f] text-stone-950 py-3 rounded-xl text-xs font-black uppercase tracking-widest mt-2 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {t.confirmOrder}
                  </button>
                </div>
              )}
            </div>

            {/* AI Assistant Chat Panel */}
            <div className={`p-4 rounded-xl border flex-1 flex flex-col min-h-[220px] transition-colors ${
              theme === "dark" ? "bg-stone-900/10 border-stone-800" : "bg-stone-50 border-stone-200"
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-stone-200/50 dark:border-stone-800/50 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#D9A347] flex items-center justify-center text-stone-950 font-black text-[9px]">
                    PQ
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold">Pãozinho (IA)</h5>
                    <p className="text-[8px] opacity-40">Assistente Realtime</p>
                  </div>
                </div>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full ${
                  isOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {isOnline ? "ONLINE" : "OFFLINE CACHE"}
                </span>
              </div>

              {/* Message Log */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[140px] text-[11px] leading-relaxed">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl max-w-[90%] ${
                      msg.sender === "user"
                        ? "bg-[#D9A347] text-stone-950 self-end ml-auto"
                        : theme === "dark"
                        ? "bg-stone-950 border border-stone-800 text-stone-200"
                        : "bg-white border border-stone-200 text-stone-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[7px] opacity-40 block text-right mt-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-1 text-stone-400 font-mono text-[9px] p-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestion Chips */}
              <div className="flex gap-1.5 overflow-x-auto py-2 shrink-0">
                {[
                  language === "pt" ? "Como ganhar pontos?" : "How to get points?",
                  language === "pt" ? "Onde fica a Savassi?" : "Where is Savassi?",
                  language === "pt" ? "Tem pão vegano?" : "Any vegan bread?"
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="px-2 py-1 bg-stone-200 dark:bg-stone-900 hover:bg-[#D9A347]/10 hover:text-[#D9A347] text-[9px] rounded-full shrink-0 border border-stone-300 dark:border-stone-800 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendMessage} className="flex gap-1.5 shrink-0">
                <input
                  type="text"
                  placeholder={t.chatPlaceholder}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-[#D9A347] ${
                    theme === "dark" ? "bg-stone-950 border-stone-800 text-white" : "bg-white border-stone-200 text-stone-800"
                  }`}
                />
                <button
                  type="submit"
                  className="bg-[#D9A347] text-stone-950 p-1.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </aside>
        </div>

        {/* BOTTOM FOOTER SECTION (Dashboard and achievements list bar) */}
        <footer className={`h-24 md:h-20 border-t px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-0 transition-colors ${
          theme === "dark" ? "border-[#2A2620] bg-[#0F0F0D]" : "border-[#E7E5E4] bg-[#FAF9F6]"
        }`}>
          <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono opacity-50 uppercase">{t.achievementsTitle}</span>
              <div className="flex gap-1.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    onClick={() => ach.unlocked && openShareModal(ach)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs cursor-pointer transition-all ${
                      ach.unlocked
                        ? "border-[#D9A347] bg-[#D9A347]/10 shadow-sm"
                        : "border-stone-300 dark:border-stone-800 opacity-25 hover:opacity-45"
                    }`}
                    title={language === "pt" ? ach.title.pt : ach.title.en}
                  >
                    {ach.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 md:gap-8 items-center justify-center">
            {/* View stats/menu switch button */}
            <button
              onClick={() => setActiveTab(activeTab === "menu" ? "dashboard" : "menu")}
              className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-[9px] font-mono tracking-widest uppercase font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#D9A347] text-stone-950 border-[#D9A347]"
                  : "bg-transparent hover:border-[#D9A347] border-stone-300 dark:border-stone-800"
              }`}
            >
              <span>{activeTab === "dashboard" ? t.backMenu : t.tabDashboard}</span>
              <TrendingUp className="w-3 h-3" />
            </button>
            <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest hidden md:block">
              © 2026 Pão de Ouro S/A • Belo Horizonte
            </div>
          </div>
        </footer>
      </div>

      {/* BIOMETRIC AUTH COMPONENT DIALOG */}
      <BiometricAuth
        isOpen={isBiometricOpen}
        language={language}
        onClose={() => setIsBiometricOpen(false)}
        onSuccess={handleBiometricSuccess}
      />

      {/* NATIVE-LIKE SOCIAL SHARE MODAL */}
      <AnimatePresence>
        {isShareModalOpen && selectedAchievementToShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md overflow-hidden border rounded-3xl shadow-2xl p-6 ${
                theme === "dark" ? "bg-[#1A1814] border-[#2A2620] text-[#E8E4D9]" : "bg-white border-stone-200 text-[#1C1917]"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                  {t.socialShare}
                </span>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Visual achievement card mockup */}
              <div className="bg-gradient-to-br from-[#0F0F0D] to-[#25221B] text-white p-6 rounded-2xl border border-stone-800 text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#D9A347]/10 flex items-center justify-center text-4xl mx-auto mb-4 border border-[#D9A347]/30">
                  {selectedAchievementToShare.icon}
                </div>
                <h4 className="font-serif text-2xl font-black text-[#D9A347] italic">
                  {selectedAchievementToShare.title[language]}
                </h4>
                <p className="text-xs text-stone-300 mt-2">
                  {selectedAchievementToShare.description[language]}
                </p>
                <div className="inline-flex items-center gap-1 text-[9px] font-mono uppercase font-bold text-stone-400 bg-stone-900 px-3 py-1 rounded-full mt-4 border border-stone-800">
                  <Coins className="w-3 h-3 text-[#D9A347]" /> +{selectedAchievementToShare.pointsAwarded} pts de queijo
                </div>
              </div>

              <p className="text-xs opacity-75 mb-4 text-center">
                Compartilhe sua conquista nas redes sociais e mostre que você é fã de pão de queijo artesanal!
              </p>

              <div className="grid grid-cols-3 gap-3">
                {["twitter", "facebook", "whatsapp"].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => handleShareOnSocial(plat as any)}
                    className="py-3 px-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-[#D9A347] transition-all text-xs font-bold uppercase font-mono flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#D9A347]" />
                    {plat === "twitter" && "Twitter"}
                    {plat === "facebook" && "Facebook"}
                    {plat === "whatsapp" && "WhatsApp"}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
