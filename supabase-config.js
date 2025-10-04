// Supabase Configuration for Tour Management System
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://zxrbbywxqdsmscsncmvb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cmJieXd4cWRzbXNjc25jbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDMyMDAsImV4cCI6MjA3NTA3OTIwMH0.c2T3A2lbTGAQbyvBSzn5v9cl4FoEm2g96Y_t5VqG0Fs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client initialized');

// User ID (you can make this dynamic for multiple users)
const USER_ID = 'user_' + (localStorage.getItem('tour_user_id') || generateUserId());

function generateUserId() {
    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('tour_user_id', id);
    return id;
}

// ==================== SAVE TO SUPABASE ====================

async function saveToSupabase(tourData) {
    try {
        console.log('☁️ Saving to Supabase...', tourData);
        
        // Prepare data for Supabase
        const dataToSave = {
            user_id: USER_ID,
            data: tourData,
            updated_at: new Date().toISOString()
        };
        
        // Check if record exists
        const { data: existing, error: fetchError } = await supabase
            .from('tour_management_data')
            .select('id')
            .eq('user_id', USER_ID)
            .single();
        
        if (existing) {
            // Update existing record
            const { data, error } = await supabase
                .from('tour_management_data')
                .update(dataToSave)
                .eq('user_id', USER_ID)
                .select();
            
            if (error) {
                console.error('❌ Supabase update error:', error);
                return { success: false, error };
            }
            
            console.log('✅ Data updated in Supabase');
            return { success: true, data };
        } else {
            // Insert new record
            const { data, error } = await supabase
                .from('tour_management_data')
                .insert([dataToSave])
                .select();
            
            if (error) {
                console.error('❌ Supabase insert error:', error);
                return { success: false, error };
            }
            
            console.log('✅ Data inserted into Supabase');
            return { success: true, data };
        }
        
    } catch (error) {
        console.error('❌ Error saving to Supabase:', error);
        return { success: false, error };
    }
}

// ==================== LOAD FROM SUPABASE ====================

async function loadFromSupabase() {
    try {
        console.log('☁️ Loading from Supabase...');
        
        const { data, error } = await supabase
            .from('tour_management_data')
            .select('*')
            .eq('user_id', USER_ID)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // No data found - this is OK for first time users
                console.log('ℹ️ No data found in Supabase (first time user)');
                return null;
            }
            console.error('❌ Supabase load error:', error);
            return null;
        }
        
        if (data && data.data) {
            console.log('✅ Data loaded from Supabase');
            return data.data;
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Error loading from Supabase:', error);
        return null;
    }
}

// ==================== CHECK CONNECTION ====================

async function checkConnection() {
    try {
        const { data, error } = await supabase
            .from('tour_management_data')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('⚠️ Supabase connection check failed:', error);
            return { connected: false };
        }
        
        console.log('✅ Supabase connection OK');
        return { connected: true };
        
    } catch (error) {
        console.log('⚠️ Supabase connection error:', error);
        return { connected: false };
    }
}

// ==================== DELETE DATA ====================

async function deleteFromSupabase() {
    try {
        const { error } = await supabase
            .from('tour_management_data')
            .delete()
            .eq('user_id', USER_ID);
        
        if (error) {
            console.error('❌ Error deleting from Supabase:', error);
            return { success: false, error };
        }
        
        console.log('✅ Data deleted from Supabase');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error deleting from Supabase:', error);
        return { success: false, error };
    }
}

// Export functions to global scope
window.supabase = supabase;
window.saveToSupabase = saveToSupabase;
window.loadFromSupabase = loadFromSupabase;
window.checkConnection = checkConnection;
window.deleteFromSupabase = deleteFromSupabase;
window.TOUR_USER_ID = USER_ID;

console.log('✅ Supabase functions ready');
console.log('👤 User ID:', USER_ID);

