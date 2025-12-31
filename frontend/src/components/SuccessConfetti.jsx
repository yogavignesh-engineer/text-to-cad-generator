import React from 'react';

// ===== CONFETTI EFFECT =====
export default function SuccessConfetti() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-[10px] h-[10px]"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '-20px',
                        background: `hsl(${Math.random() * 360}, 100%, 60%)`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                        animation: `confettiFall ${2 + Math.random() * 2}s linear forwards`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        transform: `rotate(${Math.random() * 360}deg)`
                    }}
                />
            ))}
            <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
        </div>
    );
}
