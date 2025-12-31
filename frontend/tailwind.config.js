/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neonc': '#00f0ff',
                'neonp': '#b026ff',
                'neong': '#10b981',
                'neona': '#f59e0b',
                'neonr': '#dc3545',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'slide-up': 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'fade-in': 'fadeIn 0.3s ease',
                'shake': 'shake 0.5s',
            },
            keyframes: {
                slideUp: {
                    'from': { transform: 'translateY(20px)', opacity: '0' },
                    'to': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                }
            }
        },
    },
    plugins: [],
}
