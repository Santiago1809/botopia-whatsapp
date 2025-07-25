import { useState, useEffect, useCallback } from 'react';
import { useWhatsApp } from '@/context/WhatsAppContext';
import {  Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from 'next/image';
import { WhatsAppBarucWrapper } from "./WhatsAppBarucWrapper";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface WhatsAppAccount {
  id: string;
  name: string;
  number: string;
  status: string;
}

interface WhatsAppNodeProps {
  id: string;
  data: {
    label: string;
    accountId?: string;
    phone?: string;
    name?: string;
  };
}

/*interface QrCodeEvent {
  numberId: number;
  qr: string;
}*/

interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  isGroup: boolean;
  isMyContact: boolean;
  wa_id?: string;
  lastMessageTimestamp?: number;
  lastMessagePreview?: string;
  agenteHabilitado?: boolean;
}

export function WhatsAppNode({ /*id, data*/ }: WhatsAppNodeProps) {
  const { 
    accounts, 
    socket, 
    connectAccount,
    fetchAccounts,
    connectionStatus,
    updateConnectionStatus,
  } = useWhatsApp();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<WhatsAppAccount | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [filterType,] = useState<"all" | "contacts" | "groups">("all");
  const [contactSearch, setContactSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [localQrCode, setLocalQrCode] = useState<string | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showContactsDialog, setShowContactsDialog] = useState(false);

  // Usar useEffect para manejar actualizaciones de estado de conexión
  useEffect(() => {
    if (selectedAccount && connectionStatus[selectedAccount.id] !== selectedAccount.status) {
      setSelectedAccount(prev => 
        prev ? { ...prev, status: connectionStatus[selectedAccount.id] } : null
      );
    }
  }, [connectionStatus, selectedAccount]);

  // Manejar eventos del socket
  useEffect(() => {
    if (!socket || !selectedAccount) return;

    const handleQrCode = (/* id: string, data: any */) => {
      // Código existente
    };

    const handleWhatsappReady = async (data: { numberId: string | number }) => {
      if (String(data.numberId) === selectedAccount.id) {
        setLocalQrCode(null);
        setShowQrDialog(false);
        updateConnectionStatus(String(data.numberId), 'connected');

        try {
          setLoadingContacts(true);
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token found');

          const res = await fetch(
            `${BACKEND_URL}/api/whatsapp/contacts?numberId=${data.numberId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) throw new Error('Error fetching contacts');
          
          const contactList = await res.json();
          setContacts(contactList);
          setShowContactsDialog(true);
        } catch (error) {
          console.error('Error fetching contacts:', error);
        } finally {
          setLoadingContacts(false);
        }
      }
    };

    const handleConnectionFailure = (data: { numberId: string | number }) => {
      if (String(data.numberId) === selectedAccount.id) {
        setLocalQrCode(null);
        setShowQrDialog(false);
        updateConnectionStatus(String(data.numberId), 'disconnected');
      }
    };

    // Suscribirse a eventos
    socket.on("qr-code", handleQrCode);
    socket.on("whatsapp-ready", handleWhatsappReady);
    socket.on("connection-failure", handleConnectionFailure);

    // Limpieza
    return () => {
      socket.off("qr-code", handleQrCode);
      socket.off("whatsapp-ready", handleWhatsappReady);
      socket.off("connection-failure", handleConnectionFailure);
    };
  }, [socket, selectedAccount, updateConnectionStatus]);

  const handleSelectAccount = async (account: WhatsAppAccount) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const currentStatus = connectionStatus[account.id];
      const accountWithStatus = { 
        ...account, 
        status: currentStatus || 'disconnected' 
      };
      
      setSelectedAccount(accountWithStatus);

      if (!currentStatus || currentStatus === 'disconnected') {
        await connectAccount(account.id);
        socket?.emit("join-room", String(account.id));
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      alert(error instanceof Error ? error.message : 'Error connecting account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (isLoading || !newName || !newNumber) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Agregar nuevo número
      const addRes = await fetch(`${BACKEND_URL}/api/user/add-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          number: newNumber
        }),
      });

      // Verificar que la respuesta sea válida antes de parsear
      const text = await addRes.text();
      let addData;
      try {
        addData = JSON.parse(text);
      } catch {
        console.error('Invalid JSON response:', text);
        throw new Error('Respuesta inválida del servidor');
      }

      if (!addRes.ok) throw new Error(addData.message || 'Error al agregar el número');

      const { numberId } = addData;

      // Crear nueva cuenta
      const newAccount: WhatsAppAccount = {
        id: numberId,
        name: newName,
        number: newNumber,
        status: 'connecting'
      };

      // Actualizar la lista de cuentas
      await fetchAccounts();
      
      // Seleccionar la nueva cuenta
      setSelectedAccount(newAccount);
      
      // Limpiar el formulario y cerrar el diálogo
      setNewName('');
      setNewNumber('');
      setShowAddDialog(false);

      // Iniciar WhatsApp con el nuevo número
      await connectAccount(numberId);
      socket?.emit("join-room", String(numberId));

    } catch (error) {
      console.error('Error adding account:', error);
      alert(error instanceof Error ? error.message : 'Error al agregar el número');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar sincronización de contactos
  const handleSyncContacts = async () => {
    if (!selectedAccount) return;
    setIsSyncing(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const contactsToSync = selectedContacts.map(id => {
        const contact = contacts.find(c => c.id === id);
        return {
          wa_id: contact?.wa_id || contact?.id,
          id: contact?.id,
          type: 'contact',
          name: contact?.name,
          number: contact?.number
        };
      });

      const groupsToSync = selectedGroups.map(id => {
        const group = contacts.find(c => c.id === id);
        return {
          wa_id: group?.wa_id || group?.id,
          id: group?.id,
          type: 'group',
          name: group?.name
        };
      });

      const response = await fetch(`${BACKEND_URL}/api/whatsapp/sync-contacts-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          numberId: selectedAccount.id,
          contacts: contactsToSync,
          groups: groupsToSync,
          clearAll: false
        })
      });

      // Verificar la respuesta
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Invalid JSON response:', text);
        throw new Error('Respuesta inválida del servidor');
      }

      if (!response.ok) throw new Error(data.message || 'Error syncing contacts');
      
      // Cerrar diálogo y limpiar selección
      setShowContactsDialog(false);
      setSelectedContacts([]);
      setSelectedGroups([]);
      
    } catch (error) {
      console.error('Error syncing contacts:', error);
      alert(error instanceof Error ? error.message : 'Error al sincronizar contactos');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handlers para selección de contactos
  const handleContactToggle = useCallback((id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  }, []);

  const handleGroupToggle = useCallback((id: string) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  }, []);

  // Separar contactos y grupos
  const personalContacts = contacts.filter(c => !c.isGroup && c.isMyContact);
  const groupContacts = contacts.filter(c => c.isGroup);

  const filteredPersonalContacts = personalContacts.filter(c => 
    c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.number?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const filteredGroupContacts = groupContacts.filter(g => 
    g.name?.toLowerCase().includes(groupSearch.toLowerCase())
  );

  // Diálogo de código QR
  const renderQrDialog = useCallback(() => (
    <Dialog 
      open={showQrDialog && !!localQrCode}
      onOpenChange={(open) => {
        if (!open) {
          setShowQrDialog(false);
          setLocalQrCode(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            Escanea el código QR con tu WhatsApp para conectar la cuenta
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          {localQrCode && (
            <Image 
              src={localQrCode} 
              alt="WhatsApp QR Code"
              width={256}
              height={256}
              className="object-contain"
            />
          )}
          <p className="text-sm text-gray-500 mt-4 text-center">
            Abre WhatsApp en tu teléfono, ve a Ajustes {'>'} WhatsApp Web/Desktop y escanea el código QR
          </p>
        </div>
      </DialogContent>
    </Dialog>
  ), [showQrDialog, localQrCode]);

  // Diálogo para agregar nueva cuenta
  const renderAddAccountDialog = () => (
    <Dialog 
      open={showAddDialog} 
      onOpenChange={setShowAddDialog}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar nueva cuenta de WhatsApp</DialogTitle>
          <DialogDescription>
            Ingresa los datos de la nueva cuenta que deseas vincular
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre de la cuenta
            </label>
            <input
              id="name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej: Soporte Principal"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="number" className="text-sm font-medium">
              Número de WhatsApp
            </label>
            <input
              id="number"
              type="text"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej: +34600000000"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowAddDialog(false)}
            className="px-4 py-2 rounded-md border text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddAccount}
            disabled={isLoading || !newName || !newNumber}
            className="px-4 py-2 rounded-md bg-primary text-white text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Agregando...
              </div>
            ) : (
              'Agregar cuenta'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Diálogo de contactos
  const renderContactsDialog = () => (
    <Dialog 
      open={showContactsDialog} 
      onOpenChange={setShowContactsDialog}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Sincronizar contactos y grupos</DialogTitle>
          <DialogDescription>
            Selecciona los contactos y grupos que deseas sincronizar
          </DialogDescription>
        </DialogHeader>
        
        {loadingContacts ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando contactos...</span>
          </div>
        ) : (
          <>
            {(filterType === "all" || filterType === "contacts") && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar contactos..."
                  className="w-full px-3 py-2 border rounded"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
                <div className="mt-2 max-h-[200px] overflow-y-auto">
                  {filteredPersonalContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center p-2 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                        className="mr-2"
                      />
                      <span>{contact.name || contact.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(filterType === "all" || filterType === "groups") && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar grupos..."
                  className="w-full px-3 py-2 border rounded"
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                />
                <div className="mt-2 max-h-[200px] overflow-y-auto">
                  {filteredGroupContacts.map((group) => (
                    <div key={group.id} className="flex items-center p-2 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={() => handleGroupToggle(group.id)}
                        className="mr-2"
                      />
                      <span>{group.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-auto">
              <button
                onClick={() => setShowContactsDialog(false)}
                className="px-4 py-2 rounded border"
              >
                Cancelar
              </button>
              <button
                onClick={handleSyncContacts}
                disabled={isSyncing || (selectedContacts.length === 0 && selectedGroups.length === 0)}
                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar seleccionados'}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      
      <WhatsAppBarucWrapper
        selectedAccount={selectedAccount}
        connectionStatus={connectionStatus}
        accounts={accounts}
        isLoading={isLoading}
        onSelectAccount={handleSelectAccount}
        onAddNewAccount={handleAddAccount}
      />
      {renderQrDialog()}
      {renderAddAccountDialog()}
      {renderContactsDialog()}
    </>
  );
}