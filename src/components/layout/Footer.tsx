import { Link } from 'react-router-dom';
import { Sparkles, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-gradient">
                WanderStay
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-guided hotel pricing & bookings for India — sublime, effortless travel planning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-sm text-muted-foreground hover:text-primary-500 transition-colors"
                >
                  Search Hotels
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary-500 transition-colors"
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Help Center</li>
              <li className="text-sm text-muted-foreground">Privacy Policy</li>
              <li className="text-sm text-muted-foreground">Terms of Service</li>
              <li className="text-sm text-muted-foreground">Contact Us</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>support@wanderstay.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>+91 1800 123 4567</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} WanderStay. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Built with OnSpace AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
