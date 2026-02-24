import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

const SERVER_IP = import.meta.env.SERVER_IP || 'localhost';
const API_URL = `http://${SERVER_IP}:5100/api/`;

interface UserProfile {
  username: string;
  year_of_study: string;
  number_of_courses: number;
  work_hours_per_week: number;
  commute_time_per_day: number;
  athlete_flag: boolean;
  total_burnout: number | null;
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<UserProfile>({
    username: '',
    year_of_study: 'Freshman',
    number_of_courses: 4,
    work_hours_per_week: 0,
    commute_time_per_day: 0,
    athlete_flag: false,
    total_burnout: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          // Fetch from the backend GET endpoint
          const res = await fetch(`${API_URL}profile/${session.user.id}`);
          const responseData = await res.json();

          if (responseData.data && responseData.data.length > 0) {
            const userData = responseData.data[0];
            const loadedProfile = {
              username: userData.username || '',
              year_of_study: userData.year_of_study || 'Freshman',
              number_of_courses: userData.number_of_courses || 0,
              work_hours_per_week: userData.work_hours_per_week || 0,
              commute_time_per_day: userData.commute_time_per_day || 0,
              athlete_flag: userData.athlete_flag || false,
              total_burnout: userData.total_burnout || 0
            };
            setProfile(loadedProfile);
            setFormData(loadedProfile);
          } else {
            // No profile found (e.g. Google Auth user who hasn't set it up)
            const defaultProfile = {
              username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
              year_of_study: 'Freshman',
              number_of_courses: 4,
              work_hours_per_week: 0,
              commute_time_per_day: 0,
              athlete_flag: false,
              total_burnout: 0
            };
            setFormData(defaultProfile);
            setIsEditing(true); // Force them to edit/save if no profile exists
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      try {
        const response = await fetch(`${API_URL}profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          setProfile(formData);
          setIsEditing(false);
        } else {
          console.error("Failed to save profile");
          alert("Failed to save profile. Please try again.");
        }
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }
    setSaving(false);
  };

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
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-8">
        
        {/* Profile Info Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">Account Details</h3>
          
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year of Study</label>
                <select
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Courses</label>
                <input
                  type="number"
                  min="0"
                  value={formData.number_of_courses}
                  onChange={(e) => setFormData({ ...formData, number_of_courses: parseInt(e.target.value) || 0 })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Hours / Week</label>
                <input
                  type="number"
                  min="0"
                  value={formData.work_hours_per_week}
                  onChange={(e) => setFormData({ ...formData, work_hours_per_week: parseInt(e.target.value) || 0 })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Commute Time / Day (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.commute_time_per_day}
                  onChange={(e) => setFormData({ ...formData, commute_time_per_day: parseInt(e.target.value) || 0 })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2 flex items-center h-full pt-6">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.athlete_flag}
                    onChange={(e) => setFormData({ ...formData, athlete_flag: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Student Athlete
                </label>
              </div>

              <div className="col-span-1 md:col-span-2 flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
                {profile && (
                  <button
                    onClick={() => {
                      setFormData(profile);
                      setIsEditing(false);
                    }}
                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-lg font-medium">{profile?.username}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Year of Study</label>
                  <p className="text-lg font-medium">{profile?.year_of_study}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Courses</label>
                  <p className="text-lg font-medium">{profile?.number_of_courses}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Work Hours / Week</label>
                  <p className="text-lg font-medium">{profile?.work_hours_per_week} hrs</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Commute Time / Day</label>
                  <p className="text-lg font-medium">{profile?.commute_time_per_day} mins</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Student Athlete</label>
                  <p className="text-lg font-medium">{profile?.athlete_flag ? 'Yes' : 'No'}</p>
                </div>
              </div>
          )}
        </div>

        {/* Stats Section */}
        {!isEditing && (
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
        )}

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