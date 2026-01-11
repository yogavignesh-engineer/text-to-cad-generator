import React, { useState, useEffect, useRef, useCallback, memo, Suspense, lazy } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Cpu, Box, Layers, Zap, Sparkles, Code, Settings, FileCode, Sliders, DollarSign, Shield, Send, Mail, Github, Linkedin, Twitter, Youtube, Instagram, ChevronDown, Eye, Download, Printer, Wrench, Factory, GraduationCap, Plus, Users, Star, Play } from 'lucide-react';
import Lenis from 'lenis';

const Spline = lazy(() => import('@splinetool/react-spline'));

// ============= LENIS =============
const useLenis = () => {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.8 });
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

// ============= EASING =============
const EASE = [0.16, 1, 0.3, 1];
const EASE_ELASTIC = [0.68, -0.6, 0.32, 1.6];

// ============= FLOATING ELEMENT (Unique micro-animation) =============
const Float = memo(({ children, delay = 0, duration = 4, y = 15, className = "" }) => (
    <motion.div
        className={className}
        animate={{ y: [-y, y, -y] }}
        transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
        {children}
    </motion.div>
));

// ============= MAGNETIC ELEMENT =============
const Magnetic = memo(({ children, className = "", strength = 0.3 }) => {
    const ref = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const handleMove = (e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: (e.clientX - rect.left - rect.width / 2) * strength, y: (e.clientY - rect.top - rect.height / 2) * strength });
    };
    return (
        <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={() => setPos({ x: 0, y: 0 })}
            animate={{ x: pos.x, y: pos.y }} transition={{ type: "spring", stiffness: 200, damping: 10 }} className={className}>
            {children}
        </motion.div>
    );
});

// ============= REVEAL ANIMATIONS =============
const Reveal = memo(({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 60, filter: "blur(15px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}} transition={{ duration: 1, delay, ease: EASE }}>
            {children}
        </motion.div>
    );
});

// ============= SPLIT TEXT (Letter reveal with rotation) =============
const SplitText = memo(({ children, className = "", delay = 0, stagger = 0.04 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    return (
        <span ref={ref} className={className}>
            {children.split("").map((char, i) => (
                <motion.span key={i} className="inline-block" style={{ transformOrigin: "bottom center" }}
                    initial={{ opacity: 0, y: "100%", rotateX: -90, filter: "blur(10px)" }}
                    animate={isInView ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" } : {}}
                    transition={{ duration: 0.8, delay: delay + i * stagger, ease: EASE }}>
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </span>
    );
});

// ============= SCALE POP =============
const ScalePop = memo(({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    return (
        <motion.div ref={ref} className={className} initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}} transition={{ duration: 0.8, delay, ease: EASE_ELASTIC }}>
            {children}
        </motion.div>
    );
});

// ============= SLIDE FROM =============
const SlideFrom = memo(({ children, direction = "left", delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const variants = {
        left: { x: -100, opacity: 0 },
        right: { x: 100, opacity: 0 },
        top: { y: -100, opacity: 0 },
        bottom: { y: 100, opacity: 0 },
    };
    return (
        <motion.div ref={ref} className={className} initial={variants[direction]}
            animate={isInView ? { x: 0, y: 0, opacity: 1 } : {}} transition={{ duration: 1, delay, ease: EASE }}>
            {children}
        </motion.div>
    );
});

// ============= STAGGER =============
const Stagger = memo(({ children, className = "", delay = 0.2 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    return (
        <motion.div ref={ref} className={className} initial="hidden" animate={isInView ? "visible" : "hidden"}
            variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: delay } } }}>
            {children}
        </motion.div>
    );
});

const StaggerItem = memo(({ children, className = "" }) => (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 40, filter: "blur(8px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } } }}>
        {children}
    </motion.div>
));

// ============= FEATURE CARD =============
const FeatureCard = memo(({ icon, title, description }) => {
    const [hover, setHover] = useState(false);
    return (
        <motion.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} whileHover={{ y: -8, scale: 1.02 }}
            className="relative p-6 bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden group">
            <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 to-transparent" animate={{ opacity: hover ? 1 : 0 }} />
            <motion.div animate={{ y: hover ? -5 : 0, scale: hover ? 1.15 : 1, rotate: hover ? 5 : 0 }}
                className="relative w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 mb-4">{icon}</motion.div>
            <h3 className="relative text-base font-bold text-white mb-2">{title}</h3>
            <p className="relative text-sm text-gray-400 leading-relaxed">{description}</p>
        </motion.div>
    );
});

// ============= USE CASE CARD =============
const UseCaseCard = memo(({ icon, title, description, stats }) => (
    <motion.div whileHover={{ y: -10, rotateY: 5 }} style={{ transformPerspective: 1000 }}
        className="p-8 bg-gradient-to-br from-[#0a0a12] to-[#0a0a0f] rounded-3xl border border-white/10 hover:border-blue-500/30 transition-all">
        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}
            className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">{icon}</motion.div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-4">
            {stats.map((s, i) => (
                <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{s.value}</div>
                    <div className="text-xs text-gray-500 uppercase">{s.label}</div>
                </div>
            ))}
        </div>
    </motion.div>
));

// ============= FAQ ITEM =============
const FAQItem = memo(({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <motion.div className="border-b border-white/10 last:border-0">
            <button onClick={() => setOpen(!open)} className="w-full py-6 flex items-center justify-between text-left group">
                <span className="text-lg font-medium text-white pr-8 group-hover:text-blue-400 transition-colors">{question}</span>
                <motion.div animate={{ rotate: open ? 45 : 0, scale: open ? 1.2 : 1 }} className="flex-shrink-0 text-blue-400">
                    <Plus className="w-5 h-5" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="pb-6 text-gray-400 leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

// ============= FLOATING BADGE =============
const FloatingBadge = memo(({ children, className = "", delay = 0, x = 0, y = 0 }) => (
    <Float delay={delay} duration={3 + Math.random() * 2}>
        <Magnetic strength={0.2}>
            <motion.div
                initial={{ opacity: 0, scale: 0, x: x - 50, y: y + 50 }}
                animate={{ opacity: 1, scale: 1, x, y }}
                transition={{ duration: 1.2, delay: delay + 1.5, ease: EASE_ELASTIC }}
                className={`absolute ${className}`}
            >
                {children}
            </motion.div>
        </Magnetic>
    </Float>
));

// ============= SPLINE LOADER =============
const SplineLoader = () => (
    <div className="w-full h-full flex items-center justify-center">
        <motion.div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
    </div>
);

// ============= GEAR DECORATION =============
const GearDecoration = memo(({ className, size = 200 }) => (
    <motion.svg viewBox="0 0 100 100" width={size} height={size} className={className} animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}>
        <path fill="currentColor" d="M50 10c-1.7 0-3.3.1-5 .3V5h-4v6.2c-3.3.8-6.4 2-9.3 3.6l-3.1-5.4-3.5 2 3.1 5.4c-2.6 2-4.9 4.3-6.9 6.9l-5.4-3.1-2 3.5 5.4 3.1c-1.6 2.9-2.8 6-3.6 9.3H10v4h6.2c-.2 1.7-.3 3.3-.3 5s.1 3.3.3 5H10v4h6.2c.8 3.3 2 6.4 3.6 9.3l-5.4 3.1 2 3.5 5.4-3.1c2 2.6 4.3 4.9 6.9 6.9l-3.1 5.4 3.5 2 3.1-5.4c2.9 1.6 6 2.8 9.3 3.6V95h4v-6.2c1.7.2 3.3.3 5 .3s3.3-.1 5-.3V95h4v-6.2c3.3-.8 6.4-2 9.3-3.6l3.1 5.4 3.5-2-3.1-5.4c2.6-2 4.9-4.3 6.9-6.9l5.4 3.1 2-3.5-5.4-3.1c1.6-2.9 2.8-6 3.6-9.3H90v-4h-6.2c.2-1.7.3-3.3.3-5s-.1-3.3-.3-5H90v-4h-6.2c-.8-3.3-2-6.4-3.6-9.3l5.4-3.1-2-3.5-5.4 3.1c-2-2.6-4.3-4.9-6.9-6.9l3.1-5.4-3.5-2-3.1 5.4c-2.9-1.6-6-2.8-9.3-3.6V5h-4v6.2c-1.7-.2-3.3-.3-5-.3zm0 20c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z" />
    </motion.svg>
));

// ============= MAIN PAGE =============
const LandingPage = ({ onStart }) => {
    useLenis();
    const [isExiting, setIsExiting] = useState(false);

    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    const handleLaunch = useCallback(() => { setIsExiting(true); setTimeout(onStart, 600); }, [onStart]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }}
            className="min-h-screen bg-black text-white font-sans overflow-x-hidden">

            {/* DECORATIONS */}
            <GearDecoration className="fixed top-[-80px] left-[-80px] text-gray-500 opacity-[0.03]" size={350} />
            <GearDecoration className="fixed bottom-[-150px] right-[-150px] text-gray-500 opacity-[0.03]" size={500} />

            {/* ============= NAVBAR (Inspired by Formo) ============= */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: EASE }}
                className="fixed top-0 w-full z-50"
            >
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between bg-[#0a0a0f]/80 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/10">
                        {/* Logo */}
                        <Magnetic>
                            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Cpu className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold">Neural<span className="text-blue-400">CAD</span></span>
                            </motion.div>
                        </Magnetic>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {['Features', 'Architecture', 'About', 'FAQ'].map((item, i) => (
                                <motion.button
                                    key={item}
                                    onClick={() => scrollTo(item.toLowerCase())}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg transition-colors"
                                >
                                    {item}
                                </motion.button>
                            ))}
                        </div>

                        {/* CTA */}
                        <Magnetic strength={0.15}>
                            <motion.button
                                onClick={handleLaunch}
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59,130,246,0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl flex items-center gap-2"
                            >
                                Try Now <Play className="w-4 h-4" />
                            </motion.button>
                        </Magnetic>
                    </div>
                </div>
            </motion.nav>

            {/* ============= HERO (Formo Studio Style) ============= */}
            <section className="min-h-screen flex items-center justify-center px-8 pt-32 pb-20 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: EASE }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-gradient-radial from-blue-900/30 via-transparent to-transparent rounded-full blur-3xl"
                    />
                </div>

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    {/* Split Headline Container */}
                    <div className="relative">
                        {/* LEFT SIDE TEXT */}
                        <SlideFrom direction="left" delay={0.5}>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
                                <h1 className="text-[8vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter">
                                    <SplitText delay={0.8}>Neural</SplitText>
                                </h1>
                                <ScalePop delay={1.5} className="mt-4">
                                    <span className="text-lg md:text-xl text-gray-400 block max-w-xs">
                                        AI-Powered CAD. Generate production-ready 3D models from text.
                                    </span>
                                </ScalePop>
                                <ScalePop delay={1.8} className="mt-6">
                                    <Magnetic>
                                        <motion.button
                                            onClick={handleLaunch}
                                            whileHover={{ scale: 1.05, x: 5 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center gap-3 transition-colors"
                                        >
                                            <span>Explore App</span>
                                            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                                <ArrowRight className="w-5 h-5" />
                                            </motion.span>
                                        </motion.button>
                                    </Magnetic>
                                </ScalePop>
                            </div>
                        </SlideFrom>

                        {/* CENTER 3D MODEL */}
                        <div className="flex justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                transition={{ duration: 1.5, delay: 0.3, ease: EASE }}
                                className="w-[50vw] h-[60vh] min-h-[400px] max-w-[600px] relative"
                            >
                                <Suspense fallback={<SplineLoader />}>
                                    <Spline scene="https://prod.spline.design/szJhMTL2Y4gq94je/scene.splinecode" />
                                </Suspense>
                            </motion.div>
                        </div>

                        {/* RIGHT SIDE TEXT */}
                        <SlideFrom direction="right" delay={0.7}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-right z-20">
                                <h1 className="text-[8vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter">
                                    <SplitText delay={1}>CAD</SplitText>
                                </h1>
                                <ScalePop delay={1.7} className="mt-4">
                                    <span className="text-lg md:text-xl text-gray-400 block max-w-xs ml-auto">
                                        FreeCAD + Gemini AI. Industrial-grade B-Rep geometry.
                                    </span>
                                </ScalePop>
                            </div>
                        </SlideFrom>

                        {/* FLOATING BADGES */}
                        <FloatingBadge delay={0.5} className="top-10 left-[15%]">
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="px-4 py-2 bg-[#0a0a0f]/90 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-medium">8s Generation</span>
                            </motion.div>
                        </FloatingBadge>

                        <FloatingBadge delay={0.8} className="top-20 right-[12%]">
                            <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="px-4 py-2 bg-[#0a0a0f]/90 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                                <Star className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium">50+ Shapes</span>
                            </motion.div>
                        </FloatingBadge>

                        <FloatingBadge delay={1.1} className="bottom-20 left-[20%]">
                            <motion.div whileHover={{ scale: 1.1 }} className="px-4 py-3 bg-[#0a0a0f]/90 backdrop-blur-xl rounded-xl border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {['bg-blue-500', 'bg-indigo-500', 'bg-purple-500'].map((c, i) => (
                                            <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-black flex items-center justify-center text-xs font-bold`}>
                                                {['Y', 'V', 'S'][i]}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">100+ Engineers</span>
                                </div>
                            </motion.div>
                        </FloatingBadge>

                        <FloatingBadge delay={1.4} className="bottom-32 right-[18%]">
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                <Download className="w-6 h-6 text-white" />
                            </motion.div>
                        </FloatingBadge>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
                    onClick={() => scrollTo('features')}
                >
                    <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <ChevronDown className="w-8 h-8 text-gray-500" />
                    </motion.div>
                </motion.div>
            </section>

            {/* ============= FEATURES ============= */}
            <section id="features" className="py-32 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <Reveal><span className="text-blue-400 text-sm font-medium uppercase tracking-widest">Core Features</span></Reveal>
                        <h2 className="text-5xl md:text-6xl font-black mt-4"><SplitText>Powerful Capabilities</SplitText></h2>
                        <Reveal delay={0.3}><p className="text-gray-400 mt-4 max-w-xl mx-auto">Everything you need to go from idea to manufactured part.</p></Reveal>
                    </div>

                    <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: <Code className="w-6 h-6" />, title: "Natural Language", desc: "Describe parts in plain English." },
                            { icon: <Cpu className="w-6 h-6" />, title: "Gemini AI", desc: "Advanced AI extracts dimensions." },
                            { icon: <Box className="w-6 h-6" />, title: "FreeCAD B-Rep", desc: "Industrial-grade geometry engine." },
                            { icon: <Eye className="w-6 h-6" />, title: "3D Preview", desc: "Interactive Three.js viewer." },
                            { icon: <Sliders className="w-6 h-6" />, title: "Live Editing", desc: "Real-time dimension tweaking." },
                            { icon: <DollarSign className="w-6 h-6" />, title: "Cost Estimation", desc: "Live ₹ pricing." },
                            { icon: <Download className="w-6 h-6" />, title: "Export", desc: "STL, STEP, DXF formats." },
                            { icon: <Shield className="w-6 h-6" />, title: "DFM Validation", desc: "Manufacturability checks." },
                            { icon: <Layers className="w-6 h-6" />, title: "50+ Shapes", desc: "Gears, bolts, assemblies." },
                        ].map((f, i) => (
                            <StaggerItem key={i}><FeatureCard icon={f.icon} title={f.title} description={f.desc} /></StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </section>

            {/* ============= USE CASES ============= */}
            <section className="py-32 px-8 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <Reveal><span className="text-blue-400 text-sm font-medium uppercase tracking-widest">Use Cases</span></Reveal>
                        <h2 className="text-5xl md:text-6xl font-black mt-4"><SplitText>Who Is This For?</SplitText></h2>
                    </div>
                    <Stagger className="grid md:grid-cols-3 gap-8">
                        <StaggerItem><UseCaseCard icon={<Printer className="w-7 h-7" />} title="3D Printing" description="Generate printable models in seconds." stats={[{ value: '8s', label: 'Gen' }, { value: '100%', label: 'Print' }]} /></StaggerItem>
                        <StaggerItem><UseCaseCard icon={<Factory className="w-7 h-7" />} title="Manufacturing" description="Rapid quoting with STEP export." stats={[{ value: '₹', label: 'Live' }, { value: 'STEP', label: 'CNC' }]} /></StaggerItem>
                        <StaggerItem><UseCaseCard icon={<GraduationCap className="w-7 h-7" />} title="Students" description="Learn parametric design free." stats={[{ value: 'Free', label: 'Open' }, { value: '∞', label: 'Use' }]} /></StaggerItem>
                    </Stagger>
                </div>
            </section>

            {/* ============= ARCHITECTURE ============= */}
            <section id="architecture" className="py-32 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <Reveal><span className="text-blue-400 text-sm font-medium uppercase tracking-widest">System Architecture</span></Reveal>
                        <h2 className="text-5xl md:text-6xl font-black mt-4"><SplitText>How It Works</SplitText></h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-16">
                        <Stagger className="space-y-8">
                            {[
                                { n: 1, icon: <Code className="w-4 h-4" />, title: 'Natural Language', desc: 'Describe your part.' },
                                { n: 2, icon: <Cpu className="w-4 h-4" />, title: 'AI Parsing', desc: 'Gemini extracts dims.' },
                                { n: 3, icon: <Settings className="w-4 h-4" />, title: 'FreeCAD Gen', desc: 'B-Rep geometry created.' },
                                { n: 4, icon: <FileCode className="w-4 h-4" />, title: 'Export', desc: 'Download STL/STEP.' },
                            ].map((s, i) => (
                                <StaggerItem key={i}>
                                    <motion.div whileHover={{ x: 10 }} className="flex gap-4 items-start group">
                                        <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{s.n}</motion.div>
                                        <div><div className="flex items-center gap-2 text-blue-400">{s.icon}<h4 className="font-bold text-white">{s.title}</h4></div><p className="text-sm text-gray-400">{s.desc}</p></div>
                                    </motion.div>
                                </StaggerItem>
                            ))}
                        </Stagger>
                        <Reveal delay={0.3} className="bg-gradient-to-br from-[#0a0a12] to-[#0a0a0f] rounded-3xl p-8 border border-white/10">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><Box className="w-5 h-5 text-blue-400" /> Tech Stack</h3>
                            <div className="space-y-3">
                                {[['Frontend', 'React + Three.js'], ['Backend', 'Python + FastAPI'], ['CAD', 'FreeCAD'], ['AI', 'Gemini'], ['Export', 'STL/STEP/DXF']].map(([k, v]) => (
                                    <div key={k} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                                        <span className="text-gray-500">{k}</span><span className="text-white">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ============= ABOUT ============= */}
            <section id="about" className="py-32 px-8 relative">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-5 gap-12 items-center">
                        <div className="md:col-span-2">
                            <ScalePop>
                                <div className="relative">
                                    <motion.div whileHover={{ scale: 1.05, rotate: 2 }} className="w-full aspect-square bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-3xl flex items-center justify-center">
                                        <div className="text-center">
                                            <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-black mx-auto mb-4">YV</motion.div>
                                            <div className="text-xl font-bold">Yoga Vignesh S</div>
                                            <div className="text-sm text-gray-400">Mechanical Engineer</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </ScalePop>
                        </div>
                        <div className="md:col-span-3">
                            <Reveal><span className="text-blue-400 text-sm uppercase tracking-widest">About The Creator</span></Reveal>
                            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6"><SplitText>Meet Yoga Vignesh</SplitText></h2>
                            <Reveal delay={0.2}><p className="text-gray-400 leading-relaxed mb-6">Mechanical Engineering student at NPR College (CGPA: 7.5). NeuralCAD is my vision of instant, intuitive CAD for the AI era.</p></Reveal>
                            <Stagger className="flex flex-wrap gap-2">
                                {['FreeCAD', 'Python', 'React', 'AI/ML', 'CAD/CAM'].map((s, i) => (
                                    <StaggerItem key={i}><motion.span whileHover={{ scale: 1.1, y: -3 }} className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-gray-300 border border-white/10">{s}</motion.span></StaggerItem>
                                ))}
                            </Stagger>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============= FAQ ============= */}
            <section id="faq" className="py-32 px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <Reveal><span className="text-blue-400 text-sm uppercase tracking-widest">FAQ</span></Reveal>
                        <h2 className="text-5xl font-black mt-4"><SplitText>Common Questions</SplitText></h2>
                    </div>
                    <Reveal>
                        <div className="bg-[#0a0a0f] rounded-3xl p-8 border border-white/10">
                            <FAQItem question="Is NeuralCAD free?" answer="Yes! Open source with your own Gemini key." />
                            <FAQItem question="What shapes are supported?" answer="50+ types: boxes, gears, bolts, assemblies..." />
                            <FAQItem question="Can I use commercially?" answer="Absolutely. Your models, your rights." />
                            <FAQItem question="Export formats?" answer="STL, STEP, DXF - all production-ready." />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ============= CTA ============= */}
            <section className="py-40 px-8 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-14">
                        <SplitText className="block">READY TO</SplitText>
                        <SplitText delay={0.5} className="block">BUILD FASTER?</SplitText>
                    </h2>
                    <ScalePop delay={1}>
                        <Magnetic>
                            <motion.button onClick={handleLaunch} whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(59,130,246,0.5)" }} whileTap={{ scale: 0.95 }}
                                className="px-16 py-6 bg-blue-600 text-white text-xl font-bold rounded-2xl inline-flex items-center gap-3 shadow-2xl shadow-blue-600/40">
                                Launch App <ArrowUpRight className="w-6 h-6" />
                            </motion.button>
                        </Magnetic>
                    </ScalePop>
                </div>
            </section>

            {/* ============= FOOTER ============= */}
            <footer className="py-20 px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <Stagger className="grid md:grid-cols-4 gap-12 mb-16">
                        <StaggerItem>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Cpu className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold">NeuralCAD</span>
                            </div>
                            <div className="flex gap-3">
                                {[Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
                                    <motion.a key={i} href="#" whileHover={{ scale: 1.2, y: -4, rotate: 5 }} className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </motion.a>
                                ))}
                            </div>
                        </StaggerItem>
                        {[
                            { title: 'Product', links: [['Features', 'features'], ['Architecture', 'architecture']] },
                            { title: 'Resources', links: [['GitHub', 'https://github.com/yogavignesh']] },
                            { title: 'Connect', links: [['LinkedIn', 'https://linkedin.com/in/yogavigneshmech'], ['Email', 'mailto:yogavigneshs583223114025@nprcolleges.org']] },
                        ].map((s, si) => (
                            <StaggerItem key={si}>
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-6">{s.title}</h4>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    {s.links.map(([l, h], li) => (
                                        <li key={li}>{h.startsWith('http') || h.startsWith('mailto') ? <a href={h} target="_blank" className="hover:text-white">{l}</a> : <button onClick={() => scrollTo(h)} className="hover:text-white">{l}</button>}</li>
                                    ))}
                                </ul>
                            </StaggerItem>
                        ))}
                    </Stagger>
                    <Reveal className="pt-8 border-t border-white/5 text-center text-xs text-gray-500 uppercase tracking-widest">
                        2026 NeuralCAD by Yoga Vignesh S
                    </Reveal>
                </div>
            </footer>
        </motion.div>
    );
};

export default memo(LandingPage);
