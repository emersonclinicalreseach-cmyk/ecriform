import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ntfaoycfycwddaxebilv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50ZmFveWNmeWN3ZGRheGViaWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTAyMzQsImV4cCI6MjA4OTg2NjIzNH0.wrLGEL0na7W2xU7H_Xa0M_TO6TzIVknxYKpW4_gLF34'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
