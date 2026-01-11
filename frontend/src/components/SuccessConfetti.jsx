import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, Zap, DollarSign, Check, Trophy } from 'lucide-react';

const SuccessConfetti = ({ dfmScore, cost, onComplete }) => {
    const [badges, setBadges] = useState([]);
    const [showBadges, setShowBadges] = useState(false);

    useEffect(() => {
        // Trigger multiple confetti bursts
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        // Multi-burst confetti
        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            // Left burst
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
            });

            // Right burst
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
            });
        }, 250);

        // Fireworks effect
        setTimeout(() => {
            confetti({
                particleCount: 100,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#667eea', '#764ba2']
            });
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#f093fb', '#4facfe']
            });
        }, 500);

        // Determine achievements
        const achievedBadges = [];

        if (dfmScore >= 90) {
            achievedBadges.push({
                id: 'dfm_excellent',
                icon: <Trophy className="w-6 h-6" />,
                title: 'Design Excellence!',
                subtitle: `DFM Score: ${dfmScore}/100`,
                color: 'from-yellow-400 to-orange-500'
            });
        }

        if (cost && cost < 100) {
            achievedBadges.push({
                id: 'budget_friendly',
                icon: <DollarSign className="w-6 h-6" />,
                title: 'Budget-Friendly!',
                subtitle: `Cost: ₹${cost}`,
                color: 'from-green-400 to-emerald-500'
            });
        }

        achievedBadges.push({
            id: 'generated',
            icon: <Check className="w-6 h-6" />,
            title: 'Model Generated!',
            subtitle: 'Ready to download',
            color: 'from-blue-400 to-indigo-500'
        });

        setBadges(achievedBadges);

        // Show badges after initial confetti
        setTimeout(() => setShowBadges(true), 800);

        // Auto-hide after duration
        setTimeout(() => {
            if (onComplete) onComplete();
        }, 4000);

        return () => {
            clearInterval(interval);
        };
    }, [dfmScore, cost, onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center">
            <AnimatePresence>
                {showBadges && badges.length > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex flex-col gap-3 pointer-events-auto"
                    >
                        {badges.map((badge, index) => (
                            <motion.div
                                key={badge.id}
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                transition={{ delay: index * 0.15, type: "spring", damping: 15 }}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r ${badge.color} text-white shadow-2xl`}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
                                >
                                    {badge.icon}
                                </motion.div>
                                <div>
                                    <div className="font-bold text-lg">{badge.title}</div>
                                    <div className="text-sm opacity-90">{badge.subtitle}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SuccessConfetti;
