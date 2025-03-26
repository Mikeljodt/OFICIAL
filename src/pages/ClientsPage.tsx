import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Download, Upload, Search, History, Edit, Info, Trash } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { fetchClients, addClient, updateClient, deleteClient } from '@/store/slices/clientsSlice';
import { fetchCollectionsByClient } from '@/store/slices/collectionsSlice';
import { Client } from '@/lib/db'; // Import Client type from db
import { CollectionHistory } from '@/components/CollectionHistory';
import { SignaturePad } from '@/components/SignatureCanvas';
import { useToast } from "@/components/ui/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// import { NewClientForm } from './ClientsPage'; // Components are defined below
// import { MachineDepositSignatureForm } from './ClientsPage';
// import { EditClientForm } from './ClientsPage';

// Local Client interface removed, using imported Client from '@/lib/db'

const ClientsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Use the Client type imported from @/lib/db for the state
  // 'status' was removed as it was unused
  const { clients } = useSelector((state: RootState) => state.clients);
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  // Use the imported Client type for selectedClient
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);
  const [isMachineDepositDialogOpen, setIsMachineDepositDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  // Use client.name instead of client.establishmentName based on imported Client type
  const filteredClients = clients.filter(client =>
    (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.businessType && client.businessType.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.city && client.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewHistory = (clientId: number) => {
    setSelectedClientId(clientId);
    dispatch(fetchCollectionsByClient(clientId));
    setIsHistoryDialogOpen(true);
  };

  const handleOpenNewClientDialog = () => {
    setIsNewClientDialogOpen(true);
  };

  const handleCloseNewClientDialog = () => {
    setIsNewClientDialogOpen(false);
  };

  const handleOpenMachineDepositDialog = (clientId: number) => {
    const clientToSign = clients.find(client => client.id === clientId);
    if (clientToSign) {
      setSelectedClient(clientToSign);
      setIsMachineDepositDialogOpen(true);
    }
  };

  const handleCloseMachineDepositDialog = () => {
    setIsMachineDepositDialogOpen(false);
    setSelectedClient(null);
  };

  // Use the imported Client type for newClientData
  const handleCreateClient = (newClientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'machines'>) => {
    dispatch(addClient(newClientData));
    toast({
      title: "Éxito",
      description: "Cliente creado correctamente.",
    })
    // We might need to fetch the newly created client ID if Date.now() isn't reliable
    // For now, assuming the structure allows finding it or using a temporary approach
    // Find the client potentially just added (this might be fragile)
    const potentiallyNewClient = clients.find(c => c.name === newClientData.name && c.phone === newClientData.phone) || { id: Date.now(), ...newClientData }; // Fallback ID
    handleOpenMachineDepositDialog(potentiallyNewClient.id);
    handleCloseNewClientDialog();
  };

  const handleOpenEditClientDialog = (clientId: number) => {
    const clientToEdit = clients.find(client => client.id === clientId);
    if (clientToEdit) {
      setSelectedClient(clientToEdit);
      setIsEditClientDialogOpen(true);
    }
  };

  const handleCloseEditClientDialog = () => {
    setIsEditClientDialogOpen(false);
    setSelectedClient(null);
  };

  // Use the imported Client type for updatedClientData
  const handleUpdateClient = (updatedClientData: Partial<Client> & { id: number }) => {
    dispatch(updateClient(updatedClientData));
    toast({
      title: "Éxito",
      description: "Cliente actualizado correctamente.",
    })
    handleCloseEditClientDialog();
  };

  const handleDeleteClient = (clientId: number) => {
    setClientIdToDelete(clientId);
    setIsDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientIdToDelete !== null) {
      dispatch(deleteClient(clientIdToDelete));
      toast({
        title: "Éxito",
        description: "Cliente eliminado correctamente.",
      });
      setIsDeleteConfirmationOpen(false);
      setClientIdToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
    setClientIdToDelete(null);
  };

  const handleViewDetails = (clientId: number) => {
    // Implement logic to view client details
    console.log(`View details for client ID: ${clientId}`);
    // Potentially open another dialog or navigate to a details page
  };

  const handleImportClients = () => {
    // Implement logic to import clients
    console.log('Import clients');
  };

  const handleExportClients = () => {
    // Implement logic to export clients
    console.log('Export clients');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tus clientes y sus máquinas</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-between">
        <div className="space-x-2">
          <Button variant="default" onClick={handleOpenNewClientDialog}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>
        <div className="space-x-2">
          <Button variant="violet" onClick={handleImportClients}>
            <Upload className="mr-2 h-4 w-4" /> Importar
          </Button>
          <Button variant="violet" onClick={handleExportClients}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, tipo de negocio o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Diálogo para historial de recaudaciones */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Historial de Recaudaciones</DialogTitle>
            <DialogDescription>
              {/* Use client.name */}
              {selectedClientId && clients.find(c => c.id === selectedClientId)?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClientId && (
            <CollectionHistory
              // Ensure 'type' prop is definitely removed
              clientId={selectedClientId}
              machineId={null}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para nuevo cliente */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo cliente. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <NewClientForm onCreate={handleCreateClient} onCancel={handleCloseNewClientDialog} />
        </DialogContent>
      </Dialog>

      {/* Diálogo para firma de máquina en depósito */}
      <Dialog open={isMachineDepositDialogOpen} onOpenChange={setIsMachineDepositDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Firma de Contrato de Depósito de Máquina</DialogTitle>
            <DialogDescription>
              Firma el contrato de depósito de la máquina.
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <MachineDepositSignatureForm
              clientData={selectedClient}
              onCancel={handleCloseMachineDepositDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar cliente */}
      <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica los datos del cliente.
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <EditClientForm
              client={selectedClient}
              onUpdate={handleUpdateClient}
              onCancel={handleCloseEditClientDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el cliente permanentemente. ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle>Listado de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="text-sm text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Propietario</th>
                  <th className="px-4 py-3 text-left">Ubicación</th>
                  <th className="px-4 py-3 text-left">Contacto</th>
                  <th className="px-4 py-3 text-center">Máquinas</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-border">
                    {/* Use client.name and client.owner */}
                    <td className="px-4 py-3 font-medium">{client.name}</td>
                    <td className="px-4 py-3">{client.businessType || '-'}</td>
                    <td className="px-4 py-3">{client.owner || '-'}</td>
                    <td className="px-4 py-3">{client.city || '-'}</td>
                    <td className="px-4 py-3">{client.phone || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        {client.machines}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewHistory(client.id)}
                        >
                          <History className="mr-1 h-4 w-4" />
                          Historial
                        </Button>
                        <Button variant="violet" size="sm" onClick={() => handleOpenEditClientDialog(client.id)}>
                          <Edit className="mr-1 h-4 w-4" />
                          Editar
                        </Button>
                        {/* Trigger for delete confirmation */}
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(client.id)}>
                               <Trash className="mr-1 h-4 w-4" />
                               Eliminar
                           </Button>
                        </AlertDialogTrigger>
                        {/* Removed duplicate AlertDialog inside the loop */}
                        <Button variant="default" size="sm" onClick={() => handleViewDetails(client.id)}>
                          <Info className="mr-1 h-4 w-4" />
                          Detalle
                        </Button>
                        <Button variant="lime" size="sm" onClick={() => handleOpenMachineDepositDialog(client.id)}>
                          Firma Depósito
                        </Button>
                        {/* Assuming depositoSignature might be added later or is handled differently */}
                        {/* {client.depositoSignature && (
                          <CheckCircle className="text-green-500 h-5 w-5" />
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Sub-components using the imported Client type ---

// NewClientForm component
interface NewClientFormProps {
  // Use imported Client type, omitting fields generated by DB/logic
  onCreate: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'machines'>) => void;
  onCancel: () => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({ onCreate, onCancel }) => {
  // State aligned with Client type from db.ts
  const [name, setName] = useState(''); // Changed from establishmentName
  const [businessType, setBusinessType] = useState('');
  const [owner, setOwner] = useState(''); // Changed from ownerName + ownerLastName
  const [taxId, setTaxId] = useState(''); // Changed from fiscalIdType + fiscalId
  const [address, setAddress] = useState(''); // Combined address field
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [morningOpenTime, setMorningOpenTime] = useState(''); // Renamed
  const [morningCloseTime, setMorningCloseTime] = useState(''); // Renamed
  const [eveningOpenTime, setEveningOpenTime] = useState(''); // Renamed
  const [eveningCloseTime, setEveningCloseTime] = useState(''); // Renamed
  const [closingDay, setClosingDay] = useState('');
  const [notes, setNotes] = useState(''); // Changed from additionalNotes

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct client data according to imported Client type
    const newClientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'machines'> = {
      name,
      // Ensure optional fields are passed as undefined if empty, matching the type
      businessType: businessType || undefined,
      owner: owner || undefined,
      taxId: taxId || undefined,
      address: address || undefined,
      city: city || undefined,
      province: province || undefined,
      postalCode: postalCode || undefined,
      phone: phone || undefined,
      email: email || undefined,
      morningOpenTime: morningOpenTime || undefined,
      morningCloseTime: morningCloseTime || undefined,
      eveningOpenTime: eveningOpenTime || undefined,
      eveningCloseTime: eveningCloseTime || undefined,
      closingDay: closingDay || undefined,
      notes: notes || undefined,
    };
    onCreate(newClientData);
    // Toast is already called in handleCreateClient
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Update form fields to match new state and Client type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del Establecimiento *</Label>
          <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="businessType">Tipo de Negocio</Label>
          <select
            id="businessType" // Correct ID
            title="Tipo de Negocio" // Add title for accessibility
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar tipo</option>
            <option value="bar">Bar</option>
            <option value="restaurante">Restaurante</option>
            <option value="cafeteria">Cafetería</option>
            {/* Add other relevant types */}
          </select>
        </div>
      </div>
      {/* Owner */}
      <div>
        <Label htmlFor="owner">Propietario</Label>
        <Input type="text" id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
      </div>
      {/* Tax ID */}
      <div>
        <Label htmlFor="taxId">Identificación Fiscal (NIF/CIF/etc.)</Label>
        <Input type="text" id="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
      </div>
      {/* Address */}
      <div>
        <Label htmlFor="address">Dirección Completa</Label>
        <Input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      {/* City, Province, Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="province">Provincia</Label>
          <Input type="text" id="province" value={province} onChange={(e) => setProvince(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="postalCode">Código Postal</Label>
          <Input type="text" id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        </div>
      </div>
      {/* Phone, Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      {/* Opening Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="morningOpenTime">Apertura Mañana</Label>
          <select
            id="morningOpenTime" // Correct ID
            title="Apertura Mañana" // Add title for accessibility
            value={morningOpenTime}
            onChange={(e) => setMorningOpenTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar hora</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="morningCloseTime">Cierre Mañana</Label>
          <select
            id="morningCloseTime" // Correct ID
            title="Cierre Mañana" // Add title for accessibility
            value={morningCloseTime}
            onChange={(e) => setMorningCloseTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar hora</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="eveningOpenTime">Apertura Tarde</Label>
          <select
            id="eveningOpenTime" // Correct ID
            title="Apertura Tarde" // Add title for accessibility
            value={eveningOpenTime}
            onChange={(e) => setEveningOpenTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar hora</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="eveningCloseTime">Cierre Tarde</Label>
          <select
            id="eveningCloseTime" // Correct ID
            title="Cierre Tarde" // Add title for accessibility
            value={eveningCloseTime}
            onChange={(e) => setEveningCloseTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar hora</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Closing Day */}
      <div>
        <Label htmlFor="closingDay">Día de Cierre</Label>
        <select
          id="closingDay" // Correct ID
          title="Día de Cierre" // Add title for accessibility
          value={closingDay}
          onChange={(e) => setClosingDay(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          // Removed 'required' as it's optional in the DB schema
        >
          <option value="">Seleccionar día</option>
          <option value="Lunes">Lunes</option>
          <option value="Martes">Martes</option>
          <option value="Miércoles">Miércoles</option>
          <option value="Jueves">Jueves</option>
          <option value="Viernes">Viernes</option>
          <option value="Sábado">Sábado</option>
          <option value="Domingo">Domingo</option>
        </select>
      </div>
      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Input
          type="text"
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Cliente</Button>
      </div>
    </form>
  );
};

// MachineDepositSignatureForm component
interface MachineDepositSignatureFormProps {
  // Use imported Client type
  clientData: Client | null;
  onCancel: () => void;
}

const MachineDepositSignatureForm: React.FC<MachineDepositSignatureFormProps> = ({ clientData, onCancel }) => {
  const [signature, setSignature] = useState('');
  const { toast } = useToast();
  // Removed unused dispatch: const dispatch = useDispatch<AppDispatch>();

  const handleSignatureChange = (value: string) => {
    setSignature(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      toast({
        title: "Error",
        description: "Por favor, firma el contrato de depósito.",
        variant: "destructive",
      });
      return;
    }
    if (!clientData) {
        toast({ title: "Error", description: "Datos del cliente no disponibles.", variant: "destructive" });
        return;
    }

    // Update client with signature data
    // Assuming 'depositoSignature' is the field to store the signature (might need adjustment based on actual DB schema usage)
    // TODO: Define signature field in Client type (src/lib/db.ts) and uncomment/adjust update logic below.
    // const updatedClientData = {
    //     id: clientData.id,
    //     // depositoSignature: signature // Example field name
    // };

    // Dispatch an update action if a signature field exists
    // dispatch(updateClient(updatedClientData)); // Uncomment and adjust if applicable

    console.log("Client Data:", clientData);
    console.log("Signature:", signature); // This is likely a base64 string
    toast({
      title: "Éxito",
      description: "Contrato de depósito firmado correctamente (simulado).", // Indicate simulation if not saving yet
    });
    onCancel();
  };

  // Helper to format address safely
  const formatAddress = (client: Client | null): string => {
      if (!client) return '';
      const parts = [client.address, client.city, client.province, client.postalCode];
      return parts.filter(Boolean).join(', ');
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {clientData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Nombre del Establecimiento</Label>
              <Input type="text" id="clientName" value={clientData.name} readOnly />
            </div>
            <div>
              <Label htmlFor="clientOwner">Propietario</Label>
              <Input type="text" id="clientOwner" value={clientData.owner || ''} readOnly />
            </div>
          </div>
          <div>
              <Label htmlFor="clientTaxId">Identificación Fiscal</Label>
              <Input type="text" id="clientTaxId" value={clientData.taxId || ''} readOnly />
          </div>
          <div>
            <Label htmlFor="clientAddress">Dirección</Label>
            <Input type="text" id="clientAddress" value={formatAddress(clientData)} readOnly />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientPhone">Teléfono</Label>
              <Input type="tel" id="clientPhone" value={clientData.phone || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="clientEmail">Correo Electrónico</Label>
              <Input type="email" id="clientEmail" value={clientData.email || ''} readOnly />
            </div>
          </div>
        </>
      )}
      <div>
        <Label htmlFor="signature">Firma del Cliente</Label>
        {/* Pass the signature state as the value prop */}
        <SignaturePad value={signature} onChange={handleSignatureChange} />
        {/* Optionally display the signature preview */}
        {/* {signature && <img src={signature} alt="Signature Preview" style={{ border: '1px solid #ccc', marginTop: '10px', maxHeight: '100px' }} />} */}
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Firmar Contrato</Button>
      </div>
    </form>
  );
};


// EditClientForm component
interface EditClientFormProps {
  // Use imported Client type
  client: Client;
  onUpdate: (clientData: Partial<Client> & { id: number }) => void;
  onCancel: () => void;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ client, onUpdate, onCancel }) => {
  // Initialize state based on the imported Client type and the passed client prop
  const [name, setName] = useState(client.name);
  const [businessType, setBusinessType] = useState(client.businessType || '');
  const [owner, setOwner] = useState(client.owner || '');
  const [taxId, setTaxId] = useState(client.taxId || '');
  const [address, setAddress] = useState(client.address || '');
  const [city, setCity] = useState(client.city || '');
  const [province, setProvince] = useState(client.province || '');
  const [postalCode, setPostalCode] = useState(client.postalCode || '');
  const [phone, setPhone] = useState(client.phone || '');
  const [email, setEmail] = useState(client.email || '');
  const [morningOpenTime, setMorningOpenTime] = useState(client.morningOpenTime || '');
  const [morningCloseTime, setMorningCloseTime] = useState(client.morningCloseTime || '');
  const [eveningOpenTime, setEveningOpenTime] = useState(client.eveningOpenTime || '');
  const [eveningCloseTime, setEveningCloseTime] = useState(client.eveningCloseTime || '');
  const [closingDay, setClosingDay] = useState(client.closingDay || '');
  const [notes, setNotes] = useState(client.notes || '');

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct updated data according to imported Client type
    const updatedClientData: Partial<Client> & { id: number } = {
      id: client.id,
      name,
      businessType: businessType || undefined,
      owner: owner || undefined,
      taxId: taxId || undefined,
      address: address || undefined,
      city: city || undefined,
      province: province || undefined,
      postalCode: postalCode || undefined,
      phone: phone || undefined,
      email: email || undefined,
      morningOpenTime: morningOpenTime || undefined,
      morningCloseTime: morningCloseTime || undefined,
      eveningOpenTime: eveningOpenTime || undefined,
      eveningCloseTime: eveningCloseTime || undefined,
      closingDay: closingDay || undefined,
      notes: notes || undefined,
    };
    onUpdate(updatedClientData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Form fields aligned with EditClientForm state and Client type */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">Nombre del Establecimiento *</Label>
          <Input type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="edit-businessType">Tipo de Negocio</Label>
          <select
            id="edit-businessType" // Correct ID
            title="Tipo de Negocio" // Add title for accessibility
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar tipo</option>
            <option value="bar">Bar</option>
            <option value="restaurante">Restaurante</option>
            <option value="cafeteria">Cafetería</option>
             {/* Add other relevant types */}
          </select>
        </div>
      </div>
       <div>
        <Label htmlFor="edit-owner">Propietario</Label>
        <Input type="text" id="edit-owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
      </div>
       <div>
        <Label htmlFor="edit-taxId">Identificación Fiscal</Label>
        <Input type="text" id="edit-taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
      </div>
       <div>
        <Label htmlFor="edit-address">Dirección Completa</Label>
        <Input type="text" id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edit-city">Ciudad</Label>
          <Input type="text" id="edit-city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="edit-province">Provincia</Label>
          <Input type="text" id="edit-province" value={province} onChange={(e) => setProvince(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="edit-postalCode">Código Postal</Label>
          <Input type="text" id="edit-postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-phone">Teléfono</Label>
          <Input type="tel" id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="edit-email">Correo Electrónico</Label>
          <Input type="email" id="edit-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-morningOpenTime">Apertura Mañana</Label>
          <select
            id="edit-morningOpenTime" // Correct ID
            title="Apertura Mañana" // Add title for accessibility
            value={morningOpenTime}
            onChange={(e) => setMorningOpenTime(e.target.value)}
             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar hora</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="edit-morningCloseTime">Cierre Mañana</Label>
          <select
            id="edit-morningCloseTime" // Correct ID
            title="Cierre Mañana" // Add title for accessibility
            value={morningCloseTime}
            onChange={(e) => setMorningCloseTime(e.target.value)}
             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar hora</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-eveningOpenTime">Apertura Tarde</Label>
          <select
            id="edit-eveningOpenTime" // Correct ID
            title="Apertura Tarde" // Add title for accessibility
            value={eveningOpenTime}
            onChange={(e) => setEveningOpenTime(e.target.value)}
             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar hora</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="edit-eveningCloseTime">Cierre Tarde</Label>
          <select
            id="edit-eveningCloseTime" // Correct ID
            title="Cierre Tarde" // Add title for accessibility
            value={eveningCloseTime}
            onChange={(e) => setEveningCloseTime(e.target.value)}
             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar hora</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>
       <div>
        <Label htmlFor="edit-closingDay">Día de Cierre</Label>
        <select
          id="edit-closingDay" // Correct ID
          title="Día de Cierre" // Add title for accessibility
          value={closingDay}
          onChange={(e) => setClosingDay(e.target.value)}
           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Seleccionar día</option>
          <option value="Lunes">Lunes</option>
          <option value="Martes">Martes</option>
          <option value="Miércoles">Miércoles</option>
          <option value="Jueves">Jueves</option>
          <option value="Viernes">Viernes</option>
          <option value="Sábado">Sábado</option>
          <option value="Domingo">Domingo</option>
        </select>
      </div>
       <div>
        <Label htmlFor="edit-notes">Notas Adicionales</Label>
        <Input
          type="text"
          id="edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Actualizar Cliente</Button>
      </div>
    </form>
  );
};

export default ClientsPage;
