import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Target, Menu, X, LogOut, User, Bookmark, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth, useSavedUniversities, useTheme } from '@/contexts';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { savedUniversities } = useSavedUniversities();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/fit-matcher',
      icon: Target,
      label: 'Fit Matcher',
    },
    {
      path: '/search',
      icon: Search,
      label: 'Search Universities',
    },
    {
      path: '/saved',
      icon: Bookmark,
      label: 'Saved Universities',
      badge: savedUniversities.length > 0 ? savedUniversities.length : undefined,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold leading-tight text-white">University Matcher</p>
              <p className="text-[11px] text-slate-400 truncate">Find Your Perfect Fit</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 !text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:!text-white hover:translate-x-1'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700/50 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium !text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={toggleTheme}
            variant="ghost"
            className="w-full justify-start !text-slate-300 hover:!text-white hover:bg-slate-700/50 transition-all"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 mr-2" />
            ) : (
              <Sun className="w-4 h-4 mr-2" />
            )}
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start !text-slate-300 hover:!text-white hover:bg-slate-700/50 transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>

          {/* <div className="text-xs text-slate-500 pt-2">
            <p className="font-semibold text-slate-400">© 2025 University Matcher</p>
            <p className="mt-1">Powered by Orbit AI</p>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
