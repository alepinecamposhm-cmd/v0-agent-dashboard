import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock3, Globe2, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockAgent } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';

export default function AgentSettings() {
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    quietHours: '22:00-07:00',
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Perfil, notificaciones y privacidad.</p>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Perfil</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input defaultValue={`${mockAgent.firstName} ${mockAgent.lastName}`} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={mockAgent.email} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input defaultValue={mockAgent.phone} />
              </div>
              <div className="space-y-2">
                <Label>Zona principal</Label>
                <Input defaultValue={mockAgent.zones[0].name} />
              </div>
              <div className="space-y-2">
                <Label>Idiomas</Label>
                <Input defaultValue={mockAgent.languages.join(', ')} />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Input value={mockAgent.role} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'push', label: 'Push en app', desc: 'Nuevo lead, nuevo mensaje, cita en 24h' },
                { key: 'email', label: 'Email', desc: 'Resumen diario y recordatorios' },
                { key: 'sms', label: 'SMS', desc: 'Solo urgentes y leads premium' },
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium text-sm">Quiet hours</p>
                  <p className="text-xs text-muted-foreground">Evita SMS fuera de horario</p>
                </div>
                <Select
                  value={notifications.quietHours}
                  onValueChange={(v) => setNotifications((prev) => ({ ...prev, quietHours: v }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="22:00-07:00">22:00 - 07:00</SelectItem>
                    <SelectItem value="21:00-07:00">21:00 - 07:00</SelectItem>
                    <SelectItem value="Sin descanso">Sin descanso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-4">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Verificación de identidad en proceso: {mockAgent.status === 'active' ? 'Completada' : 'Pendiente'}.</p>
              <p>Activar 2FA y restringir sesiones antiguas.</p>
              <Button variant="outline" size="sm">Configurar 2FA</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Disponibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Label>Horario principal</Label>
              <Input defaultValue="L-V 09:00 - 19:00" />
              <Label>Zona horaria</Label>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">CDMX (GMT-6)</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
