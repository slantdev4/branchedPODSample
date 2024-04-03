'use client'
import { useRouter } from 'next/navigation';
import NavBar from "../components/navbar";
const Success = () => {
  const router = useRouter();
  return (
    <div className="h-screen bg-gradient-to-bl from-blue-500 to-gray-100">
      <div className="flex min-h-90 text-white items-center justify-center align-middle mx-4">
        <div className="bg-blue-500 rounded-2xl shadow-lg animate-bounce">
          <h1 className="p-4">We have received your order. Thank you!</h1>
        </div>
        <button className="text-white bg-green-500 rounded-2xl shadow-lg mx-4" onClick={() => router.push('/')}>
          <h1 className="p-4">Start Another Order</h1>
        </button>
      </div>
    </div>

  );
};

export default Success;
