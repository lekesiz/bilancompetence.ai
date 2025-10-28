import { createClient } from '@supabase/supabase-js';

// Utiliser les vraies clés Supabase
const SUPABASE_URL = 'https://njeqztsjijoareuqyuzb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZXF6dHNqaWpvYXJvdXF5dXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTExOTksImV4cCI6MjA3NjYyNzE5OX0.3pTJYr2JkSphQYydVgJw7JV-jmqcPUVk-3UeLXrPw14';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZXF6dHNqaWpvYXJvdXF5dXpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA1MTE5OSwiZXhwIjoyMDc2NjI3MTk5fQ.wAjLu_k4UAeIMEyUPdz2z6BEFIZOofiMFtWP3aUB8Ew';

console.log('🔍 Test de connexion à Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Anon Key (premiers 50 chars):', SUPABASE_ANON_KEY.substring(0, 50) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log("\n📊 Tentative de récupération de l'utilisateur demo@example.com...");

try {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'demo@example.com')
    .single();

  if (error) {
    console.error('❌ Erreur Supabase:', error);
    process.exit(1);
  }

  console.log('✅ Utilisateur trouvé:', {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    email_verified: data.email_verified,
  });

  console.log('\n🎉 CONNEXION SUPABASE RÉUSSIE !');
  process.exit(0);
} catch (err) {
  console.error('❌ Exception:', err);
  process.exit(1);
}
