import { supabase, isConfigured } from '../config/supabaseClient';

const LOCAL_VEHICLE_KEY = 'shashwat_vehicles_cache';

export function getCachedVehicles() {
  const cached = localStorage.getItem(LOCAL_VEHICLE_KEY);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      return (parsed || []).filter(v => !['v-1', 'v-2'].includes(v.id));
    } catch (e) {}
  }
  return [];
}

export function saveCachedVehicles(list) {
  try {
    localStorage.setItem(LOCAL_VEHICLE_KEY, JSON.stringify(list));
  } catch (e) {}
}

export const vehicleService = {
  async getVehicles() {
    const cached = getCachedVehicles();
    if (!isConfigured || !supabase) {
      return { data: cached, error: null };
    }
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: cached, error: null };
      }

      const map = new Map();
      cached.forEach(v => map.set(v.id || v.vehicle_number, v));
      (data || []).forEach(v => map.set(v.id || v.vehicle_number, v));

      return { data: Array.from(map.values()), error: null };
    } catch (e) {
      return { data: cached, error: null };
    }
  },

  async addVehicle(vehicleData) {
    const list = getCachedVehicles();
    const newV = {
      id: `v-${Date.now()}`,
      ...vehicleData,
      created_at: new Date().toISOString()
    };
    list.unshift(newV);
    saveCachedVehicles(list);

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .insert([vehicleData])
          .select()
          .single();

        if (!error && data) {
          newV.id = data.id;
          saveCachedVehicles(list);
        }
      } catch (e) {
        console.warn('Supabase vehicle sync notice (saved locally):', e);
      }
    }

    return { data: newV, error: null };
  },

  async updateStatus(id, status, currentDestination = '') {
    const list = getCachedVehicles();
    const item = list.find(v => v.id === id || v.vehicle_number === id);
    if (item) {
      item.status = status;
      if (currentDestination) item.current_destination = currentDestination;
      saveCachedVehicles(list);
    }

    if (isConfigured && supabase) {
      try {
        await supabase
          .from('vehicles')
          .update({ status, current_destination: currentDestination, updated_at: new Date() })
          .eq('id', id);
      } catch (e) {}
    }

    return { data: item || { id, status, currentDestination }, error: null };
  },

  async updateVehicle(id, vehicleData) {
    const list = getCachedVehicles();
    const idx = list.findIndex(v => v.id === id || v.vehicle_number === id);
    let updatedV = null;
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...vehicleData, updated_at: new Date().toISOString() };
      saveCachedVehicles(list);
      updatedV = list[idx];
    }

    if (isConfigured && supabase) {
      try {
        await supabase
          .from('vehicles')
          .update({ ...vehicleData, updated_at: new Date() })
          .eq('id', id);
      } catch (e) {}
    }

    return { data: updatedV || vehicleData, error: null };
  },

  async deleteVehicle(id) {
    let list = getCachedVehicles();
    list = list.filter(v => v.id !== id && v.vehicle_number !== id);
    saveCachedVehicles(list);

    if (isConfigured && supabase) {
      try {
        await supabase.from('vehicles').delete().eq('id', id);
      } catch (e) {}
    }

    return { data: { success: true }, error: null };
  },

  getCachedVehicles,
  saveCachedVehicles
};
