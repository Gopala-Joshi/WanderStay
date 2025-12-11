import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function Navbar() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Search' },
    { to: '/dashboard', label: 'Dashboard', authRequired: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="https://cdn-ai.onspace.ai/onspace/files/B3r8RRdV5T4LdHisrGu8qc/generated-image_(4).png" 
              alt="WanderStay Logo" 
              className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-display text-2xl font-bold text-gradient">
              WanderStay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'font-medium transition-colors relative group',
                    isActive(link.to)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-foreground/70 hover:text-foreground'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-0.5 bg-primary-500 transition-all duration-300',
                      isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">


            {/* Auth Section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="btn-premium">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                if (link.authRequired && !user) return null;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'font-medium transition-colors px-4 py-2 rounded-lg',
                      isActive(link.to)
                        ? 'bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                        : 'text-foreground/70 hover:bg-muted'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
