"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, Calendar, CreditCard, ArrowRight, Download, XCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useSubscriptionInfo } from "@/app/hooks/useSubscriptionInfo";
import { ProcessingAnimation } from "@/components/ProcessingAnimation";

export default function SuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const { subscriptionInfo, loading, error } = useSubscriptionInfo();

  // Debug logs for component state
  useEffect(() => {
    console.log('🔄 Component State:', {
      isProcessing,
      loading,
      error,
      hasSubscriptionInfo: !!subscriptionInfo,
      subscriptionDetails: subscriptionInfo?.subscription
    });
  }, [isProcessing, loading, error, subscriptionInfo]);

  // Processing delay with logs
  useEffect(() => {
    console.log('⏳ Starting processing delay...');
    const timer = setTimeout(() => {
      console.log('✅ Processing delay completed');
      setIsProcessing(false);
    }, 4000);

    return () => {
      console.log('🧹 Cleaning up timer');
      clearTimeout(timer);
    };
  }, []);

  // Log when showing processing animation
  if (isProcessing) {
    console.log('🔄 Showing processing animation');
    return <ProcessingAnimation />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Log loading state
  if (loading) {
    console.log('⌛ Component in loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // First check for actual errors
  if (error) {
    console.error('❌ Error state:', { error, timestamp: new Date().toISOString() });
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 mb-4">
            <XCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al cargar la información</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
          <div className="space-y-4">
            <Link
              href="/billing"
              className="block w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Volver al Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle FREE plan case
  if (subscriptionInfo?.currentPlan === "FREE") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="mx-auto w-20 h-20 mb-6">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Plan Activado!
            </h1>
            <p className="text-gray-600">
              Tu plan gratuito está activo y listo para usar
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Plan Actual</span>
              </div>
              <span className="text-lg font-semibold text-blue-600">
                Plan Gratuito
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{subscriptionInfo.limits.maxWhatsappNumbers} número de WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Límite de {subscriptionInfo.limits.maxMessages} mensajes</span>
              </div>
              {Object.entries(subscriptionInfo.features)
                .filter(([_, enabled]) => enabled)
                .map(([feature]) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{formatFeatureName(feature)}</span>
                  </div>
                ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/billling"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-lg"
            >
              Ir al Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/billing"
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-lg font-medium"
            >
              Ver Planes Premium
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Check for missing subscription data
  if (!subscriptionInfo?.subscription) {
    console.error('❌ No subscription data found');
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 mb-4">
            <XCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al cargar la información</h2>
            <p className="text-gray-600 mb-4">
              No se pudo obtener la información de tu suscripción. Por favor, intenta nuevamente.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href="/billing"
              className="block w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Volver al Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { subscription } = subscriptionInfo;
  
  // Log successful render
  console.log('✅ Rendering success state:', {
    planName: subscription.planName,
    amount: subscription.amount,
    nextPaymentDate: subscription.nextPaymentDate,
    clientName: subscription.details.clientName
  });

  // Add logs to actions
  const handlePrint = () => {
    console.log('🖨️ Initiating print action');
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full"
      >
        {/* Success Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <div className="mx-auto w-20 h-20 mb-6 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -right-1 -bottom-1 bg-blue-500 text-white p-1 rounded-full"
            >
              <CheckCircle className="w-4 h-4" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Suscripción Activada!
          </h1>
          <p className="text-gray-600">
            Tu plan ha sido activado correctamente
          </p>
        </motion.div>

        {/* Subscription Details */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4"
        >
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Plan Actual</span>
            </div>
            <span className="text-lg font-semibold text-blue-600">
              {subscription.planName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Método de Pago</span>
            <span className="font-medium">{subscription.paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monto</span>
            <span className="font-semibold">
              {formatCurrency(subscription.amount, subscription.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Próximo Pago</span>
            </div>
            <span className="font-medium">
              {formatDate(subscription.nextPaymentDate)}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cliente</span>
              <span className="font-medium">{subscription.details.clientName}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Documento</span>
              <span className="font-medium">
                {subscription.details.documentType}: {subscription.details.documentNumber}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Link
            href="/billing"
            onClick={() => console.log('🔙 Navigating to billing dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            Ir al Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-500 text-blue-500 rounded-lg font-medium transform transition-all duration-200 hover:bg-blue-50"
          >
            <Download className="w-4 h-4" />
            Descargar Comprobante
          </button>
        </motion.div>

        {/* Support Info */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>¿Necesitas ayuda? Contáctanos en</p>
          <a 
            href="mailto:contacto@botopia.tech" 
            onClick={() => console.log('📧 Support email click')}
            className="text-blue-500 hover:text-blue-600"
          >
            contacto@botopia.tech
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Helper function to format feature names
function formatFeatureName(feature: string): string {
  const featureNames: Record<string, string> = {
    canAddWhatsapp: "Agregar WhatsApp",
    canSendMessages: "Enviar mensajes",
    canUseAI: "Usar IA",
    canCreateTemplates: "Crear plantillas"
  };
  return featureNames[feature] || feature;
}