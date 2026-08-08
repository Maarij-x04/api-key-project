import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'rounded-xl px-5 py-2.5 font-body font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary text-white hover:brightness-110 shadow-[0_0_24px_rgba(255,59,107,0.25)]',
    secondary: 'glass text-text-primary hover:bg-white/[0.07]',
    danger: 'bg-danger text-white hover:brightness-110',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}