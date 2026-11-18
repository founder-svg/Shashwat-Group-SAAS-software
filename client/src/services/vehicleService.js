import { supabase, isConfigured, initialDemoData } from '../config/supabaseClient';

const LOCAL_VEHICLES_KEY = 'shashwat_vehicles_cache';

function getCachedVehicles() {
  const cached = localStorage.getItem(LOCAL_VEHICLES_KEY);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      return parsed.filter(v => !['v-1', 'v-2', 'v-3'].includes(v.id));
    } catch (e) {}
  }
  return [];
}

function saveCachedVehicles(vehicles) {
  localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(vehicles));
}

export const vehicleService = {
  async getVehicles() {
    if (!isConfigured) {
      return { data: getCachedVehicles(), error: null };
    }
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addVehicle(vehicleData) {
    if (!isConfigured) {
      const list = getCachedVehicles();
      const newV = {
        id: `v-${Date.now()}`,
        ...vehicleData,
        created_at: new Date().toISOString()
      };
      list.unshift(newV);
      saveCachedVehicles(list);
      return { data: newV, error: null };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleData])
      .select()
      .single();
    return { data, error };
  },

  async updateStatus(id, status, currentDestination = '') {
    if (!isConfigured) {
      const list = getCachedVehicles();
      const item = list.find(v => v.id === id);
      if (item) {
        item.status = status;
        if (currentDestination) item.current_destination = currentDestination;
        saveCachedVehicles(list);
      }
      return { data: item, error: null };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update({ status, current_destination: currentDestination, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async updateVehicle(id, vehicleData) {
    if (!isConfigured) {
      const list = getCachedVehicles();
      const idx = list.findIndex(v => v.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...vehicleData, updated_at: new Date().toISOString() };
        saveCachedVehicles(list);
        return { data: list[idx], error: null };
      }
      return { error: { message: 'Vehicle not found' } };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update({ ...vehicleData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteVehicle(id) {
    if (!isConfigured) {
      let list = getCachedVehicles();
      list = list.filter(v => v.id !== id);
      saveCachedVehicles(list);
      return { data: { success: true }, error: null };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    return { data, error };
  }
};
