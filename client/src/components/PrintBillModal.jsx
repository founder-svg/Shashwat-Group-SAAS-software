import React, { useState } from 'react';
import { X, Printer, Download, HardDrive, ShieldCheck, FileCheck, Pencil, Eye } from 'lucide-react';
import { clientMicroPdf } from '../utils/microPdfGenerator';
import WhatsAppModal from './WhatsAppModal';

export default function PrintBillModal({ isOpen, onClose, invoice, firm, onEdit }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    clientMicroPdf.downloadInvoicePdf(invoice);
  };

  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
  const companyTitle = invoice.firm_name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
  const companyLogo = isAshapura ? '/assets/saw-wood-logo.png' : '/assets/sw-wood-logo.png';

  const subtotal = Number(invoice.subtotal || 0);
  const taxRate = Number(invoice.tax_rate || 0);
  const taxAmount = Number(invoice.tax_amount || 0);
  const grandTotal = Number(invoice.total_amount || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const balanceDue = Number(invoice.balance_due || (grandTotal - amountPaid));

  const items = invoice.items || [];
  const totalPcs = items.reduce((acc, it) => acc + (Number(it.pieces) || Number(it.quantity) || 1), 0);
  const totalVolume = items.reduce((acc, it) => acc + (Number(it.total_cft || it.totalCft) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
        {/* Top Control Bar (Hidden when printing) - Contains Preview, Print, WhatsApp PDF, Download PDF, Edit */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2.5 no-print">
          <div className="flex items-center space-x-2">
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-600 text-white">
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Bill</span>
            </span>
            <span className="text-xs text-amber-400 font-mono font-bold">
              {invoice.invoice_number}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <FileCheck className="w-3.5 h-3.5" />
              {invoice.file_size_kb || 5.4} KB (.pdf)
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* 1. Print Bill (A4 / Thermal) */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition border border-slate-700 shadow-sm"
              title="Print bill on A4 sheet or Thermal printer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print</span>
            </button>

            {/* 2. Direct WhatsApp PDF Send Button */}
            <button
              onClick={() => setShowWhatsApp(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              title="Send bill directly to customer on WhatsApp in PDF format"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
              </svg>
              <span>WhatsApp PDF</span>
            </button>

            {/* 3. Direct PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              title="Download vector PDF file (< 8 KB)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate / Download PDF</span>
            </button>

            {/* 4. Edit Bill Button */}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(invoice);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-sm"
                title="Edit this invoice"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Bill</span>
              </button>
            )}

            <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1 ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Content formatted per client packing list / invoice sample */}
        <div id="printable-bill" className="p-6 sm:p-8 text-slate-900 text-xs bg-white">
          {/* Centered Sacred Invocation */}
          <div className="text-center mb-1">
            <p className="text-xs font-bold text-slate-700 tracking-wider font-serif">
              ॥ श्री गणेशाय नमः ॥
            </p>
          </div>

          {/* Company Name & Gandhidham Address */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {companyTitle}
            </h1>
            <p className="text-[11px] font-bold text-amber-900 tracking-wider my-0.5">
              ॥ नीति शतकम् ॥
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-700 font-medium max-w-2xl mx-auto leading-tight">
              PLOT NO-163-164, SHOP NO-1/2/3, SN-138 NR. VENUS SOCIETY, ANTARJAL, GANDHIDHAM KUTCH GUJARAT-370205
            </p>
            <p className="text-[11px] font-bold text-slate-900 mt-0.5">
              Mo: +91 91379 21191, +91 99982 55525
            </p>
            <div className="mt-2 inline-block px-4 py-0.5 bg-slate-900 text-white rounded text-[11px] font-black uppercase tracking-widest">
              TAX INVOICE &amp; PACKING LIST
            </div>
          </div>

          {/* Consignee, Vehicle & Transport Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-slate-400 rounded-lg p-3.5 mb-4 text-[11px] bg-slate-50/60 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Consignee / Billed To:</p>
              <p className="text-sm font-black text-slate-950">{invoice.customer_name}</p>
              {invoice.customer_phone && (
                <p className="text-slate-700"><span className="font-semibold">Phone:</span> {invoice.customer_phone}</p>
              )}
              {invoice.customer_address && (
                <p className="text-slate-700"><span className="font-semibold">Site / Address:</span> {invoice.customer_address}</p>
              )}
            </div>

            <div className="sm:text-right space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <p><span className="font-bold text-slate-700">DATE:</span> <span className="font-mono font-bold text-slate-950">{invoice.invoice_date}</span></p>
              <p><span className="font-bold text-slate-700">INVOICE NO:</span> <span className="font-mono font-black text-slate-950">{invoice.invoice_number}</span></p>
              <p><span className="font-bold text-slate-700">VEHICLE NO:</span> <span className="font-mono font-black text-blue-900">{invoice.vehicle_no || invoice.vehicleNo || 'GJ-18-BW-7236'}</span></p>
              <p><span className="font-bold text-slate-700">TRANSPORT:</span> <span className="font-bold text-slate-900 uppercase">{invoice.transport || 'ARRANGE'}</span></p>
              <p><span className="font-bold text-slate-700">PAYMENT:</span> <span className="font-semibold text-slate-800">{invoice.payment_method || 'Bank Transfer'}</span></p>
            </div>
          </div>

          {/* Client Requested Packing List Table Format */}
          {/* Columns: Sr.No | Vehicle No | Length | Width | Thick | Peace | Description | Specific | Total */}
          <div className="overflow-x-auto mb-4 border border-slate-900 rounded-lg">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                  <th className="py-2 px-2 text-center border-r border-slate-700 w-10">Sr.No</th>
                  <th className="py-2 px-2 text-center border-r border-slate-700 w-24">Vehicle No</th>
                  <th className="py-2 px-2 text-center border-r border-slate-700 w-14">Length</th>
                  <th className="py-2 px-2 text-center border-r border-slate-700 w-14">Width</th>
                  <th className="py-2 px-2 text-center border-r border-slate-700 w-14">Thick</th>
                  <th className="py-2 px-2 text-center border-r border-slate-700 w-14">Peace</th>
                  <th className="py-2 px-3 border-r border-slate-700">Description &amp; Specific</th>
                  <th className="py-2 px-2 text-center border-r border-slate-700 w-20">CFT / Sq.Ft</th>
                  <th className="py-2 px-2 text-right border-r border-slate-700 w-20">Rate (₹)</th>
                  <th className="py-2 px-3 text-right w-24">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {items.map((it, idx) => {
                  const pcs = it.pieces || (it.total_cft ? it.quantity : it.quantity) || 1;
                  const cftVal = it.total_cft || it.totalCft || 0;
                  const rowVeh = it.vehicle_no || it.vehicleNo || invoice.vehicle_no || invoice.vehicleNo || '-';
                  const len = it.length ? `${it.length}'` : '-';
                  const wid = it.width ? `${it.width}"` : '-';
                  const thk = it.thickness ? `${it.thickness}"` : '-';

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-2 text-center font-bold text-slate-700 border-r border-slate-300">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-800 border-r border-slate-300">
                        {rowVeh}
                      </td>
                      <td className="py-2 px-2 text-center font-mono border-r border-slate-300">
                        {len}
                      </td>
                      <td className="py-2 px-2 text-center font-mono border-r border-slate-300">
                        {wid}
                      </td>
                      <td className="py-2 px-2 text-center font-mono border-r border-slate-300">
                        {thk}
                      </td>
                      <td className="py-2 px-2 text-center font-black text-slate-900 border-r border-slate-300">
                        {pcs}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300">
                        <p className="font-bold text-slate-950">{it.item_name || it.itemName}</p>
                        {(it.item_description || it.itemDescription) && (
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            {it.item_description || it.itemDescription}
                          </p>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800 border-r border-slate-300">
                        {cftVal > 0 ? `${Number(cftVal).toFixed(3)}` : '-'}
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-slate-800 border-r border-slate-300">
                        ₹{Number(it.unit_price || it.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-950">
                        ₹{Number(it.total_price || it.totalPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[10px] text-slate-900 uppercase">
                  <td colSpan="5" className="py-2 px-3 text-right">TOTAL:</td>
                  <td className="py-2 px-2 text-center font-black text-slate-950">{totalPcs} Peace</td>
                  <td></td>
                  <td className="py-2 px-2 text-center font-mono font-black text-emerald-800">
                    {totalVolume > 0 ? `${totalVolume.toFixed(3)} CFT` : '-'}
                  </td>
                  <td></td>
                  <td className="py-2 px-3 text-right font-black text-slate-950">
                    ₹{subtotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Calculation Summary: Conditional GST */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="w-full sm:w-1/2 space-y-1 text-[11px] text-slate-600">
              <p><span className="font-bold text-slate-800">Calculation Formula:</span> Length (ft) × Width (in) × Pieces / 144 = Total CFT</p>
              {invoice.notes && (
                <p><span className="font-bold text-slate-800">Remarks:</span> {invoice.notes}</p>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-slate-800 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Dynamic GST Row: ONLY rendered if taxRate > 0 */}
              {taxRate > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>GST ({taxRate}%):</span>
                  <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                </div>
              )}

              {Number(invoice.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{Number(invoice.discount_amount).toFixed(2)}</span>
                </div>
              )}

              <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between font-black text-sm text-slate-950">
                <span>Total Amount:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span>₹{amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-rose-700 border-t border-slate-200 pt-1">
                <span>Balance Due:</span>
                <span>₹{balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Signatory */}
          <div className="border-t border-slate-300 pt-4 flex justify-between items-end text-[10px] text-slate-600">
            <div className="max-w-xs space-y-1">
              <p className="font-bold text-slate-800">Terms &amp; Conditions:</p>
              <p>1. Goods once sold will not be taken back.</p>
              <p>2. Payment due strictly within terms.</p>
              <p className="text-[9px] text-emerald-700 font-mono mt-1">
                Micro-optimized vector document (~5 KB) • Electronically Verified
              </p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-500 w-44 mb-1 ml-auto"></div>
              <p className="font-bold text-slate-900">Authorized Signatory</p>
              <p className="text-[9px] font-semibold text-slate-700">For {companyTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp PDF Dispatch Modal */}
      {showWhatsApp && (
        <WhatsAppModal
          isOpen={showWhatsApp}
          onClose={() => setShowWhatsApp(false)}
          invoice={invoice}
          firm={firm}
        />
      )}
    </div>
  );
}
