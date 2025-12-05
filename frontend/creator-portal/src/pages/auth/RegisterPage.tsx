import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">K</span>
            </div>
            <a href="https://kakraba.thekloudwiz.com/" className="text-3xl font-bold text-white hover:text-purple-300 transition-colors">
              Kakraba
            </a>
          </div>
          <p className="text-gray-400">Creator Portal</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
