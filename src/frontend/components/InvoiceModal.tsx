import React from 'react';
import { X, Receipt, Download, Smartphone, Printer, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, User } from '../../types';

interface InvoiceModalProps {
   order: Order | null;
   isOpen: boolean;
   onClose: () => void;
   user: User | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose, user }) => {
   if (!order) return null;

   const handlePrint = () => {
      window.print();
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <>
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] print:hidden"
               />
               <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] bg-white z-[110] rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:inset-0 print:w-full print:h-full print:rounded-none print:shadow-none"
               >
                  {/* Header */}
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20 print:hidden">
                     <div className="flex items-center gap-2">
                        <Receipt className="text-emerald-600" />
                        <h2 className="text-xl font-black italic">Tax Invoice</h2>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={handlePrint} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all font-bold flex items-center gap-2">
                           <Printer size={18} /> Print
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                           <X size={20} />
                        </button>
                     </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-12 print:p-0">
                     {/* 3 inch Thermal Receipt Styling container */}
                     <div className="max-w-[400px] mx-auto print:max-w-[80mm] print:w-full print:mx-auto print:px-2 print:font-mono text-black space-y-4">
                        <div className="text-center mb-8">
                           <div className="flex flex-col items-center gap-2 mb-4">
                              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                 <Zap size={24} fill="white" />
                              </div>
                              <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase border-b-2 border-slate-900 inline-block">AK Store</h1>
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                              Bank Road<br />
                              Raxaul, Bihar - 845305<br />
                              GSTIN: 06AAAAA0000A1Z5
                           </p>
                        </div>

                        <div className="py-4 border-y border-slate-900 border-dashed mb-6 text-[10px] space-y-1 font-bold">
                           <div className="flex justify-between">
                              <span>INV NO:</span>
                              <span>#AK-{order.id}-{new Date(order.created_at).getTime().toString().slice(-4)}</span>
                           </div>
                           <div className="flex justify-between">
                              <span>DATE:</span>
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                           </div>
                           <div className="flex justify-between">
                              <span>CUST:</span>
                              <span className="uppercase">{user?.name}</span>
                           </div>
                        </div>

                        {/* Items Table - Simplified for 3 inch */}
                        <table className="w-full text-[10px] font-bold mb-6">
                           <thead>
                              <tr className="border-b border-slate-900 border-dashed">
                                 <th className="py-2 text-left">ITEM</th>
                                 <th className="py-2 text-center w-8">QTY</th>
                                 <th className="py-2 text-right">TOTAL</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 divide-dashed">
                              {order.order_items?.map((item, i) => (
                                 <tr key={i}>
                                    <td className="py-3 uppercase leading-tight pr-2">{item.product_name}</td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right">₹{item.price * item.quantity}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>

                        <div className="border-t border-slate-900 border-dashed py-4 space-y-2 text-[10px] font-black">
                           <div className="flex justify-between">
                              <span>SUBTOTAL</span>
                              <span>₹{(order.total + (order.discount_amount || 0)).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between">
                              <span>DELIVERY</span>
                              <span className="text-emerald-700">FREE</span>
                           </div>
                           {order.discount_amount > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                 <span>COUPON DISCOUNT</span>
                                 <span>-₹{order.discount_amount.toFixed(2)}</span>
                              </div>
                           )}
                           <div className="flex justify-between text-lg pt-2 border-t border-slate-200">
                              <span className="italic uppercase">Grand Total</span>
                              <span className="italic uppercase">₹{order.total.toFixed(2)}</span>
                           </div>
                        </div>

                        <div className="mt-8 text-center space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest">*** THANK YOU ***</p>
                           <p className="text-[8px] font-bold text-slate-400">Visit again: www.akstore.com</p>
                           <div className="h-4 border-b-2 border-slate-100 border-dashed" />
                        </div>
                     </div>
                  </div>

                  <style dangerouslySetInnerHTML={{
                     __html: `
              @media print {
                @page { margin: 0; size: 80mm auto; }
                body { margin: 0; padding: 0; background: white; color: black; font-family: 'Courier New', Courier, monospace; -webkit-print-color-adjust: exact; }
                .print\\:hidden { display: none !important; }
                * { box-sizing: border-box; }
              }
            `}} />
               </motion.div>
            </>
         )}
      </AnimatePresence>
   );
};
