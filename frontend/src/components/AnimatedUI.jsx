import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, CheckCircle, AlertCircle, AlertTriangle, 
  Lightbulb, Loader2, Download, FileDown, Package,
  History, Undo2, Redo2, Eye, Settings, DollarSign, Ruler
} from 'lucide-react';

// Animated Card Component
export function AnimatedCard({ children, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 100 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Glassmorphism Panel
export function GlassPanel({ children, darkMode, className = '', ...props }) {
  const styles = {
    background: darkMode 
      ? 'rgba(10, 15, 35, 0.85)' 
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: '32px',
    border: darkMode 
      ? '2px solid rgba(0, 240, 255, 0.15)' 
      : '2px solid rgba(0, 0, 0, 0.1)',
    boxShadow: darkMode 
      ? '0 0 100px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 0 100px rgba(0, 0, 0, 0.1)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={styles}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated Button
export function AnimatedButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  icon: Icon,
  className = '',
  ...props 
}) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
    },
    secondary: {
      background: 'rgba(0, 240, 255, 0.1)',
      border: '1px solid rgba(0, 240, 255, 0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
      boxShadow: '0 10px 30px rgba(220, 53, 69, 0.4)',
    },
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...variants[variant],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        borderRadius: '16px',
        color: 'white',
        fontSize: '0.95rem',
        fontWeight: 700,
        padding: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        transition: 'all 0.3s ease',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        width: '100%',
      }}
      className={className}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
          GENERATING
        </>
      ) : (
        <>
          {Icon && <Icon size={22} />}
          {children}
        </>
      )}
    </motion.button>
  );
}

// Validation Popup with Enhanced Animations
export function EnhancedValidationPopup({ validation, onClose, onProceed, darkMode }) {
  if (!validation || validation.valid) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.95), rgba(200, 35, 51, 0.95))',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(220, 53, 69, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <AlertTriangle size={32} color="#fff" />
            </motion.div>
            <h2 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700, margin: 0 }}>
              {validation.errors ? 'Validation Errors' : 'Warnings & Suggestions'}
            </h2>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            {validation.errors?.map((error, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            ))}
            
            {validation.warnings?.map((warning, i) => (
              <motion.div
                key={`w${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (validation.errors?.length || 0) * 0.1 + i * 0.1 }}
                style={{
                  background: 'rgba(255, 193, 7, 0.2)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <AlertTriangle size={18} />
                {warning}
              </motion.div>
            ))}
            
            {validation.suggestions?.map((suggestion, i) => (
              <motion.div
                key={`s${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: ((validation.errors?.length || 0) + (validation.warnings?.length || 0)) * 0.1 + i * 0.1 
                }}
                style={{
                  background: 'rgba(0, 240, 255, 0.2)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <Lightbulb size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{suggestion}</span>
              </motion.div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Edit Prompt
            </motion.button>
            
            {!validation.errors && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onProceed}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#dc3545',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Proceed Anyway
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Success Confetti Animation
export function SuccessConfetti() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0, 
            y: -20,
            rotate: 0,
            opacity: 1
          }}
          animate={{ 
            y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000,
            rotate: Math.random() * 720,
            opacity: 0
          }}
          transition={{ 
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: `hsl(${Math.random() * 360}, 100%, 60%)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}

// Progress Bar with Animation
export function AnimatedProgressBar({ progress, message, darkMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(176, 38, 255, 0.12)',
        border: '1px solid rgba(176, 38, 255, 0.3)',
        borderRadius: '16px',
        padding: '18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.8rem', color: darkMode ? 'white' : '#1a1a1a', fontWeight: 600 }}>
          {message}
        </span>
        <motion.span 
          key={progress}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          style={{ fontSize: '0.8rem', color: '#b026ff', fontWeight: 700 }}
        >
          {progress}%
        </motion.span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            borderRadius: '10px',
          }}
        />
      </div>
    </motion.div>
  );
}

// Stat Card with Hover Effect
export function StatCard({ icon: Icon, label, value, darkMode, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: darkMode 
          ? 'rgba(10, 15, 35, 0.85)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(30px)',
        border: darkMode 
          ? '1px solid rgba(0, 240, 255, 0.2)' 
          : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: darkMode 
          ? '0 10px 40px rgba(0, 0, 0, 0.5)' 
          : '0 10px 40px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
      }}
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '44px',
          height: '44px',
          background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}
      >
        <Icon size={20} />
      </motion.div>
      <div>
        <div style={{
          fontSize: '0.7rem',
          color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: '2px'
        }}>
          {label}
        </div>
        <motion.div
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: darkMode ? 'white' : '#1a1a1a'
          }}
        >
          {value}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Loading Screen
export function LoadingScreen({ ready }) {
  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '100px',
              height: '100px',
              border: '4px solid rgba(0, 240, 255, 0.1)',
              borderTop: '4px solid #00f0ff',
              borderRadius: '50%',
              boxShadow: '0 0 50px rgba(0, 240, 255, 0.5)'
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: '30px',
              color: '#00f0ff',
              fontSize: '1.2rem',
              letterSpacing: '8px',
              fontWeight: 700
            }}
          >
            NEURALCAD v6.0
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default {
  AnimatedCard,
  GlassPanel,
  AnimatedButton,
  EnhancedValidationPopup,
  SuccessConfetti,
  AnimatedProgressBar,
  StatCard,
  LoadingScreen,
};
