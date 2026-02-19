import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qizndxkzojwpccemljus.supabase.co";
const supabaseKey = "sb_publishable_6JeItuKqWDDTzu9khULkww_1l-xe9wQ";

export const supabase = createClient(supabaseUrl, supabaseKey);