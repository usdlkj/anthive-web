'use client';

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axiosInstance from "@/lib/axios";

export default function Login ({ expiresIn }: { expiresIn: number }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Initialize the router

  const handleLogin = async () => {
    toast.dismiss();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const res = await axiosInstance.post('/auth/login', { email, password });

      if (![200, 201].includes(res.status)) {
        toast.error('Something went wrong');
        return;
      }

      Cookies.set('sempoa', res.data.access_token, { expires: expiresIn });
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="h-screen pt-24 md:pt-32">
      <div className='mx-auto w-96 border border-gray-200 rounded bg-white py-6 px-6'>


        <div className="flex justify-center mb-6">
          <img src="/kcic_logo_500x305.png" alt="KCIC Logo" className="h-10" />
        </div>
        <div className="mx-auto w-56 text-kcicBlack font-semibold mb-4">
          Sign in to start your session
        </div>
        <div className="mb-4">
          <input 
            type='email' 
            id='email' 
            name='email' 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-kcicGray rounded w-full py-1 px-2 text-kcicBlack" 
            placeholder="Email" />
        </div>
        <div className="mb-4">
          <input 
            type='password' 
            id='password' 
            name='password' 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-kcicGray rounded w-full py-1 px-2 text-kcicBlack" 
            placeholder="Password" />
        </div>
        <div className="text-right">
          <button 
            onClick={handleLogin}
            className="border border-kcicGray rounded bg-kcicRed hover:bg-red-700 text-white font-semibold py-2 px-6">
              Sign in
          </button>
        </div>
      </div>
    </div>
  );
}