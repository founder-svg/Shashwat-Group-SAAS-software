import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Receipt, 
  Boxes, 
  Database, 
  History 
} from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LiquidNavbar from './components/ui/liquid-glass-navbar';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import VehicleManagement from './pages/VehicleManagement';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import CloudDrive from './pages/CloudDrive';
import StockTransactions from './pages/StockTransactions';

import FirmSelectionScreen from './components/FirmSelectionScreen';
import AuthScreen from './components/AuthScreen';
import { FIRMS } from './constants/firms';

import InvoiceModal from './components/InvoiceModal';
import StockMovementModal from './components/StockMovementModal';
import PrintBillModal from './components/PrintBillModal';
import WhatsAppModal from './components/WhatsAppModal';
import PublicBillView from './components/PublicBillView';
import { clientMicroPdf } from './utils/microPdfGenerator';
import { formatWhatsAppMessage } from './utils/whatsappUtils';

import { supabase, isConfigured } from './config/supabaseClient';
import { inventoryService } from './services/inventoryService';
import { billingService } from './services/billingService';
import { driveService } from './services/driveService';
import { vehicleService } from './services/vehicleService';

// One-time auto purge of legacy demo cache keys across client browsers
const SYSTEM_CACHE_VERSION = 'shashwat_v9_logo_sync';
if (typeof window !== 'undefined' && localStorage.getItem('shashwat_system_version') !== SYSTEM_CACHE_VERSION) {
  localStorage.removeItem('shashwat_invoices_cache');
  localStorage.removeItem('shashwat_inventory_cache');
  localStorage.removeItem('shashwat_transactions_cache');
  localStorage.removeItem('shashwat_drive_cache');
  localStorage.removeItem('shashwat_vehicles_cache');
  localStorage.setItem('shashwat_system_version', SYSTEM_CACHE_VERSION);
}

// High-resolution photography tailored to each firm's trade:
// 1. Shashwat Woods -> Architectural Sawn Timber, Hardwood Logs & Teak Planks
const WOOD_BG_URL = "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=2400&q=85";
// 2. Shashwat Ashapura Woods -> Architectural Plywood Sheets, Stacked Baltic Birch & Honey Veneer Grains
const PLYWOOD_BG_URL = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85";

const ensureFreshFirmLogo = (firm) => {
  if (!firm) return FIRMS.SHASHWAT_WOODS;
  const isAshapura = firm.id === 'shashwat_ashapura_woods' || firm.name?.toLowerCase().includes('ashapura');
  const freshDef = isAshapura ? FIRMS.SHASHWAT_ASHAPURA_WOODS : FIRMS.SHASHWAT_WOODS;
  return { ...freshDef, ...firm, logo: freshDef.logo };
};

const MODULE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-amber-400" />, fx: 'glow' },
  { id: 'products', label: 'Products', icon: <Package className="w-4 h-4 text-emerald-400" />, fx: 'pop' },
  { id: 'vehicles', label: 'Vehicles', icon: <Truck className="w-4 h-4 text-blue-400" />, fx: 'plane' },
  { id: 'billing', label: 'Billing', icon: <Receipt className="w-4 h-4 text-amber-300" />, fx: 'drop' },
  { id: 'inventory', label: 'Inventory', icon: <Boxes className="w-4 h-4 text-emerald-300" />, fx: 'spin' },
  { id: 'data', label: 'DATA', icon: <Database className="w-4 h-4 text-indigo-400" />, fx: 'wave' },
  { id: 'history', label: 'History Vault', icon: <History className="w-4 h-4 text-rose-400" />, fx: 'drop' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGlowHigh, setIsGlowHigh] = useState(true);
  const [globalWhatsAppReport, setGlobalWhatsAppReport] = useState(false);
  
  // Layer 1 & 2 Auth & Firm States with Guaranteed Fresh Embedded Logos
  const [selectedFirm, setSelectedFirm] = useState(() => {
    try {
      const stored = localStorage.getItem('shashwat_firm');
      return stored ? ensureFreshFirmLogo(JSON.parse(stored)) : FIRMS.SHASHWAT_WOODS;
    } catch (e) {
      return FIRMS.SHASHWAT_WOODS;
    }
  });

  const [lastFirm, setLastFirm] = useState(() => {
    try {
      const stored = localStorage.getItem('shashwat_last_firm') || localStorage.getItem('shashwat_firm');
      return stored ? ensureFreshFirmLogo(JSON.parse(stored)) : FIRMS.SHASHWAT_WOODS;
    } catch (e) {
      return FIRMS.SHASHWAT_WOODS;
    }
  });

  const [authInitialMode, setAuthInitialMode] = useState('login');

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shashwat_user');
      return stored ? JSON.parse(stored) : {
        firstName: 'Authorized',
        lastName: 'Manager',
        name: 'Shashwat Enterprise Admin',
        email: 'admin@shashwatgroup.com',
        role: 'Administrator (HQ)',
        provider: 'verified'
      };
    } catch (e) {
      return {
        firstName: 'Authorized',
        lastName: 'Manager',
        name: 'Shashwat Enterprise Admin',
        email: 'admin@shashwatgroup.com',
        role: 'Administrator (HQ)',
        provider: 'verified'
      };
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
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalType, setStockModalType] = useState('STOCK_IN');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [whatsAppModalInvoice, setWhatsAppModalInvoice] = useState(null);

  // Check for public bill viewing link via query params (?bill=... or ?d=...)
  const [publicBill, setPublicBill] = useState(() => {
    try {
      if (typeof window === 'undefined') return null;
      const params = new URLSearchParams(window.location.search);
      const encodedData = params.get('d') || params.get('bill_data');
      if (encodedData) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
        return decoded;
      }
      const billNo = params.get('bill') || params.get('view_bill');
      if (billNo) {
        const cached = localStorage.getItem('shashwat_invoices_cache');
        if (cached) {
          const list = JSON.parse(cached);
          const found = list.find(i => (i.invoice_number === billNo || i.id === billNo));
          if (found) return found;
        }
      }
    } catch (e) {
      console.warn('Error reading bill from URL:', e);
    }
    return null;
  });

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
    const fresh = ensureFreshFirmLogo(firm);
    setSelectedFirm(fresh);
    setLastFirm(fresh);
    localStorage.setItem('shashwat_firm', JSON.stringify(fresh));
    localStorage.setItem('shashwat_last_firm', JSON.stringify(fresh));
  };

  const handleBackToAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    const targetFirm = ensureFreshFirmLogo(lastFirm || FIRMS.SHASHWAT_WOODS);
    setSelectedFirm(targetFirm);
    if (user) {
      setUser(null);
      localStorage.removeItem('shashwat_user');
    }
  };

  const handleLoginSuccess = (authenticatedUser, firm) => {
    const fresh = ensureFreshFirmLogo(firm);
    setUser(authenticatedUser);
    setSelectedFirm(fresh);
    localStorage.setItem('shashwat_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('shashwat_firm', JSON.stringify(fresh));
  };

  const handleSwitchFirm = () => {
    setSelectedFirm(null);
    localStorage.removeItem('shashwat_firm');
  };

  const handleToggleDivision = () => {
    const isAshapura = selectedFirm?.id === 'shashwat_ashapura_woods' || selectedFirm?.name?.toLowerCase().includes('ashapura');
    const nextFirm = isAshapura ? FIRMS.SHASHWAT_WOODS : FIRMS.SHASHWAT_ASHAPURA_WOODS;
    handleSelectFirm(nextFirm);
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
  const handleCreateInvoice = async (invoiceData, sendToWhatsApp = false) => {
    const res = await billingService.createInvoice(invoiceData);
    if (res.data) {
      loadAllData();
      if (sendToWhatsApp) {
        // Automatically download the vector PDF file (< 8 KB)
        clientMicroPdf.downloadInvoicePdf(res.data);

        // Format WhatsApp phone number (auto-prepend 91 if 10 digits)
        let cleanPhone = (invoiceData.whatsappNo || invoiceData.customerPhone || '').replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const firmName = selectedFirm?.name || (res.data.customer_name?.includes('Plywood') ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
        const msgText = formatWhatsAppMessage(res.data, firmName);

        const waUrl = cleanPhone 
          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msgText)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(msgText)}`;

        window.open(waUrl, '_blank');
        setWhatsAppModalInvoice(res.data);
      } else {
        setSelectedInvoiceForPrint(res.data);
        setIsPrintModalOpen(true);
      }
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
      // 1. Mark factory reset as done and wipe local storage keys
      localStorage.setItem('shashwat_factory_reset_done', 'true');
      localStorage.setItem('shashwat_inventory_cache', '[]');
      localStorage.setItem('shashwat_transactions_cache', '[]');
      localStorage.setItem('shashwat_invoices_cache', '[]');
      localStorage.setItem('shashwat_vehicles_cache', '[]');
      localStorage.setItem('shashwat_drive_cache', '[]');

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

  const handleReloadDemoData = () => {
    localStorage.removeItem('shashwat_factory_reset_done');
    localStorage.removeItem('shashwat_inventory_cache');
    localStorage.removeItem('shashwat_transactions_cache');
    localStorage.removeItem('shashwat_invoices_cache');
    localStorage.removeItem('shashwat_vehicles_cache');
    localStorage.removeItem('shashwat_drive_cache');
    loadAllData();
    alert('Shashwat Group Demo Data loaded successfully!\n\nProducts (Timber & Plywoods), registered fleet vehicles, stock inward/outward records, and commercial bills are now active.');
  };

  // --------------------------------------------------------------------------
  // PUBLIC BILL VIEWER: When customer opens WhatsApp download/view link
  // --------------------------------------------------------------------------
  if (publicBill) {
    return (
      <PublicBillView 
        invoice={publicBill} 
        onBackToApp={() => {
          setPublicBill(null);
          try {
            window.history.replaceState({}, '', window.location.pathname);
          } catch (e) {}
        }} 
      />
    );
  }

  // --------------------------------------------------------------------------
  // LAYER 1: Choose Business Division (Shashwat Woods vs Shashwat Ashapura Woods)
  // --------------------------------------------------------------------------
  if (!selectedFirm) {
    return (
      <FirmSelectionScreen 
        user={user}
        lastFirm={lastFirm}
        onSelectFirm={handleSelectFirm}
        onBackToAuth={handleBackToAuth}
        onBackToDashboard={() => {
          setSelectedFirm(lastFirm || FIRMS.SHASHWAT_WOODS);
        }}
      />
    );
  }

  // --------------------------------------------------------------------------
  // LAYER 2: Authentication / Registration with Gmail OTP & Login
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <AuthScreen
        firm={selectedFirm}
        initialMode={authInitialMode}
        onBackToFirms={handleSwitchFirm}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // --------------------------------------------------------------------------
  // LAYER 3: Main Commercial CRM & Operations System (7 Modules)
  // --------------------------------------------------------------------------
  const isAshapura = selectedFirm?.id === 'shashwat_ashapura_woods' || selectedFirm?.name?.toLowerCase().includes('ashapura');
  const currentBgImage = isAshapura ? PLYWOOD_BG_URL : WOOD_BG_URL;

  return (
    <div className="relative min-h-screen flex flex-col font-sans isolate overflow-x-hidden text-slate-100">
      {/* ===================================================================== */}
      {/* 1. DYNAMIC AMBIENT BACKGROUND WALLPAPER (WOOD / PLYWOOD BASED ON FIRM) */}
      {/* ===================================================================== */}
      <div 
        aria-hidden="true"
        className="fixed inset-0 -z-30 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{
          backgroundImage: `url(${currentBgImage})`,
          filter: isGlowHigh ? 'brightness(0.68) saturate(1.18)' : 'brightness(0.48) saturate(1.0)',
        }}
      />

      {/* Atmospheric Smoke Vignette & Edge Lighting */}
      <div 
        aria-hidden="true"
        className={`fixed inset-0 -z-20 transition-colors duration-700 pointer-events-none ${
          isAshapura 
            ? 'bg-gradient-to-br from-amber-950/75 via-slate-950/70 to-slate-950/85 backdrop-blur-[3px]'
            : 'bg-gradient-to-br from-slate-950/80 via-emerald-950/60 to-slate-950/85 backdrop-blur-[3px]'
        }`}
      />

      {/* Ambient Radial Spotlight Orbs */}
      <div 
        aria-hidden="true" 
        className="fixed -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none -z-10" 
      />
      <div 
        aria-hidden="true" 
        className="fixed top-1/2 right-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none -z-10" 
      />

      {/* Top 21st.dev Glassy Command Bar */}
      <Navbar
        firm={selectedFirm}
        user={user}
        onSwitchFirm={handleSwitchFirm}
        onToggleDivision={handleToggleDivision}
        onLogout={handleLogout}
        onFactoryReset={handleFactoryReset}
        onReloadDemoData={handleReloadDemoData}
        isGlowHigh={isGlowHigh}
        onToggleGlow={() => setIsGlowHigh(!isGlowHigh)}
        onOpenWhatsAppReport={() => setGlobalWhatsAppReport(true)}
        invoices={invoices}
        inventory={inventory}
        vehicles={vehicles}
        transactions={transactions}
        setActiveTab={setActiveTab}
        onPrintInvoice={openPrintModal}
      />

      {/* Top Liquid Glass Module Waterline Bar */}
      <div className="bg-black/45 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex items-center justify-center overflow-x-auto shadow-md no-print sticky top-[57px] z-20">
        <LiquidNavbar
          tone="dark"
          sound={false}
          active={MODULE_NAV_ITEMS.findIndex(m => m.id === activeTab)}
          onChange={(idx) => {
            if (MODULE_NAV_ITEMS[idx]) setActiveTab(MODULE_NAV_ITEMS[idx].id);
          }}
          items={MODULE_NAV_ITEMS}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation & Wixfox Branding */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          firm={selectedFirm}
        />

        <main className="flex-1 p-4 lg:p-7 max-w-7xl mx-auto w-full overflow-y-auto">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-300 text-sm font-semibold">
              Loading {selectedFirm?.name} operations data...
            </div>
          ) : (
            <>
              {/* Module 1: Dashboard */}
              {activeTab === 'dashboard' && (
                <Dashboard
                  firm={selectedFirm}
                  invoices={invoices}
                  inventory={inventory}
                  transactions={transactions}
                  vehicles={vehicles}
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
                  firm={selectedFirm}
                  vehicles={vehicles}
                  onAddVehicle={handleAddVehicle}
                  onUpdateVehicle={handleUpdateVehicle}
                  onDeleteVehicle={handleDeleteVehicle}
                  onUpdateStatus={handleUpdateVehicleStatus}
                />
              )}

              {/* Module 4: Invoice Bill with WhatsApp PDF, Edit & Delete */}
              {activeTab === 'billing' && (
                <Billing
                  invoices={invoices}
                  firm={selectedFirm}
                  inventory={inventory}
                  vehicles={vehicles}
                  onOpenCreate={() => {
                    setInvoiceToEdit(null);
                    setIsInvoiceModalOpen(true);
                  }}
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
                  transactions={transactions}
                  onOpenMovement={openStockModal}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                />
              )}

              {/* Module 6: DATA (Cloud Storage) with Edit & Delete */}
              {activeTab === 'data' && (
                <CloudDrive 
                  firm={selectedFirm}
                  driveFiles={driveFiles} 
                  onUpdateFile={handleUpdateFile}
                  onDeleteFile={handleDeleteFile}
                />
              )}

              {/* Module 7: History (Audit Log) with Delete Entry */}
              {activeTab === 'history' && (
                <StockTransactions 
                  firm={selectedFirm}
                  transactions={transactions}
                  invoices={invoices}
                  vehicles={vehicles}
                  inventory={inventory}
                  onDeleteTransaction={handleDeleteTransaction}
                  onPrintInvoice={openPrintModal}
                  onDeleteInvoice={handleDeleteInvoice}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceToEdit(null);
        }}
        onCreated={handleCreateInvoice}
        onUpdated={handleUpdateInvoice}
        invoiceToEdit={invoiceToEdit}
        inventoryItems={inventory}
        vehicles={vehicles}
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
        firm={selectedFirm}
        onEdit={(inv) => {
          setIsPrintModalOpen(false);
          setInvoiceToEdit(inv);
          setIsInvoiceModalOpen(true);
        }}
      />

      {/* Direct WhatsApp PDF Dispatch Modal */}
      {whatsAppModalInvoice && (
        <WhatsAppModal
          isOpen={Boolean(whatsAppModalInvoice)}
          onClose={() => setWhatsAppModalInvoice(null)}
          invoice={whatsAppModalInvoice}
          firm={selectedFirm}
        />
      )}

      {/* Global Executive Summary WhatsApp Modal */}
      {globalWhatsAppReport && (
        <WhatsAppModal
          isOpen={globalWhatsAppReport}
          onClose={() => setGlobalWhatsAppReport(false)}
          type="dashboard"
          data={{ invoices, inventory, vehicles }}
          firm={selectedFirm}
        />
      )}
    </div>
  );
}
