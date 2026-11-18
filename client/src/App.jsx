import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import VehicleManagement from './pages/VehicleManagement';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import CloudDrive from './pages/CloudDrive';
import StockTransactions from './pages/StockTransactions';

import FirmSelectionScreen from './components/FirmSelectionScreen';
import AuthScreen from './components/AuthScreen';

import InvoiceModal from './components/InvoiceModal';
import StockMovementModal from './components/StockMovementModal';
import PrintBillModal from './components/PrintBillModal';

import { supabase, isConfigured } from './config/supabaseClient';
import { inventoryService } from './services/inventoryService';
import { billingService } from './services/billingService';
import { driveService } from './services/driveService';
import { vehicleService } from './services/vehicleService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Layer 1 & 2 Auth & Firm States
  const [selectedFirm, setSelectedFirm] = useState(() => {
    try {
      const stored = localStorage.getItem('shashwat_firm');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shashwat_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Data states
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalType, setStockModalType] = useState('STOCK_IN');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  // Initial load when user and firm are active
  useEffect(() => {
    if (selectedFirm && user) {
      loadAllData();
    }
  }, [selectedFirm, user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [invRes, billRes, transRes, driveRes, vehRes] = await Promise.all([
        inventoryService.getItems(),
        billingService.getInvoices(),
        inventoryService.getTransactions(),
        driveService.getFiles(),
        vehicleService.getVehicles()
      ]);

      if (invRes.data) setInventory(invRes.data);
      if (billRes.data) setInvoices(billRes.data);
      if (transRes.data) setTransactions(transRes.data);
      if (driveRes.data) setDriveFiles(driveRes.data);
      if (vehRes.data) setVehicles(vehRes.data);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auth Flow Handlers
  const handleSelectFirm = (firm) => {
    setSelectedFirm(firm);
    localStorage.setItem('shashwat_firm', JSON.stringify(firm));
  };

  const handleLoginSuccess = (authenticatedUser, firm) => {
    setUser(authenticatedUser);
    setSelectedFirm(firm);
    localStorage.setItem('shashwat_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('shashwat_firm', JSON.stringify(firm));
  };

  const handleSwitchFirm = () => {
    setSelectedFirm(null);
    localStorage.removeItem('shashwat_firm');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shashwat_user');
  };

  // Actions for Items (Product & Inventory)
  const handleAddItem = async (item) => {
    const res = await inventoryService.addItem(item);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error adding item: ${res.error.message}`);
    }
  };

  const handleUpdateItem = async (id, updates) => {
    const res = await inventoryService.updateItem(id, updates);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error updating item: ${res.error.message}`);
    }
  };

  const handleDeleteItem = async (id) => {
    const res = await inventoryService.deleteItem(id);
    if (!res.error) {
      loadAllData();
    } else {
      alert(`Error deleting item: ${res.error.message}`);
    }
  };

  // Actions for Invoices
  const handleCreateInvoice = async (invoiceData) => {
    const res = await billingService.createInvoice(invoiceData);
    if (res.data) {
      loadAllData();
      setSelectedInvoiceForPrint(res.data);
      setIsPrintModalOpen(true);
    } else if (res.error) {
      alert(`Error creating invoice: ${res.error.message}`);
    }
  };

  const handleUpdateInvoice = async (id, updates) => {
    const res = await billingService.updateInvoice(id, updates);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error updating invoice: ${res.error.message}`);
    }
  };

  const handleDeleteInvoice = async (id) => {
    const res = await billingService.deleteInvoice(id);
    if (!res.error) {
      loadAllData();
    } else {
      alert(`Error deleting invoice: ${res.error.message}`);
    }
  };

  const handleRecordPayment = async (invoiceId, amount, paymentMethod) => {
    const res = await billingService.recordPayment(invoiceId, amount, paymentMethod);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Payment error: ${res.error.message}`);
    }
  };

  // Actions for Vehicles
  const handleAddVehicle = async (vehicleData) => {
    const res = await vehicleService.addVehicle(vehicleData);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error adding vehicle: ${res.error.message}`);
    }
  };

  const handleUpdateVehicle = async (id, updates) => {
    const res = await vehicleService.updateVehicle(id, updates);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error updating vehicle: ${res.error.message}`);
    }
  };

  const handleDeleteVehicle = async (id) => {
    const res = await vehicleService.deleteVehicle(id);
    if (!res.error) {
      loadAllData();
    } else {
      alert(`Error deleting vehicle: ${res.error.message}`);
    }
  };

  const handleUpdateVehicleStatus = async (id, status, currentDestination) => {
    const res = await vehicleService.updateStatus(id, status, currentDestination);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error updating vehicle status: ${res.error.message}`);
    }
  };

  // Actions for Drive Files
  const handleUpdateFile = async (id, updates) => {
    const res = await driveService.updateFile(id, updates);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error updating file: ${res.error.message}`);
    }
  };

  const handleDeleteFile = async (id) => {
    const res = await driveService.deleteFile(id);
    if (!res.error) {
      loadAllData();
    } else {
      alert(`Error deleting file: ${res.error.message}`);
    }
  };

  // Actions for History Transactions
  const handleDeleteTransaction = async (id) => {
    const res = await inventoryService.deleteTransaction(id);
    if (!res.error) {
      loadAllData();
    } else {
      alert(`Error deleting history log: ${res.error.message}`);
    }
  };

  const handleStockMovement = async ({ type, itemId, quantity, unitCost, referenceNumber, partyName, notes }) => {
    let res;
    if (type === 'STOCK_IN') {
      res = await inventoryService.stockIn({ itemId, quantity, unitCost, referenceNumber, partyName, notes });
    } else {
      res = await inventoryService.stockOut({ itemId, quantity, referenceNumber, partyName, notes });
    }

    if (res.error) {
      alert(`Error: ${res.error.message}`);
    } else {
      loadAllData();
    }
  };

  const openStockModal = (type = 'STOCK_IN') => {
    setStockModalType(type);
    setIsStockModalOpen(true);
  };

  const openPrintModal = (invoice) => {
    setSelectedInvoiceForPrint(invoice);
    setIsPrintModalOpen(true);
  };

  // --------------------------------------------------------------------------
  // FACTORY RESET: Clear all local caches, wipe Supabase tables & reset state
  // --------------------------------------------------------------------------
  const handleFactoryReset = async () => {
    setLoading(true);
    try {
      // 1. Wipe local storage keys
      localStorage.removeItem('shashwat_inventory_cache');
      localStorage.removeItem('shashwat_transactions_cache');
      localStorage.removeItem('shashwat_invoices_cache');
      localStorage.removeItem('shashwat_vehicles_cache');
      localStorage.removeItem('shashwat_drive_cache');

      // 2. If Supabase cloud database is connected, delete remote rows
      if (isConfigured && supabase) {
        try {
          await supabase.from('invoice_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('stock_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('inventory_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('drive_files').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (dbErr) {
          console.warn('Database clear notice:', dbErr);
        }
      }

      // 3. Clear all active react state to 0 items
      setInventory([]);
      setInvoices([]);
      setVehicles([]);
      setDriveFiles([]);
      setTransactions([]);

      alert('CRM Factory Reset complete!\n\nAll space has been cleared and data removed completely. Your software is now 100% fresh and ready for clean data entry.');
    } catch (err) {
      alert(`Reset notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // LAYER 1: Choose Business Division (Shashwat Woods vs Shashwat Ashapura Woods)
  // --------------------------------------------------------------------------
  if (!selectedFirm) {
    return <FirmSelectionScreen onSelectFirm={handleSelectFirm} />;
  }

  // --------------------------------------------------------------------------
  // LAYER 2: Authentication / Registration with Gmail OTP & Login
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <AuthScreen
        firm={selectedFirm}
        onBackToFirms={handleSwitchFirm}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // --------------------------------------------------------------------------
  // LAYER 3: Main Commercial CRM & Operations System (7 Modules)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        firm={selectedFirm}
        user={user}
        onSwitchFirm={handleSwitchFirm}
        onLogout={handleLogout}
        onFactoryReset={handleFactoryReset}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar Navigation & Wixfox Branding */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          firm={selectedFirm}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Loading {selectedFirm?.name} operations data...
            </div>
          ) : (
            <>
              {/* Module 1: Dashboard */}
              {activeTab === 'dashboard' && (
                <Dashboard
                  invoices={invoices}
                  inventory={inventory}
                  transactions={transactions}
                  onOpenInvoice={() => setIsInvoiceModalOpen(true)}
                  onOpenStockMovement={openStockModal}
                  onPrintInvoice={openPrintModal}
                />
              )}

              {/* Module 2: Product Management with Edit & Delete */}
              {activeTab === 'products' && (
                <ProductManagement
                  firm={selectedFirm}
                  inventory={inventory}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                />
              )}

              {/* Module 3: Vehicle Management with Edit & Delete */}
              {activeTab === 'vehicles' && (
                <VehicleManagement
                  vehicles={vehicles}
                  onAddVehicle={handleAddVehicle}
                  onUpdateVehicle={handleUpdateVehicle}
                  onDeleteVehicle={handleDeleteVehicle}
                  onUpdateStatus={handleUpdateVehicleStatus}
                />
              )}

              {/* Module 4: Invoice Bill with Edit & Delete */}
              {activeTab === 'billing' && (
                <Billing
                  invoices={invoices}
                  onOpenCreate={() => setIsInvoiceModalOpen(true)}
                  onPrint={openPrintModal}
                  onRecordPayment={handleRecordPayment}
                  onUpdateInvoice={handleUpdateInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                />
              )}

              {/* Module 5: Inventory Management with Edit & Delete */}
              {activeTab === 'inventory' && (
                <Inventory
                  firm={selectedFirm}
                  inventory={inventory}
                  onOpenMovement={openStockModal}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                />
              )}

              {/* Module 6: DATA (Cloud Storage) with Edit & Delete */}
              {activeTab === 'data' && (
                <CloudDrive 
                  driveFiles={driveFiles} 
                  onUpdateFile={handleUpdateFile}
                  onDeleteFile={handleDeleteFile}
                />
              )}

              {/* Module 7: History (Audit Log) with Delete Entry */}
              {activeTab === 'history' && (
                <StockTransactions 
                  transactions={transactions} 
                  onDeleteTransaction={handleDeleteTransaction}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onCreated={handleCreateInvoice}
        inventoryItems={inventory}
        firm={selectedFirm}
      />

      <StockMovementModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSave={handleStockMovement}
        inventoryItems={inventory}
        initialType={stockModalType}
      />

      <PrintBillModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={selectedInvoiceForPrint}
      />
    </div>
  );
}
