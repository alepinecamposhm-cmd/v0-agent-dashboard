import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Video,
  User,
  Check,
  X,
  MoreHorizontal,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { mockAppointments, mockLeads } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addDays,
  isToday,
  setHours,
  setMinutes,
  getHours,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment, AppointmentStatus, Lead } from '@/types/agents';
import confetti from 'canvas-confetti';

type ViewMode = 'week' | 'month';

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  confirmed: { label: 'Confirmada', color: 'text-success', bg: 'bg-success/10 border-success/20' },
  completed: { label: 'Completada', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  cancelled: { label: 'Cancelada', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
  no_show: { label: 'No asistió', color: 'text-muted-foreground', bg: 'bg-muted border-muted' },
};

const typeConfig: Record<string, { label: string; icon: typeof CalendarIcon }> = {
  showing: { label: 'Visita', icon: MapPin },
  consultation: { label: 'Consultoría', icon: Video },
  call: { label: 'Llamada', icon: Phone },
};

// Hours for the week view grid
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

interface AppointmentCardProps {
  appointment: Appointment;
  compact?: boolean;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (appointment: Appointment) => void;
}

function AppointmentCard({ 
  appointment, 
  compact = false,
  onConfirm,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  const status = statusConfig[appointment.status];
  const type = typeConfig[appointment.type] || { label: appointment.type, icon: CalendarIcon };
  const TypeIcon = type.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'group relative rounded-lg border p-2 cursor-pointer transition-all',
        status.bg,
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <TypeIcon className={cn('shrink-0', compact ? 'h-3 w-3' : 'h-4 w-4', status.color)} />
            <span className="font-medium truncate">
              {appointment.lead?.firstName} {appointment.lead?.lastName}
            </span>
          </div>
          {!compact && (
            <>
              <p className="text-muted-foreground truncate mt-0.5">
                {appointment.location || appointment.virtualLink || 'Sin ubicación'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn('text-[10px] px-1.5', status.color)}>
                  {status.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {format(appointment.scheduledAt, 'HH:mm')} - {appointment.duration}min
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Hover actions */}
        <div className={cn(
          'flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
          compact && 'absolute right-1 top-1'
        )}>
          {appointment.status === 'pending' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-success/20"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm(appointment.id);
              }}
            >
              <Check className="h-3 w-3 text-success" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onReschedule(appointment)}>
                <RefreshCw className="h-3 w-3 mr-2" />
                Reprogramar
              </DropdownMenuItem>
              {appointment.status !== 'confirmed' && (
                <DropdownMenuItem onClick={() => onConfirm(appointment.id)}>
                  <Check className="h-3 w-3 mr-2" />
                  Confirmar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onCancel(appointment.id)}
              >
                <X className="h-3 w-3 mr-2" />
                Cancelar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSubmit: (data: Partial<Appointment>) => void;
}

function NewAppointmentDialog({ 
  open, 
  onOpenChange, 
  selectedDate,
  onSubmit 
}: NewAppointmentDialogProps) {
  const [formData, setFormData] = useState({
    leadId: '',
    type: 'showing',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    duration: '60',
    location: '',
    notes: '',
  });

  const handleSubmit = () => {
    const [hours, minutes] = formData.time.split(':').map(Number);
    const scheduledAt = setMinutes(setHours(new Date(formData.date), hours), minutes);
    
    onSubmit({
      leadId: formData.leadId,
      type: formData.type as 'showing' | 'consultation' | 'call',
      scheduledAt,
      duration: parseInt(formData.duration),
      location: formData.location,
      notes: formData.notes,
      status: 'pending',
    });
    
    onOpenChange(false);
    setFormData({
      leadId: '',
      type: 'showing',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      duration: '60',
      location: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
          <DialogDescription>
            Agenda una visita, consultoría o llamada con un lead.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Lead</Label>
            <Select value={formData.leadId} onValueChange={(v) => setFormData(prev => ({ ...prev, leadId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar lead" />
              </SelectTrigger>
              <SelectContent>
                {mockLeads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de cita</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="showing">Visita presencial</SelectItem>
                <SelectItem value="consultation">Consultoría virtual</SelectItem>
                <SelectItem value="call">Llamada telefónica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input 
                type="time" 
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duración</Label>
            <Select value={formData.duration} onValueChange={(v) => setFormData(prev => ({ ...prev, duration: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1.5 horas</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ubicación / Link</Label>
            <Input 
              placeholder="Dirección o enlace de videollamada"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea 
              placeholder="Instrucciones o notas adicionales..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.leadId}>
            Agendar cita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AgentCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);

  // Navigation
  const goToToday = () => setCurrentDate(new Date());
  const goNext = () => {
    setCurrentDate(prev => 
      viewMode === 'week' ? addWeeks(prev, 1) : addMonths(prev, 1)
    );
  };
  const goPrev = () => {
    setCurrentDate(prev => 
      viewMode === 'week' ? subWeeks(prev, 1) : subMonths(prev, 1)
    );
  };

  // Date calculations
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const monthDays = eachDayOfInterval({ 
    start: startOfWeek(monthStart, { weekStartsOn: 1 }), 
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }) 
  });

  // Filter appointments for current view
  const visibleAppointments = useMemo(() => {
    const start = viewMode === 'week' ? weekStart : startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = viewMode === 'week' ? weekEnd : endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return appointments.filter(apt => 
      apt.scheduledAt >= start && apt.scheduledAt <= end
    );
  }, [appointments, viewMode, weekStart, weekEnd, monthStart, monthEnd]);

  const getAppointmentsForDay = (date: Date) => 
    visibleAppointments.filter(apt => isSameDay(apt.scheduledAt, date));

  const getAppointmentsForHour = (date: Date, hour: number) =>
    visibleAppointments.filter(apt => 
      isSameDay(apt.scheduledAt, date) && getHours(apt.scheduledAt) === hour
    );

  // Actions
  const handleConfirm = (id: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: 'confirmed' as AppointmentStatus } : apt
    ));
    
    // Success animation
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a'],
    });
    
    toast({
      title: 'Cita confirmada',
      description: 'Se ha enviado una notificación al cliente.',
    });
  };

  const handleCancel = (id: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: 'cancelled' as AppointmentStatus } : apt
    ));
    
    toast({
      title: 'Cita cancelada',
      description: 'Se ha notificado al cliente de la cancelación.',
      variant: 'destructive',
    });
  };

  const handleReschedule = (appointment: Appointment) => {
    setRescheduleAppointment(appointment);
    setSelectedDate(appointment.scheduledAt);
    setNewDialogOpen(true);
  };

  const handleNewAppointment = (data: Partial<Appointment>) => {
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      agentId: 'agent-1',
      leadId: data.leadId!,
      lead: mockLeads.find(l => l.id === data.leadId),
      type: data.type || 'showing',
      status: 'pending',
      scheduledAt: data.scheduledAt!,
      duration: data.duration || 60,
      location: data.location,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (rescheduleAppointment) {
      // Update existing appointment
      setAppointments(prev => prev.map(apt => 
        apt.id === rescheduleAppointment.id 
          ? { ...apt, scheduledAt: data.scheduledAt!, location: data.location, notes: data.notes }
          : apt
      ));
      setRescheduleAppointment(null);
      
      toast({
        title: 'Cita reprogramada',
        description: `Nueva fecha: ${format(data.scheduledAt!, "d 'de' MMMM, HH:mm", { locale: es })}`,
      });
    } else {
      // Add new appointment
      setAppointments(prev => [...prev, newApt]);
      
      toast({
        title: 'Cita agendada',
        description: `${format(data.scheduledAt!, "d 'de' MMMM, HH:mm", { locale: es })}`,
      });
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setNewDialogOpen(true);
  };

  // Stats
  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    thisWeek: appointments.filter(a => 
      a.scheduledAt >= weekStart && a.scheduledAt <= weekEnd
    ).length,
  }), [appointments, weekStart, weekEnd]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y visitas con clientes
          </p>
        </div>
        <Button onClick={() => {
          setSelectedDate(undefined);
          setRescheduleAppointment(null);
          setNewDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
              </div>
              <Check className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Citas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar Navigation */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={goPrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Hoy
                </Button>
                <h2 className="text-lg font-semibold">
                  {viewMode === 'week' 
                    ? `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`
                    : format(currentDate, "MMMM yyyy", { locale: es })
                  }
                </h2>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            <AnimatePresence mode="wait">
              {viewMode === 'week' ? (
                // Week View
                <motion.div
                  key="week"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="overflow-x-auto"
                >
                  <div className="min-w-[800px]">
                    {/* Week header */}
                    <div className="grid grid-cols-8 border-b">
                      <div className="p-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4 mx-auto" />
                      </div>
                      {weekDays.map((day) => (
                        <div 
                          key={day.toISOString()} 
                          className={cn(
                            'p-2 text-center border-l',
                            isToday(day) && 'bg-primary/5'
                          )}
                        >
                          <p className="text-xs text-muted-foreground uppercase">
                            {format(day, 'EEE', { locale: es })}
                          </p>
                          <p className={cn(
                            'text-lg font-semibold',
                            isToday(day) && 'text-primary'
                          )}>
                            {format(day, 'd')}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Time grid */}
                    <ScrollArea className="h-[500px]">
                      <div className="divide-y">
                        {HOURS.map((hour) => (
                          <div key={hour} className="grid grid-cols-8 min-h-[60px]">
                            <div className="p-2 text-xs text-muted-foreground text-right pr-3 border-r">
                              {`${hour}:00`}
                            </div>
                            {weekDays.map((day) => {
                              const dayAppointments = getAppointmentsForHour(day, hour);
                              return (
                                <div 
                                  key={day.toISOString()} 
                                  className={cn(
                                    'p-1 border-l min-h-[60px] cursor-pointer hover:bg-muted/30 transition-colors',
                                    isToday(day) && 'bg-primary/5'
                                  )}
                                  onClick={() => {
                                    const clickedDate = setHours(day, hour);
                                    handleDayClick(clickedDate);
                                  }}
                                >
                                  <div className="space-y-1">
                                    {dayAppointments.map((apt) => (
                                      <AppointmentCard
                                        key={apt.id}
                                        appointment={apt}
                                        compact
                                        onConfirm={handleConfirm}
                                        onCancel={handleCancel}
                                        onReschedule={handleReschedule}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </motion.div>
              ) : (
                // Month View
                <motion.div
                  key="month"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Month header */}
                  <div className="grid grid-cols-7 border-b mb-1">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                      <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Month grid */}
                  <div className="grid grid-cols-7 gap-px bg-border">
                    {monthDays.map((day) => {
                      const dayAppointments = getAppointmentsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      
                      return (
                        <div 
                          key={day.toISOString()}
                          className={cn(
                            'min-h-[100px] p-2 bg-card cursor-pointer hover:bg-muted/30 transition-colors',
                            !isCurrentMonth && 'opacity-40',
                            isToday(day) && 'ring-2 ring-primary ring-inset'
                          )}
                          onClick={() => handleDayClick(day)}
                        >
                          <p className={cn(
                            'text-sm font-medium mb-1',
                            isToday(day) && 'text-primary'
                          )}>
                            {format(day, 'd')}
                          </p>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <AppointmentCard
                                key={apt.id}
                                appointment={apt}
                                compact
                                onConfirm={handleConfirm}
                                onCancel={handleCancel}
                                onReschedule={handleReschedule}
                              />
                            ))}
                            {dayAppointments.length > 2 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{dayAppointments.length - 2} más
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Appointments Sidebar */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments
                .filter(apt => apt.scheduledAt >= new Date() && apt.status !== 'cancelled')
                .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
                .slice(0, 5)
                .map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onReschedule={handleReschedule}
                  />
                ))}
              {appointments.filter(apt => apt.scheduledAt >= new Date()).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tienes citas próximas. Agenda una nueva cita para comenzar.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={newDialogOpen}
        onOpenChange={(open) => {
          setNewDialogOpen(open);
          if (!open) {
            setRescheduleAppointment(null);
            setSelectedDate(undefined);
          }
        }}
        selectedDate={selectedDate}
        onSubmit={handleNewAppointment}
      />
    </motion.div>
  );
}
