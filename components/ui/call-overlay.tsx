
"use client";

import { useEffect, useState } from "react";
import { Phone, PhoneOff, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CallOverlayProps {
    isOpen: boolean;
    name: string;
    onEndCall: () => void;
}

export default function CallOverlay({ isOpen, name, onEndCall }: CallOverlayProps) {
    const [status, setStatus] = useState("Calling...");
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setStatus("Calling...");
            setDuration(0);

            // Simulate connecting after 2 seconds
            const connectTimer = setTimeout(() => {
                setStatus("Connected");
            }, 2500);

            return () => clearTimeout(connectTimer);
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && status === "Connected") {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOpen, status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md"
                >
                    <div className="flex flex-col items-center gap-8">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                            />
                            <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 relative z-10">
                                <User className="w-16 h-16 text-slate-400" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-white">{name}</h2>
                            <p className="text-lg text-blue-400 font-medium">
                                {status} {status === "Connected" && `• ${formatTime(duration)}`}
                            </p>
                        </div>

                        <div className="mt-12 flex gap-6">
                            <Button
                                size="lg"
                                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center p-0 shadow-lg shadow-red-900/20"
                                onClick={onEndCall}
                            >
                                <PhoneOff className="w-8 h-8 text-white" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
