import { motion } from 'framer-motion';
import { Calendar, CreditCard, CheckCircle } from 'lucide-react';
import { useSubscriptionInfo } from '@/app/hooks/useSubscriptionInfo';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, CreditCard } from 'lucide-react';

export function SubscriptionDashboard() {
  const { subscriptionInfo, loading, error } = useSubscriptionInfo();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  if (!subscriptionInfo) return null;

  return (
    <div className="space-y-6">
      {/* Tarjeta de Estado del Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#411E8A] to-indigo-700 rounded-2xl p-6 text-white shadow-xl"
      >
        <h3 className="text-2xl font-bold mb-2">
          Plan {subscriptionInfo.currentPlan}
        </h3>
        <p className="text-blue-100">
          Última actualización: {formatDate(subscriptionInfo.lastUpdated)}
        </p>
      </motion.div>

      {subscriptionInfo.subscription && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detalles de Pago */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#411E8A]" />
              <h4 className="text-lg font-semibold">Detalles de Pago</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto</span>
                <span className="font-medium">
                  {formatCurrency(
                    subscriptionInfo.subscription.amount,
                    subscriptionInfo.subscription.currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Método de Pago</span>
                <span className="font-medium">
                  {subscriptionInfo.subscription.paymentMethod}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Calendario de Facturación */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-[#411E8A]" />
              <h4 className="text-lg font-semibold">Calendario de Facturación</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Próximo Pago</span>
                <span className="font-medium">
                  {formatDate(subscriptionInfo.subscription.nextPaymentDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Último Pago</span>
                <span className="font-medium">
                  {formatDate(subscriptionInfo.subscription.lastPaymentDate)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Información del Cliente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#411E8A]" />
              <h4 className="text-lg font-semibold">Información del Cliente</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 block">Nombre</span>
                <span className="font-medium">
                  {subscriptionInfo.subscription.details.clientName}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block">Documento</span>
                <span className="font-medium">
                  {subscriptionInfo.subscription.details.documentType}:{' '}
                  {subscriptionInfo.subscription.details.documentNumber}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}