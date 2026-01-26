import { Link, useLocation } from "react-router-dom";
import { Bell, User, Shield, UserCog, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const location = useLocation();
  const isPolicePortal = location.pathname.startsWith("/police");
  const isAdminPortal = location.pathname.startsWith("/admin");

  const getPortalName = () => {
    if (isAdminPortal) return "Admin Portal";
    if (isPolicePortal) return "Police Portal";
    return "Public Portal";
  };

  const getPortalIcon = () => {
    if (isAdminPortal) return <UserCog className="h-4 w-4" />;
    if (isPolicePortal) return <Shield className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const publicLinks = (
    <>
      <Link to="/">
        <Button variant="ghost">Home</Button>
      </Link>
      <Link to="/cases">
        <Button variant="ghost">Browse Cases</Button>
      </Link>
      <Link to="/upload">
        <Button variant="ghost">Upload Photo</Button>
      </Link>
      <Link to="/report/missing">
        <Button variant="ghost">Report Missing</Button>
      </Link>
      <Link to="/report/found">
        <Button variant="ghost">Report Found</Button>
      </Link>
    </>
  );

  const policeLinks = (
    <>
      <Link to="/police/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
      <Link to="/cases">
        <Button variant="ghost">All Cases</Button>
      </Link>
    </>
  );

  const adminLinks = (
    <>
      <Link to="/admin/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
      <Link to="/admin/police">
        <Button variant="ghost">Manage Police</Button>
      </Link>
      <Link to="/cases">
        <Button variant="ghost">All Cases</Button>
      </Link>
    </>
  );

  const getLinks = () => {
    if (isAdminPortal) return adminLinks;
    if (isPolicePortal) return policeLinks;
    return publicLinks;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mr-6">
  <div className="flex h-24 w-24 items-center justify-center rounded-full">
    <img
      src="/image/logo.png" // path relative to public folder
      alt="Pehchaan Logo"
      className="h-26 w-26 object-contain"
    />
  </div>
</Link>


        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center space-x-2">
          {getLinks()}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* Portal Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {getPortalIcon()}
                <span className="hidden sm:inline">{getPortalName()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuLabel>Switch Portal</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Public Portal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/police/login" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  Police Portal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/login" className="cursor-pointer">
                  <UserCog className="mr-2 h-4 w-4" />
                  Admin Portal
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                2
              </Badge>
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-3 mt-8">
                {getLinks()}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
