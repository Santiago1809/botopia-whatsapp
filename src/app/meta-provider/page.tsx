/**
 * @file meta-provider-page.tsx
 * @description Página principal para gestionar la integración con Meta Provider (WhatsApp, Facebook, Instagram)
 *
 * Estructura general:
 * - Importaciones y utilidades
 * - Estado y hooks principales
 * - Funciones para cargar y sincronizar datos
 * - Renderizado de UI con pestañas para cada plataforma
 * - Comentarios claros en cada sección
 */

"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { MetaProviderService } from "@/services/meta-provider.service";
import {
  MetaAccount,
  WhatsAppTemplate,
  FacebookPage,
  InstagramAccount,
  MessageLog,
} from "@/services/meta-provider.service";
import InfoMessage from "@/components/ui/InfoMessage";
import { RefreshCw, Trash2, Plus, MessageSquare, Loader } from "lucide-react";

/* import {
  Facebook,
  Instagram,
  ExternalLink,
  Loader2,
} from "@/components/icons/SocialIcons"; */

// Utilidad para formatear fechas en formato legible
const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Icon helpers (replace SocialIcons)
const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "whatsapp":
      return <span className="text-green-600 font-bold mr-1">WA</span>;
    case "facebook":
      return <span className="text-blue-600 font-bold mr-1">FB</span>;
    case "instagram":
      return <span className="text-pink-500 font-bold mr-1">IG</span>;
    default:
      return null;
  }
};

export default function MetaProviderPage() {
  // Estado principal agrupado por plataforma
  const [activeTab, setActiveTab] = useState("accounts");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingFacebook, setSyncingFacebook] = useState(false);
  const [syncingInstagram, setSyncingInstagram] = useState(false);

  // Datos de cada plataforma
  const [metaAccounts, setMetaAccounts] = useState<MetaAccount[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<
    InstagramAccount[]
  >([]);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);

  // Carga inicial de todos los datos al montar el componente
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga datos según la pestaña activa
  useEffect(() => {
    switch (activeTab) {
      case "accounts":
        loadMetaAccounts();
        break;
      case "whatsapp":
        loadTemplates();
        break;
      case "facebook":
        loadFacebookPages();
        break;
      case "instagram":
        loadInstagramAccounts();
        break;
      case "messages":
        loadMessages();
        break;
      default:
        break;
    }
  }, [activeTab]);

  // Función para cargar todos los datos en paralelo
  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadMetaAccounts(),
      loadTemplates(),
      loadFacebookPages(),
      loadInstagramAccounts(),
      loadMessages(),
    ]);
    setIsLoading(false);
  };

  // --- Funciones de carga y sincronización por plataforma ---

  // Meta Accounts
  const loadMetaAccounts = async () => {
    try {
      setMetaAccounts(await MetaProviderService.getMetaAccounts());
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar las cuentas de Meta",
      });
    }
  };

  // WhatsApp Templates
  const loadTemplates = async () => {
    try {
      setTemplates(await MetaProviderService.getWhatsAppTemplates());
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas de WhatsApp",
      });
    }
  };

  // Facebook Pages
  const loadFacebookPages = async () => {
    try {
      setFacebookPages(await MetaProviderService.getFacebookPages());
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar las páginas de Facebook",
      });
    }
  };
  const syncFacebookPages = async () => {
    setSyncingFacebook(true);
    try {
      setFacebookPages(await MetaProviderService.syncFacebookPages());
      toast({
        title: "Éxito",
        description: "Páginas de Facebook sincronizadas",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron sincronizar las páginas de Facebook",
      });
    } finally {
      setSyncingFacebook(false);
    }
  };

  // Instagram Accounts
  const loadInstagramAccounts = async () => {
    try {
      setInstagramAccounts(await MetaProviderService.getInstagramAccounts());
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar las cuentas de Instagram",
      });
    }
  };
  const syncInstagramAccounts = async () => {
    setSyncingInstagram(true);
    try {
      setInstagramAccounts(await MetaProviderService.syncInstagramAccounts());
      toast({
        title: "Éxito",
        description: "Cuentas de Instagram sincronizadas",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron sincronizar las cuentas de Instagram",
      });
    } finally {
      setSyncingInstagram(false);
    }
  };

  // Mensajes
  const loadMessages = async () => {
    try {
      const { messages, total } = await MetaProviderService.getUserMessages();
      setMessages(messages);
      setTotalMessages(total);
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
      });
    }
  };

  // Eliminar cuenta Meta
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "¿Eliminar esta cuenta? Se perderán todas las conexiones asociadas."
      )
    )
      return;
    try {
      const success = await MetaProviderService.deleteMetaAccount();
      if (success) {
        setMetaAccounts([]);
        toast({
          title: "Cuenta eliminada",
          description: "La cuenta se ha eliminado correctamente",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta de Meta",
      });
    }
  };

  // Refrescar todos los datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast({
      title: "Datos actualizados",
      description: "La información se ha actualizado",
    });
  };

  // Conectar nueva cuenta Meta
  const handleConnectMeta = async () => {
    try {
      const authUrl = await MetaProviderService.getAuthUrl();
      if (authUrl) window.location.href = authUrl;
      else
        toast({
          title: "Error",
          description: "No se pudo generar la URL de autenticación",
        });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo iniciar la conexión con Meta",
      });
    }
  };

  // Utilidad para mostrar color de estado
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "approved":
        return "text-green-600 bg-green-50";
      case "pending":
      case "in_review":
        return "text-yellow-600 bg-yellow-50";
      case "rejected":
      case "failed":
      case "expired":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // --- Renderizado principal con pestañas para cada plataforma ---
  return (
    <SidebarLayout>
      <div className="px-4 py-6">
        {/* Header principal y acciones */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meta Provider</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona tus integraciones con WhatsApp, Facebook e Instagram
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              {refreshing ? (
                <Loader className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Actualizar
            </Button>
            <Button size="sm" onClick={handleConnectMeta} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-1" />
              Conectar Cuenta
            </Button>
          </div>
        </div>
        {/* Pestañas principales */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="bg-gray-100/80">
            <TabsTrigger value="accounts">Cuentas</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
          </TabsList>
          {/* --- Cuentas Meta --- */}
          <TabsContent value="accounts">
            {metaAccounts.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sin cuentas conectadas</CardTitle>
                </CardHeader>
                <CardFooter>
                  <Button onClick={handleConnectMeta}>
                    <Plus className="h-4 w-4 mr-1" />
                    Conectar Cuenta
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {metaAccounts.map((account) => (
                  <Card key={account.id}>
                    <CardHeader className="pb-3 flex justify-between items-center">
                      <CardTitle className="text-lg">Cuenta Meta</CardTitle>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                          account.status || ""
                        )}`}
                      >
                        {account.status || "Sin estado"}
                      </span>
                    </CardHeader>
                    <CardContent className="pb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Creada el:</span>
                        <span>
                          {account.createdAt
                            ? new Date(account.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      {account.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expira el:</span>
                          <span>{formatDate(account.expiresAt)}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-3 flex justify-end border-t">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          {/* --- Plantillas WhatsApp --- */}
          <TabsContent value="whatsapp">
            {templates.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sin plantillas de WhatsApp</CardTitle>
                </CardHeader>
                <CardFooter>
                  <a
                    href="https://business.facebook.com/business/wa/manage/message-templates"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      Gestionar Plantillas en Meta
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Idioma</th>
                      <th>Estado</th>
                      <th>Actualizada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {templates.map((template) => (
                      <tr key={template.id}>
                        <td>{template.name}</td>
                        <td>{template.category || "Sin categoría"}</td>
                        <td>{template.language || "es"}</td>
                        <td>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                              template.status || ""
                            )}`}
                          >
                            {template.status || "Pendiente"}
                          </span>
                        </td>
                        <td>
                          {template.updated_at
                            ? formatDate(template.updated_at)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          {/* --- Páginas Facebook --- */}
          <TabsContent value="facebook">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Páginas de Facebook</CardTitle>
                {metaAccounts.length > 0 && (
                  <Button
                    size="sm"
                    onClick={syncFacebookPages}
                    disabled={syncingFacebook}
                  >
                    {syncingFacebook ? (
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <span className="text-blue-600 font-bold mr-1">FB</span>
                    )}
                    Sincronizar Páginas
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {facebookPages.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="text-blue-400 font-bold text-lg">FB</span>
                    <p className="mt-2 text-sm text-gray-500">
                      No hay páginas de Facebook conectadas
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {facebookPages.map((page) => (
                      <div
                        key={page.id}
                        className="border rounded-lg p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center mb-3">
                            <span className="text-blue-600 font-bold mr-2">
                              FB
                            </span>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {page.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {page.category || "Página"}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mb-3">
                            {page.fan_count !== undefined && (
                              <div className="flex justify-between">
                                <span>Seguidores:</span>
                                <span>{page.fan_count.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Estado:</span>
                              <span
                                className={`font-medium ${
                                  getStatusColor(
                                    page.verification_status || "active"
                                  ).split(" ")[0]
                                }`}
                              >
                                {page.verification_status || "Activa"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3 pt-3 border-t">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Mensajes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* --- Cuentas Instagram --- */}
          <TabsContent value="instagram">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Cuentas de Instagram</CardTitle>
                {metaAccounts.length > 0 && (
                  <Button
                    size="sm"
                    onClick={syncInstagramAccounts}
                    disabled={syncingInstagram}
                  >
                    {syncingInstagram ? (
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <span className="text-pink-500 font-bold mr-1">IG</span>
                    )}
                    Sincronizar Cuentas
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {instagramAccounts.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="text-pink-400 font-bold text-lg">IG</span>
                    <p className="mt-2 text-sm text-gray-500">
                      No hay cuentas de Instagram conectadas
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {instagramAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="border rounded-lg p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center mb-3">
                            <span className="text-pink-500 font-bold mr-2">
                              IG
                            </span>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {account.username || "Sin nombre"}
                              </h3>
                              <p className="text-xs text-gray-500">
                                @{account.username || "cuenta"}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mb-3">
                            {account.follower_count !== undefined && (
                              <div className="flex justify-between">
                                <span>Seguidores:</span>
                                <span>
                                  {account.follower_count.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {account.biography && (
                              <div className="pt-1">
                                <span className="block text-gray-600 mb-1">
                                  Bio:
                                </span>
                                <p className="text-xs line-clamp-2">
                                  {account.biography}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end mt-3 pt-3 border-t">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Mensajes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* --- Historial de Mensajes --- */}
          <TabsContent value="messages">
            {messages.length === 0 ? (
              <InfoMessage
                title="Sin mensajes"
                description="Aún no has enviado mensajes a través de ninguna plataforma."
              />
            ) : (
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>Historial de mensajes</CardTitle>
                  <div className="text-sm text-gray-500">
                    Total: {totalMessages}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th>Plataforma</th>
                          <th>Destinatario</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {messages.map((message) => (
                          <tr key={message.id}>
                            <td>
                              <PlatformIcon platform={message.platform} />
                              {message.platform}
                            </td>
                            <td>{message.recipient}</td>
                            <td className="capitalize">{message.type}</td>
                            <td>
                              <span
                                className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                  message.status === "sent" ||
                                  message.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : message.status === "read"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {message.status}
                              </span>
                            </td>
                            <td>
                              {message.sent_at
                                ? formatDate(message.sent_at)
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}
