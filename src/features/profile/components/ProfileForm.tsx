import { useState, useEffect } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Clock,
  FileText,
  Edit2,
  Save,
  X,
  Camera,
} from 'lucide-react';
import type { UserProfile, UpdateProfileInput } from '@/services/profile/types';

interface ProfileFormProps {
  profile: UserProfile;
  onSave?: (data: UpdateProfileInput) => void;
  onUploadAvatar?: (file: File) => void;
}

export function ProfileForm({ profile, onSave, onUploadAvatar }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileInput>({});
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatar);

  useEffect(() => {
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      timezone: profile.timezone,
      language: profile.language,
      bio: profile.bio,
    });
    setAvatarPreview(profile.avatar);
  }, [profile]);

  const handleSave = () => {
    onSave?.(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      timezone: profile.timezone,
      language: profile.language,
      bio: profile.bio,
    });
    setAvatarPreview(profile.avatar);
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onUploadAvatar?.(file);
    }
  };

  const timezones = [
    'Asia/Manila',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Asia/Bangkok',
    'Asia/Jakarta',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Australia/Sydney',
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fil', name: 'Filipino' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'es', name: 'Spanish' },
  ];

  const getInitials = () => {
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  return (
    <XpressCard
      title="Personal Information"
      subtitle="Manage your profile details"
      icon={<User className="w-5 h-5" />}
      headerAction={
        !isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        )
      }
    >
      <div className="flex gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          <div className="mt-3 text-center">
            <Badge variant="active">{profile.role.replace('_', ' ').toUpperCase()}</Badge>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            icon={<User className="w-4 h-4" />}
            value={formData.firstName || ''}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Last Name"
            icon={<User className="w-4 h-4" />}
            value={formData.lastName || ''}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Email"
            icon={<Mail className="w-4 h-4" />}
            value={profile.email}
            disabled
          />
          <Input
            label="Phone"
            icon={<Phone className="w-4 h-4" />}
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            placeholder="+63 XXX XXX XXXX"
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <Building2 className="w-4 h-4 inline mr-1" />
              Department
            </label>
            <input
              type="text"
              value={profile.department || 'Not assigned'}
              disabled
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <MapPin className="w-4 h-4 inline mr-1" />
              Region
            </label>
            <input
              type="text"
              value={profile.regionId || 'Not assigned'}
              disabled
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <Globe className="w-4 h-4 inline mr-1" />
              Language
            </label>
            {isEditing ? (
              <select
                className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white focus:outline-none focus:border-xpress-accent-blue"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={languages.find((l) => l.code === profile.language)?.name || profile.language}
                disabled
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-sm text-gray-400 cursor-not-allowed"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" />
              Timezone
            </label>
            {isEditing ? (
              <select
                className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white focus:outline-none focus:border-xpress-accent-blue"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={profile.timezone.replace('_', ' ')}
                disabled
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-sm text-gray-400 cursor-not-allowed"
              />
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <FileText className="w-4 h-4 inline mr-1" />
              Bio
            </label>
            {isEditing ? (
              <textarea
                className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-xpress-accent-blue"
                rows={3}
                placeholder="Tell us about yourself..."
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={500}
              />
            ) : (
              <p className="text-gray-400 text-sm py-2">{profile.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>
      </div>
    </XpressCard>
  );
}

export default ProfileForm;
