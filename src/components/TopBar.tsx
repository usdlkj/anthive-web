'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from '@headlessui/react'; // For the dropdown functionality
import { ChevronDown, User, LogOut, Settings, Lock } from 'lucide-react'; // Icons

const TopBar = () => {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleSignOut = () => {
    // Clear the token and redirect
    document.cookie = 'authToken=; Max-Age=0; path=/;'; // Clear token
    router.push('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
    },
    {
      name: 'Administration',
      subMenu: [
        { name: 'Companies', href: '/companies' },
        { name: 'Projects', href: '/projects' },
      ]
    },
    {
      name: 'Documents',
      subMenu: [
        { name: 'Document Register', href: '/documents' },
        { name: 'Upload Document', href: '/payment-types' },
      ],
    },
  ];

  return (
    <div className="bg-white text-kcicGray p-4 shadow-lg border-b border-kcicRed">
      <div className="container flex items-center justify-between">
        {/* Logo or Brand */}
        <a href="/dashboard">
          <img src="/kcic_logo_500x305.png" alt="KCIC Backoffice" className="h-10" />
        </a>

        {/* Navigation */}
        <div className="flex space-x-6">
          {navigation.map((item) => (
            <div key={item.name} className="relative">
              {item.subMenu ? (
                <button
                  onClick={() => setActiveMenu(activeMenu === item.name ? null : item.name)}
                  className="flex items-center gap-1 hover:text-kcicRed focus:outline-none"
                >
                  {item.name} <ChevronDown className="w-4 h-4" />
                </button>
              ) : (
                <a href={item.href} className="hover:text-kcicRed">
                  {item.name}
                </a>
              )}
              {/* Submenu */}
              {item.subMenu && activeMenu === item.name && (
                <div className="absolute left-0 mt-2 w-48 bg-white text-kcicBlack rounded shadow-lg z-10">
                  {item.subMenu.map((subItem) => (
                    <a
                      key={subItem.name}
                      href={subItem.href}
                      className="block px-4 py-2 hover:bg-kcicRed hover:text-white"
                    >
                      {subItem.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Avatar */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 focus:outline-none">
            <div className="w-8 h-8 bg-kcicGray/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-kcicGray" />
            </div>
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white text-kcicBlack rounded shadow-lg z-10">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => router.push('/me')}
                  className={`${
                    active ? 'bg-kcicRed text-white' : ''
                  } flex items-center w-full px-4 py-2 text-sm`}
                >
                  <Settings className="w-4 h-4 mr-2" /> Edit Profile
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => router.push('/me/change-password')}
                  className={`${
                    active ? 'bg-kcicRed text-white' : ''
                  } flex items-center w-full px-4 py-2 text-sm`}
                >
                  <Lock className="w-4 h-4 mr-2" /> Change Password
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-kcicRed text-white' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
};

export default TopBar;