import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import StockTransactions from './pages/StockTransactions';
import CloudDrive from './pages/CloudDrive';
import InvoiceModal from './components/InvoiceModal';
import StockMovementModal from './components/StockMovementModal';
import PrintBillModal from './components/PrintBillModal';
import SupabaseSetupModal from './components/SupabaseSetupModal';

import { inventoryService } from './services/inventoryService';
import { billingService } from './services/billingService';
import { driveService } from './services/driveService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
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
      const [invRes, billRes, transRes, driveRes] = await Promise.all([
        inventoryService.getItems(),
        billingService.getInvoices(),
        inventoryService.getTransactions(),
        driveService.getFiles()
      ]);

      if (invRes.data) setInventory(invRes.data);
      if (billRes.data) setInvoices(billRes.data);
      if (transRes.data) setTransactions(transRes.data);
      if (driveRes.data) setDriveFiles(driveRes.data);
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
      // Refresh state
      loadAllData();
      // Auto open print modal
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
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
          if (tab === 'setup') {
            setIsSetupModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Loading Shashwat CRM & Inventory data...
            </div>
          ) : (
            <>
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

              {activeTab === 'billing' && (
                <Billing
                  invoices={invoices}
                  onOpenCreate={() => setIsInvoiceModalOpen(true)}
                  onPrint={openPrintModal}
                  onRecordPayment={handleRecordPayment}
                />
              )}

              {activeTab === 'inventory' && (
                <Inventory
                  inventory={inventory}
                  onOpenMovement={openStockModal}
                  onAddItem={handleAddItem}
                />
              )}

              {activeTab === 'transactions' && (
                <StockTransactions transactions={transactions} />
              )}

              {activeTab === 'drive' && (
                <CloudDrive driveFiles={driveFiles} />
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
