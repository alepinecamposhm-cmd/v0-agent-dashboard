import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Building2,
  CreditCard,
  UsersRound,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { mockAgent, mockNotifications } from '@/lib/agents/fixtures';

const navigation = [
  { name: 'Overview', href: '/agents/overview', icon: LayoutDashboard },
  { name: 'Leads', href: '/agents/leads', icon: Users, badge: 3 },
  { name: 'Inbox', href: '/agents/inbox', icon: MessageSquare, badge: 5 },
  { name: 'Calendario', href: '/agents/calendar', icon: Calendar },
  { name: 'Listings', href: '/agents/listings', icon: Building2 },
  { name: 'Créditos', href: '/agents/credits', icon: CreditCard },
  { name: 'Equipo', href: '/agents/team', icon: UsersRound },
  { name: 'Reportes', href: '/agents/reports', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'Configuración', href: '/agents/settings', icon: Settings },
];

interface NavItemProps {
  item: typeof navigation[0];
  isCollapsed: boolean;
}

function NavItem({ item, isCollapsed }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <NavLink
          to={item.href}
          className={cn(
            'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            isCollapsed && 'justify-center px-2'
          )}
        >
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute inset-0 rounded-lg bg-primary/10"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <item.icon className={cn('relative z-10 h-5 w-5 shrink-0', isActive && 'text-primary')} />
          {!isCollapsed && (
            <span className="relative z-10 truncate">{item.name}</span>
          )}
          {!isCollapsed && item.badge && (
            <Badge
              variant="secondary"
              className={cn(
                'relative z-10 ml-auto h-5 min-w-5 px-1.5 text-xs',
                isActive ? 'bg-primary/20 text-primary' : ''
              )}
            >
              {item.badge}
            </Badge>
          )}
          {isCollapsed && item.badge && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {item.badge}
            </span>
          )}
        </NavLink>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.name}
          {item.badge && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function SidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b px-4', isCollapsed && 'justify-center px-2')}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold">Portal</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t px-3 py-4">
        <nav className="flex flex-col gap-1">
          {bottomNavigation.map((item) => (
            <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </div>
    </div>
  );
}

export function AgentLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadNotifications = mockNotifications.filter((n) => !n.readAt).length;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden border-r bg-card lg:block"
      >
        <SidebarContent isCollapsed={isCollapsed} />
      </motion.aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent isCollapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Collapse Button (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>

            {/* Search */}
            <Button
              variant="outline"
              className="hidden h-9 w-64 justify-start gap-2 text-muted-foreground md:flex"
            >
              <Search className="h-4 w-4" />
              <span>Buscar...</span>
              <kbd className="ml-auto flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                <Command className="h-3 w-3" />K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                    >
                      {unreadNotifications}
                    </motion.span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-72">
                  {mockNotifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium">{notification.title}</span>
                        {!notification.readAt && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{notification.body}</span>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center font-medium text-primary">
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {mockAgent.firstName[0]}{mockAgent.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden font-medium md:inline-block">
                    {mockAgent.firstName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{mockAgent.firstName} {mockAgent.lastName}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {mockAgent.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Mi perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
