import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Linkedin, Phone, Mail, Trash2, Edit2 } from 'lucide-react';

interface Cofounder {
  name: string;
  email: string;
  role: string;
  linkedin?: string;
  phone?: string;
}

interface CofounderCardProps {
  cofounder: Cofounder;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function CofounderCard({ cofounder, index, onEdit, onRemove, disabled }: CofounderCardProps) {
  return (
    <Card className="bg-muted/30 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground truncate">{cofounder.name}</h4>
                <Badge variant="secondary" className="text-xs">{cofounder.role}</Badge>
              </div>
              <div className="mt-1 space-y-0.5">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{cofounder.email}</span>
                </div>
                {cofounder.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{cofounder.phone}</span>
                  </div>
                )}
                {cofounder.linkedin && (
                  <a 
                    href={cofounder.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          </div>
          {!disabled && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(index)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onRemove(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
