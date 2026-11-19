import React, { useEffect, useState } from 'react';
import { Download, Printer, ArrowLeft, CheckCircle2, ShieldCheck, Building2, X } from 'lucide-react';
import { clientMicroPdf } from '../utils/microPdfGenerator';

export default function PublicBillView({ invoice, onBackToApp }) {
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    // Attempt auto-download once on initial mount for instant customer satisfaction
    const timer = setTimeout(() => {
      try {
        if (invoice) {
          clientMicroPdf.downloadInvoicePdf(invoice);
          setDownloaded(true);
        }
      } catch (e) {
        console.warn('Auto download error:', e);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [invoice]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invoice Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The requested invoice link appears to be invalid or incomplete.
          </p>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
            >
              Go to Shashwat Group CRM
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    clientMicroPdf.downloadInvoicePdf(invoice);
    setDownloaded(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine firm details
  const isAshapura = invoice.firm_id === 'ashapura' || invoice.firm_name?.includes('ASHAPURA') || invoice.company_name?.includes('ASHAPURA');
  const firmTitle = isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS';
  const firmSubtitle = isAshapura 
    ? 'Manufacturers & Suppliers of High-Quality Commercial Timber & Plywoods'
    : 'Manufacturers & Exporters of Premium Pine, Teak, Sal & Hardwood Timber';
  const firmGstin = isAshapura ? '24AALFS9876Q1Z9' : '24ABCDE1234F1Z5';

  // Robust items extraction: Never blank
  let items = invoice.items || invoice.invoice_items || invoice.line_items || [];
  if ((!items || items.length === 0) && invoice.notes && invoice.notes.includes('<!--ITEMS:')) {
    try {
      const match = invoice.notes.match(/<!--ITEMS:(.*?)-->/);
      if (match) items = JSON.parse(match[1]);
    } catch (e) {}
  }
  if ((!items || items.length === 0) && Number(invoice.total_amount || invoice.subtotal || 0) > 0) {
    items = [{
      itemName: 'Commercial Timber & Wood Materials Supply',
      item_name: 'Commercial Timber & Wood Materials Supply',
      vehicleNo: invoice.vehicle_no || invoice.vehicleNo || 'GJ-18-BW-7236',
      vehicle_no: invoice.vehicle_no || invoice.vehicleNo || 'GJ-18-BW-7236',
      length: '',
      width: '',
      pieces: invoice.total_pieces || 1,
      quantity: invoice.total_pieces || 1,
      calculatedSqFt: invoice.total_sqft || 0,
      itemDescription: 'Materials Dispatched as per Delivery Order',
      specific: 'Standard Commercial Grade',
      unitPrice: Number(invoice.subtotal || invoice.total_amount || 0),
      totalPrice: Number(invoice.subtotal || invoice.total_amount || 0),
      total_price: Number(invoice.subtotal || invoice.total_amount || 0)
    }];
  }

  const emptyRowsCount = Math.max(0, 6 - items.length);
  const taxRate = Number(invoice.tax_rate || 0);
  const taxAmount = Number(invoice.tax_amount || 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Top Header & Actions Bar (Hidden during print) */}
        <div className="print:hidden bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
                Official Commercial Invoice & Packing List
              </span>
              <h1 className="text-base font-black text-white">
                {invoice.invoice_number || 'INVOICE'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {/* Primary Download PDF Button */}
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{downloaded ? 'Download PDF Again' : 'Download PDF Bill'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center space-x-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print</span>
            </button>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer ring-2 ring-red-400/40"
                title="Close Preview & Return to CRM"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Close</span>
              </button>
            )}
          </div>
        </div>

        {/* Download notification alert */}
        {downloaded && (
          <div className="print:hidden bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official vector PDF file (under 8 KB) downloaded to your device downloads folder.</span>
            </span>
            <button 
              onClick={() => setDownloaded(false)}
              className="text-emerald-400 hover:text-white text-xs underline font-semibold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* The Commercial Invoice Document matching client sample format */}
        <div id="printable-bill" className="bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-200 text-xs font-sans">
          
          {/* Top Auspicious Inscription */}
          <div className="text-center mb-1">
            <p className="text-xs font-bold text-slate-800 tracking-wider font-serif">
              ॥ श्री गणेशाय नमः ॥
            </p>
          </div>

          {/* Firm Title Header */}
          <div className="border-2 border-slate-900 bg-slate-50 p-4 rounded-t-lg text-center mb-0">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
              {firmTitle}
            </h2>
            <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
              {firmSubtitle}
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              Plot No. 163-164, Shop 1-3, SN-138 Nr. Venus Society, GIDC Industrial Estate, Gandhidham, Kutch, Gujarat - 370205
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-1 text-[11px] font-mono font-bold text-slate-800">
              <span>GSTIN: {firmGstin}</span>
              <span>STATE: 24 - GUJARAT</span>
              <span>MO: +91 91379 21191 / +91 99982 55525</span>
            </div>
          </div>

          {/* Sub Header: Customer / Consignee on Left | Date, Invoice No, Vehicle on Right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-x-2 border-b-2 border-slate-900 text-xs">
            {/* Consignee */}
            <div className="p-3 border-b sm:border-b-0 sm:border-r border-slate-900 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Customer / Consignee Name &amp; Address:
              </span>
              <p className="font-black text-sm text-slate-950 uppercase">
                {invoice.customer_name || invoice.customerName || 'Valued Customer'}
              </p>
              {(invoice.customer_address || invoice.customerAddress) && (
                <p className="text-slate-700">
                  {invoice.customer_address || invoice.customerAddress}
                </p>
              )}
              {(invoice.customer_phone || invoice.customerPhone) && (
                <p className="font-mono text-slate-800">
                  Phone: {invoice.customer_phone || invoice.customerPhone}
                </p>
              )}
            </div>

            {/* Invoice & Dispatch Details */}
            <div className="p-3 space-y-1 bg-slate-50/50">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                <span className="font-bold text-slate-700 uppercase text-[10px]">INVOICE NO:</span>
                <span className="font-mono font-black text-sm text-slate-950">
                  {invoice.invoice_number || invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                <span className="font-bold text-slate-700 uppercase text-[10px]">DATE:</span>
                <span className="font-mono font-bold text-slate-900">
                  {invoice.invoice_date || invoice.invoiceDate}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                <span className="font-bold text-slate-700 uppercase text-[10px]">VEHICLE NO:</span>
                <span className="font-mono font-bold text-slate-900">
                  {invoice.vehicle_no || invoice.vehicleNo || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-bold text-slate-700 uppercase text-[10px]">PAYMENT METHOD:</span>
                <span className="font-bold text-slate-800">
                  {invoice.payment_method || invoice.paymentMethod || 'Bank Transfer (NEFT/RTGS)'}
                </span>
              </div>
            </div>
          </div>

          {/* Table Formula Legend */}
          <div className="bg-slate-100/80 px-3 py-1.5 border-x-2 border-b border-slate-900 flex justify-between items-center text-[11px]">
            <span className="font-bold text-slate-800">
              Commercial Timber Packing List &amp; Measurement Table
            </span>
            <span className="font-mono font-bold text-slate-600">
              Formula: (Length &times; Width &times; Peace) / 144 = Total Sq.Ft
            </span>
          </div>

          {/* 9-Column Commercial Table */}
          <div className="overflow-x-auto border-x-2 border-b-2 border-slate-900">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-200/90 text-slate-950 uppercase font-black text-[10px] border-b-2 border-slate-900">
                  <th className="py-2.5 px-2 text-center border-r border-slate-400 w-10">Sr.no</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-400 w-28">vechile no</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-400 w-16">length</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-400 w-16">width</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-400 w-14">peace</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-400 w-20">sq.ft</th>
                  <th className="py-2.5 px-3 border-r border-slate-400">description</th>
                  <th className="py-2.5 px-3 border-r border-slate-400">specific</th>
                  <th className="py-2.5 px-3 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {items.map((it, idx) => {
                  const len = Number(it.length || 0);
                  const wid = Number(it.width || 0);
                  const pcs = Number(it.pieces || it.quantity || 1);
                  const calculatedSqFt = it.calculatedSqFt !== undefined 
                    ? Number(it.calculatedSqFt) 
                    : (len > 0 && wid > 0 ? (len * wid * pcs) / 144 : 0);
                  const rowVeh = it.vehicleNo || it.vehicle_no || invoice.vehicle_no || invoice.vehicleNo || '-';
                  const desc = it.itemName || it.item_name || '';
                  const spec = it.itemDescription || it.item_description || it.specific || '-';
                  const rowTot = Number(it.totalPrice || it.total_price || 0);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-2 text-center font-bold text-slate-800 border-r border-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-800 border-r border-slate-400">
                        {rowVeh}
                      </td>
                      <td className="py-2 px-2 text-center font-mono border-r border-slate-400">
                        {len || '-'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono border-r border-slate-400">
                        {wid || '-'}
                      </td>
                      <td className="py-2 px-2 text-center font-black text-slate-950 border-r border-slate-400">
                        {pcs}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-black text-emerald-800 border-r border-slate-400">
                        {calculatedSqFt > 0 ? Number(calculatedSqFt).toFixed(3) : '-'}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-950 border-r border-slate-400">
                        {desc}
                      </td>
                      <td className="py-2 px-3 text-slate-700 border-r border-slate-400">
                        {spec}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-950">
                        ₹{rowTot.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

                {/* Empty rows to maintain professional tabular proportion */}
                {Array.from({ length: emptyRowsCount }).map((_, eIdx) => (
                  <tr key={`empty-${eIdx}`} className="h-7 text-slate-300">
                    <td className="border-r border-slate-400 text-center text-[10px] text-slate-300">
                      {items.length + eIdx + 1}
                    </td>
                    <td className="border-r border-slate-400"></td>
                    <td className="border-r border-slate-400"></td>
                    <td className="border-r border-slate-400"></td>
                    <td className="border-r border-slate-400"></td>
                    <td className="border-r border-slate-400"></td>
                    <td className="border-r border-slate-400"></td>
                    <td className="border-r border-slate-400"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & GST Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-x-2 border-b-2 border-slate-900">
            {/* Left: Summary Terms */}
            <div className="p-3 border-b sm:border-b-0 sm:border-r border-slate-900 flex flex-col justify-between text-[11px] text-slate-600">
              <div>
                <p className="font-bold text-slate-800">TERMS &amp; CONDITIONS:</p>
                <ol className="list-decimal pl-4 space-y-0.5 mt-1">
                  <li>Goods once sold will not be taken back or exchanged.</li>
                  <li>Our responsibility ceases after delivery from our saw mill or godown.</li>
                  <li>All disputes subject to Gandhidham (Kutch) Jurisdiction.</li>
                </ol>
              </div>
              <div className="pt-2 font-mono text-[10px] text-slate-500">
                Generated via Shashwat Group Commercial SaaS Platform
              </div>
            </div>

            {/* Right: Subtotal, Conditional GST & Grand Total */}
            <div className="p-3 space-y-1 bg-slate-50 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{Number(invoice.subtotal || invoice.total_amount || 0).toFixed(2)}
                </span>
              </div>

              {/* Dynamic GST row: strictly appears ONLY if GST rate > 0 */}
              {taxRate > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-200 text-amber-900">
                  <span className="font-semibold">GST ({taxRate}%):</span>
                  <span className="font-mono font-bold">
                    + ₹{taxAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm">
                <span className="font-black text-slate-950 uppercase">Grand Total:</span>
                <span className="font-mono font-black text-base text-slate-950">
                  ₹{Number(invoice.total_amount || invoice.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Signatures */}
          <div className="grid grid-cols-2 border-x-2 border-b-2 border-slate-900 p-4 text-center">
            <div className="pt-8">
              <p className="border-t border-slate-400 inline-block px-8 font-bold text-slate-800 text-[11px]">
                Receiver's Signature
              </p>
            </div>
            <div className="pt-8 text-right pr-4">
              <p className="font-bold text-slate-900 text-[11px] mb-6">
                For, {firmTitle}
              </p>
              <p className="border-t border-slate-400 inline-block px-8 font-bold text-slate-800 text-[11px]">
                Authorised Signatory
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
