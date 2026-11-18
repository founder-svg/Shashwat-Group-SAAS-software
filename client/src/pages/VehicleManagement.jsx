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
  Gauge
} from 'lucide-react';

export default function VehicleManagement({ vehicles, onAddVehicle, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [capacityKg, setCapacityKg] = useState('2000');
  const [notes, setNotes] = useState('');

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
    if (!vehicleNumber) {
      alert('Vehicle registration number is required');
      return;
    }

    onAddVehicle({
      vehicle_number: vehicleNumber.toUpperCase(),
      vehicle_type: vehicleType,
      driver_name: driverName || 'Unassigned',
      driver_phone: driverPhone || '',
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

  return (
    <div className="space-y-5">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-100 text-brand-800">
              MODULE 3
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Vehicle & Fleet Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log delivery fleet, driver assignments, payload capacity, and shipment dispatch locations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Fleet KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Fleet</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{vehicles.length} Vehicles</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Available / Standby</span>
          <p className="text-lg font-black text-emerald-700 mt-0.5">{availableCount} Ready</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase">On Active Delivery</span>
          <p className="text-lg font-black text-blue-700 mt-0.5">{onDeliveryCount} Dispatched</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Maintenance</span>
          <p className="text-lg font-black text-amber-700 mt-0.5">{maintenanceCount} In Service</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
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
                  ? 'bg-slate-900 text-white'
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
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-3.5"
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
                      className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                        isAvail ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => onUpdateStatus(v.id, 'on_delivery', 'Customer Dispatch')}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                        isOnDeliv ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Dispatch
                    </button>
                    <button
                      onClick={() => onUpdateStatus(v.id, 'maintenance', 'Service Center')}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                        !isAvail && !isOnDeliv ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" /> Register New Fleet Vehicle (Module 3)
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Plate Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-SG-8842"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Truck">Truck (Heavy / 14ft+)</option>
                    <option value="Tata Ace Mini Van">Tata Ace / Mini Van</option>
                    <option value="Mahindra Bolero Pickup">Bolero Pickup</option>
                    <option value="Container Trailer">Container Trailer</option>
                    <option value="Tempo">Tempo / Delivery Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payload Capacity (kg)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="2500"
                    value={capacityKg}
                    onChange={(e) => setCapacityKg(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Driver Name</label>
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91-9876543210"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Notes / Insurance Expiry</label>
                <input
                  type="text"
                  placeholder="Insurance valid till Dec 2027, FASTag active"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
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
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
