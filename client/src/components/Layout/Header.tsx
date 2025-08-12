import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserCircleIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Schedule', href: '/schedule', icon: CalendarIcon },
  { name: 'Assignments', href: '/assignments', icon: ClipboardDocumentListIcon },
  { name: 'Grades', href: '/grades', icon: AcademicCapIcon },
  { name: 'Notes', href: '/notes', icon: DocumentTextIcon },
  { name: 'Faculty', href: '/faculty', icon: UserGroupIcon },
];

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="w-full px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">EP</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">EduPlanner</h1>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-sm text-gray-700 hidden sm:block">
                  {user?.firstName} {user?.lastName}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                    <div className="text-gray-500 text-xs">{user?.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-4 md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block pl-3 pr-4 py-2 text-xl font-medium border-l-4 transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-6 w-6 mr-4" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {(profileMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProfileMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;