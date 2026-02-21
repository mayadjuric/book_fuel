import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

interface UserProfile {
  username: string;
  study_year: string;
  total_burnout: number | null;
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // In a real app, you would fetch this from your Python backend
        // Example: const res = await fetch(`http://localhost:5100/api/users/${session.user.id}`);
        // const data = await res.json();
        
        // For now, we mock the response based on your User.py model
        setProfile({
          username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
          study_year: 'Sophomore', // Mocked
          total_burnout: 42 // Mocked
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex-1 space-y-4 p-8 pt-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-8">
        
        {/* Profile Info Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">Account Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-lg font-medium">{profile?.username}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Study Year</label>
              <p className="text-lg font-medium">{profile?.study_year}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">Your Stats</h3>
          
          <div className="rounded-lg bg-secondary/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Burnout Score</p>
              <p className="text-3xl font-bold text-primary">{profile?.total_burnout || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
              🔥
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t">
          <button 
            onClick={handleSignOut}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Sign Out
          </button>
        </div>

      </div>
    </main>
  );
}