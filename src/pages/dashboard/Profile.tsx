import { useState } from 'react';
import { User, Mail, Phone, Building, Lock, Save, Camera, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, Input, Button, Alert, Avatar } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { DashboardPageHeader } from '../../components/layout/DashboardLayout';

export function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    department: profile?.department || '',
  });
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: form.full_name,
      phone: form.phone,
      department: form.department,
    });
    setSaving(false);
    if (error) toast('error', 'Update failed', error);
    else toast('success', 'Profile updated!');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast('warning', 'Image too large', 'Max 2MB.');
      return;
    }
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { toast('error', 'Upload failed'); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error } = await updateProfile({ avatar_url: data.publicUrl });
    if (error) toast('error', 'Could not update avatar');
    else toast('success', 'Avatar updated!');
  };

  const handleChangePassword = async () => {
    setPwError(null);
    if (pwForm.new !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.new.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.new });
    setPwSaving(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwForm({ current: '', new: '', confirm: '' });
      toast('success', 'Password updated!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <DashboardPageHeader title="Profile" description="Manage your account information and security settings." />

      {/* Profile header card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative">
            <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="lg" />
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-primary-700 transition-colors">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">{profile?.full_name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="badge bg-primary-100 text-primary-700 capitalize">{profile?.role}</span>
              {profile?.department && <span className="badge bg-slate-100 text-slate-700">{profile.department}</span>}
              <span className="badge bg-success-100 text-success-700">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-600" />
          Personal Information
        </h3>
        <div className="space-y-4">
          <Input
            label="Full Name"
            icon={<User className="w-4 h-4" />}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            label="Email Address"
            icon={<Mail className="w-4 h-4" />}
            value={user?.email || ''}
            disabled
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              icon={<Phone className="w-4 h-4" />}
              placeholder="+1 (555) 000-0000"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Department"
              icon={<Building className="w-4 h-4" />}
              placeholder="e.g. Engineering"
              value={form.department || ''}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} loading={saving}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary-600" />
          Change Password
        </h3>
        {pwError && <Alert variant="error" className="mb-4">{pwError}</Alert>}
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={pwForm.new}
            onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
          />
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} loading={pwSaving} disabled={!pwForm.new || !pwForm.confirm}>
              <Lock className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
