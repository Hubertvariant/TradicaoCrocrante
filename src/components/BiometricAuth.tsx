import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Fingerprint, ShieldCheck, ShieldAlert, Check, RefreshCw } from "lucide-react";
import { Language } from "../types";
import { TRANSLATIONS } from "../data";

interface BiometricAuthProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  language: Language;
}

export default function BiometricAuth({ isOpen, onSuccess, onClose, language }: BiometricAuthProps) {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "failed">("idle");
  const [progress, setProgress] = useState(0);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (isOpen) {
      setScanState("idle");
      setProgress(0);
    }
  }, [isOpen]);

  const handleScan = () => {
    setScanState("scanning");
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // 90% chance of success for smooth demo, 10% chance of failing to show error flow
          const isSuccess = Math.random() > 0.1;
          if (isSuccess) {
            setScanState("success");
            setTimeout(() => {
              onSuccess();
            }, 1000);
          } else {
            setScanState("failed");
          }
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm overflow-hidden border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 text-center"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono tracking-widest text-stone-400 uppercase">
              SECURE BIOMETRICS v2.4
            </span>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 font-sans tracking-tight">
            {t.biometricsTitle}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
            {scanState === "idle" && t.biometricsUnlock}
            {scanState === "scanning" && t.biometricsLoading}
            {scanState === "success" && t.biometricsSuccess}
            {scanState === "failed" && "Biometric scan failed. Try again."}
          </p>

          <div className="relative my-8 flex items-center justify-center">
            {/* Outer spinning ring when scanning */}
            <div className="absolute w-40 h-40 rounded-full border-2 border-stone-100 dark:border-stone-800" />
            
            {scanState === "scanning" && (
              <svg className="absolute w-40 h-40 -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="76"
                  className="stroke-amber-500 stroke-[4] fill-none"
                  strokeDasharray="477"
                  strokeDashoffset={477 - (477 * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Inner scanning module */}
            <motion.div
              onClick={scanState === "idle" || scanState === "failed" ? handleScan : undefined}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                scanState === "scanning"
                  ? "bg-amber-50 dark:bg-amber-950/20 text-amber-500"
                  : scanState === "success"
                  ? "bg-emerald-500 text-white"
                  : scanState === "failed"
                  ? "bg-rose-500 text-white"
                  : "bg-stone-50 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-stone-400 hover:text-amber-500"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Scan Line effect */}
              {scanState === "scanning" && (
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-amber-400/80 shadow-lg shadow-amber-500"
                  initial={{ top: "10%" }}
                  animate={{ top: "90%" }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                />
              )}

              {scanState === "idle" && <Fingerprint className="w-16 h-16 animate-pulse" />}
              {scanState === "scanning" && <Fingerprint className="w-16 h-16 opacity-40" />}
              {scanState === "success" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Check className="w-16 h-16 stroke-[3]" />
                </motion.div>
              )}
              {scanState === "failed" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <ShieldAlert className="w-16 h-16" />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Prompt info */}
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 flex items-center gap-3 text-left">
            {scanState === "success" ? (
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <div className="text-xs">
              <p className="font-semibold text-stone-700 dark:text-stone-300">
                {t.biometricsStatus}
              </p>
              <p className="text-stone-400 mt-0.5">
                Sha-256 encrypted local secure enclave matching
              </p>
            </div>
          </div>

          {scanState === "failed" && (
            <button
              onClick={handleScan}
              className="mt-4 flex items-center justify-center gap-2 mx-auto text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try scanning again
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
