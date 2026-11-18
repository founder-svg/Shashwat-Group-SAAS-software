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

import InvoiceModal from './components/InvoiceModal';
import StockMovementModal from './components/StockMovementModal';
import PrintBillModal from './components/PrintBillModal';
import SupabaseSetupModal from './components/SupabaseSetupModal';

import { inventoryService } from './services/inventoryService';
import { billingService } from './services/billingService';
import { driveService } from './services/driveService';
import { vehicleService } from './services/vehicleService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
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
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

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

  // Actions
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

  const handleAddItem = async (item) => {
    const res = await inventoryService.addItem(item);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error adding item: ${res.error.message}`);
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

  const handleAddVehicle = async (vehicleData) => {
    const res = await vehicleService.addVehicle(vehicleData);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error adding vehicle: ${res.error.message}`);
    }
  };

  const handleUpdateVehicleStatus = async (id, status, currentDestination) => {
    const res = await vehicleService.updateStatus(id, status, currentDestination);
    if (res.data) {
      loadAllData();
    } else if (res.error) {
      alert(`Error updating vehicle: ${res.error.message}`);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenSetup={() => setIsSetupModalOpen(true)} />

      <div className="flex-1 flex">
        {/* Left Sidebar with 7 Modules & Wixfox Branding */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            if (tab === 'setup') {
              setIsSetupModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }} 
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Loading Shashwat CRM & Operations data...
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

              {/* Module 2: Product Management */}
              {activeTab === 'products' && (
                <ProductManagement
                  inventory={inventory}
                  onAddItem={handleAddItem}
                />
              )}

              {/* Module 3: Vehicle Management */}
              {activeTab === 'vehicles' && (
                <VehicleManagement
                  vehicles={vehicles}
                  onAddVehicle={handleAddVehicle}
                  onUpdateStatus={handleUpdateVehicleStatus}
                />
              )}

              {/* Module 4: Invoice Bill */}
              {activeTab === 'billing' && (
                <Billing
                  invoices={invoices}
                  onOpenCreate={() => setIsInvoiceModalOpen(true)}
                  onPrint={openPrintModal}
                  onRecordPayment={handleRecordPayment}
                />
              )}

              {/* Module 5: Inventory Management */}
              {activeTab === 'inventory' && (
                <Inventory
                  inventory={inventory}
                  onOpenMovement={openStockModal}
                  onAddItem={handleAddItem}
                />
              )}

              {/* Module 6: DATA */}
              {activeTab === 'data' && (
                <CloudDrive driveFiles={driveFiles} />
              )}

              {/* Module 7: History */}
              {activeTab === 'history' && (
                <StockTransactions transactions={transactions} />
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

      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
}
