import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Wrench,
  Shield,
  Gauge,
  Pencil,
  Trash2,
  X
} from 'lucide-react';
import { moduleWhatsApp } from '../utils/moduleWhatsAppSharer';
import WhatsAppModal from '../components/WhatsAppModal';

export default function VehicleManagement({ 
  firm,
  vehicles = [], 
  onAddVehicle, 
  onUpdateVehicle, 
  onDeleteVehicle, 
  onUpdateStatus 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [whatsAppVehicle, setWhatsAppVehicle] = useState(null);

  // Form State for Add
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [capacityKg, setCapacityKg] = useState('2000');
  const [notes, setNotes] = useState('');

  // Form State for Edit
  const [editNumber, setEditNumber] = useState('');
  const [editType, setEditType] = useState('');
  const [editDriver, setEditDriver] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editStatus, setEditStatus] = useState('available');
  const [editDestination, setEditDestination] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const openEditModal = (v) => {
    setEditingVehicle(v);
    setEditNumber(v.vehicle_number || '');
    setEditType(v.vehicle_type || 'Truck');
    setEditDriver(v.driver_name || '');
    setEditPhone(v.driver_phone || '');
    setEditCapacity(v.capacity_kg !== undefined ? v.capacity_kg.toString() : '2000');
    setEditStatus(v.status || 'available');
    setEditDestination(v.current_destination || 'Warehouse Base');
    setEditNotes(v.notes || '');
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = vehicles.filter(v => v.status === 'available').length;
  const onDeliveryCount = vehicles.filter(v => v.status === 'on_delivery').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      alert('Vehicle registration number is required');
      return;
    }

    onAddVehicle({
      vehicle_number: vehicleNumber.trim().toUpperCase(),
      vehicle_type: vehicleType,
      driver_name: driverName.trim() || 'Unassigned',
      driver_phone: driverPhone.trim(),
      capacity_kg: parseFloat(capacityKg) || 1000,
      status: 'available',
      current_destination: 'Warehouse Base',
      notes
    });

    setShowAddModal(false);
    setVehicleNumber('');
    setDriverName('');
    setDriverPhone('');
    setNotes('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editNumber.trim()) {
      alert('Vehicle registration number is required');
      return;
    }

    if (onUpdateVehicle) {
      onUpdateVehicle(editingVehicle.id, {
        vehicle_number: editNumber.trim().toUpperCase(),
        vehicle_type: editType,
        driver_name: editDriver.trim() || 'Unassigned',
        driver_phone: editPhone.trim(),
        capacity_kg: parseFloat(editCapacity) || 1000,
        status: editStatus,
        current_destination: editDestination.trim() || 'Warehouse Base',
        notes: editNotes.trim()
      });
    }

    setEditingVehicle(null);
  };

  const handleDeleteClick = (v) => {
    if (confirm(`Are you sure you want to delete vehicle "${v.vehicle_number}" (${v.driver_name})?`)) {
      if (onDeleteVehicle) {
        onDeleteVehicle(v.id);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <Truck className="w-5 h-5 text-brand-600" />
              <span>Vehicle &amp; Fleet Management</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log delivery fleet, driver assignments, payload capacity, and edit or delete transport records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => moduleWhatsApp.shareFleetSummary(firm, vehicles)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            title="Share Fleet Report via WhatsApp"
          >
            <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
            </svg>
            <span>WhatsApp Fleet</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fleet</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{vehicles.length} Vehicles</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Available / Standby</span>
          <p className="text-lg font-black text-emerald-700 mt-0.5">{availableCount} Ready</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">On Active Delivery</span>
          <p className="text-lg font-black text-blue-700 mt-0.5">{onDeliveryCount} Dispatched</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Maintenance</span>
          <p className="text-lg font-black text-amber-700 mt-0.5">{maintenanceCount} In Service</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vehicle number, driver, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs w-full sm:w-auto overflow-x-auto">
          {['ALL', 'available', 'on_delivery', 'maintenance'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'available' ? 'Available' : st === 'on_delivery' ? 'On Delivery' : st === 'maintenance' ? 'In Maintenance' : 'All Fleet'}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Grid & Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
            No vehicles registered yet. Click &quot;Add New Vehicle&quot; to register your transport fleet.
          </div>
        ) : (
          filteredVehicles.map((v) => {
            const isAvail = v.status === 'available';
            const isOnDeliv = v.status === 'on_delivery';

            return (
              <div 
                key={v.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-3.5 relative group"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${
                      isAvail ? 'bg-emerald-50 text-emerald-700' : isOnDeliv ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 font-mono tracking-tight">
                        {v.vehicle_number}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500">{v.vehicle_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAvail
                        ? 'bg-emerald-100 text-emerald-800'
                        : isOnDeliv
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isAvail && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isOnDeliv && <Clock className="w-3 h-3 text-blue-600" />}
                      {!isAvail && !isOnDeliv && <Wrench className="w-3 h-3 text-amber-600" />}
                      {isAvail ? 'Available' : isOnDeliv ? 'On Delivery' : 'Maintenance'}
                    </span>

                    {/* WhatsApp Pass, Edit & Delete Action Buttons */}
                    <button
                      type="button"
                      onClick={() => setWhatsAppVehicle(v)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                      title="Send Vehicle Pass & Trip Details to Driver on WhatsApp"
                    >
                      <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
                      </svg>
                      <span>Pass</span>
                    </button>
                    <button
                      onClick={() => openEditModal(v)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                      title="Edit Vehicle"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(v)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Driver & Details */}
                <div className="bg-slate-50/80 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-400 font-medium">Driver:</span>
                    <span className="font-bold text-slate-800">{v.driver_name || 'Unassigned'}</span>
                  </div>
                  {v.driver_phone && (
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-400 font-medium">Phone:</span>
                      <a href={`tel:${v.driver_phone}`} className="font-mono text-brand-600 hover:underline">
                        {v.driver_phone}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-400 font-medium">Capacity:</span>
                    <span className="font-bold text-slate-800">{v.capacity_kg} kg</span>
                  </div>
                </div>

                {/* Location / Current Route */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-semibold truncate">
                    {v.current_destination || 'Warehouse Base'}
                  </span>
                </div>

                {/* Status Toggle Quick Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Change Status:</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onUpdateStatus(v.id, 'available', 'Warehouse Base')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        isAvail ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => onUpdateStatus(v.id, 'on_delivery', v.current_destination || 'In Transit')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        isOnDeliv ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
                      }`}
                    >
                      Dispatch
                    </button>
                    <button
                      onClick={() => onUpdateStatus(v.id, 'maintenance', 'Service Center')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        !isAvail && !isOnDeliv ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                      }`}
                    >
                      Service
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" /> Register New Vehicle
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)} 
                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition ring-1 ring-red-400 cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Registration No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GJ-12-SG-8842"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Eicher 14ft Truck">Eicher 14ft Truck</option>
                    <option value="Tata Ace Mini Van">Tata Ace Mini Van</option>
                    <option value="Mahindra Bolero Pickup">Mahindra Bolero Pickup</option>
                    <option value="20ft Heavy Flatbed">20ft Heavy Flatbed</option>
                    <option value="Trailer 40ft (Logs)">Trailer 40ft (Timber Logs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Jadhav"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91-9876543210"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payload Capacity (kg)</label>
                <input
                  type="number"
                  placeholder="2000"
                  value={capacityKg}
                  onChange={(e) => setCapacityKg(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Notes / Route Info</label>
                <textarea
                  rows="2"
                  placeholder="Insurance validity, regular route, fitness certificate..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VEHICLE MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" /> Edit Vehicle Details
              </h3>
              <button 
                type="button"
                onClick={() => setEditingVehicle(null)} 
                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition ring-1 ring-red-400 cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Registration No *</label>
                  <input
                    type="text"
                    required
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Eicher 14ft Truck">Eicher 14ft Truck</option>
                    <option value="Tata Ace Mini Van">Tata Ace Mini Van</option>
                    <option value="Mahindra Bolero Pickup">Mahindra Bolero Pickup</option>
                    <option value="20ft Heavy Flatbed">20ft Heavy Flatbed</option>
                    <option value="Trailer 40ft (Logs)">Trailer 40ft (Timber Logs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={editDriver}
                    onChange={(e) => setEditDriver(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (kg)</label>
                  <input
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="available">Available</option>
                    <option value="on_delivery">On Delivery</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Destination / Route</label>
                <input
                  type="text"
                  value={editDestination}
                  onChange={(e) => setEditDestination(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Update Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* WhatsApp Modal for Vehicle Gate Pass */}
      {whatsAppVehicle && (
        <WhatsAppModal
          isOpen={Boolean(whatsAppVehicle)}
          onClose={() => setWhatsAppVehicle(null)}
          type="vehicle"
          data={whatsAppVehicle}
          firm={firm}
        />
      )}
    </div>
  );
}
