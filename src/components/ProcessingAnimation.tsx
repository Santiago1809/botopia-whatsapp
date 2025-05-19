import { motion } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";

export function ProcessingAnimation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.5, 1, 1, 1, 0.5],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: 0,
          }}
          className="relative mx-auto w-24 h-24 mb-6"
        >
          <Shield className="w-24 h-24 text-blue-500" strokeWidth={1} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.5, 1],
              repeat: 0,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-semibold text-gray-800 mb-2"
        >
          Procesando tu Suscripción
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-600"
        >
          Estamos verificando tu pago de manera segura...
        </motion.p>
      </div>
    </div>
  );
}