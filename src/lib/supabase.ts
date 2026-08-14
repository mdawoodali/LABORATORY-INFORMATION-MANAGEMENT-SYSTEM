import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mrskydxtqadibddtvkrk.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yc2t5ZHh0cWFkaWJkZHR2a3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTg1ODUsImV4cCI6MjEwMjI5NDU4NX0.tHoRJg1FOYFDUNA0rPivEhhD2dXAKqyql_e16TQkG70";

export const supabase = createClient(supabaseUrl, supabaseKey);
