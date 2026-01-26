import { Shield, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/30 mt-auto">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-foreground">Pehchaan</div>
                <div className="text-xs text-muted-foreground">India Safety Platform</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Helping reunite families across India through advanced technology and community support.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/cases" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Cases
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-muted-foreground hover:text-foreground transition-colors">
                  Upload Photo
                </Link>
              </li>
              <li>
                <Link to="/report/missing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Report Missing
                </Link>
              </li>
              <li>
                <Link to="/report/found" className="text-muted-foreground hover:text-foreground transition-colors">
                  Report Found Person
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Public Portal
                </Link>
              </li>
              <li>
                <Link to="/police/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Police Portal
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Emergency Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>100 (Police)</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>1091 (Women Helpline)</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@missingpersons.gov.in</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>NCRB, New Delhi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 Pehchaan. A Government of India Initiative.
            </p>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-foreground transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
