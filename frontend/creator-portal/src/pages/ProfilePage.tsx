import ProfileEditor from '../components/profile/ProfileEditor';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">
            Manage your profile information
          </p>
        </div>

        <ProfileEditor />
      </div>
    </div>
  );
}
