import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  Building,
  Zap,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  PlusCircle,
  Workflow,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactScoreRing } from "./ContactScoreRing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactHeaderProps {
  contact: any;
  scores: any;
  scoresUpdating?: boolean;
}

const lifecycleColors: Record<string, string> = {
  lead: "bg-blue-500",
  qualified: "bg-amber-500",
  opportunity: "bg-purple-500",
  customer: "bg-emerald-500",
  churned: "bg-red-500",
};

const lifecycleBorderColors: Record<string, string> = {
  lead: "border-blue-500/30",
  qualified: "border-amber-500/30",
  opportunity: "border-purple-500/30",
  customer: "border-emerald-500/30",
  churned: "border-red-500/30",
};

export function ContactHeader({ contact, scores, scoresUpdating }: ContactHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`border-none shadow-card overflow-hidden relative ${lifecycleBorderColors[contact.lifecycle_stage] || ""}`}>
        {/* Lifecycle Color Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${lifecycleColors[contact.lifecycle_stage] || "bg-muted"}`} />
        
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02] pointer-events-none" />
        
        <CardContent className="pt-8 pb-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4 flex-1">
              {/* Avatar with Status Ring */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                >
                  <span className="text-2xl font-bold text-primary">
                    {(contact.full_name || "U")[0].toUpperCase()}
                  </span>
                </motion.div>
                
                {/* Online Indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
              </div>

              {/* Name & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-xl font-bold text-foreground truncate">
                    {contact.full_name || "Unknown Contact"}
                  </h1>
                  <Badge 
                    className={`${lifecycleColors[contact.lifecycle_stage]} text-white text-xs`}
                  >
                    {contact.lifecycle_stage}
                  </Badge>
                  {contact.user_type && (
                    <Badge variant="outline" className="text-xs">
                      {contact.user_type}
                    </Badge>
                  )}
                </div>

                {/* Contact Details Row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {contact.company_name && (
                    <span className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5" />
                      {contact.company_name}
                    </span>
                  )}
                  {contact.email && (
                    <a 
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a 
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {contact.phone}
                    </a>
                  )}
                </div>

                {/* Tags Row */}
                {(contact.primary_industry || (contact.tags && contact.tags.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {contact.primary_industry && (
                      <Badge variant="secondary" className="text-xs">
                        {contact.primary_industry}
                      </Badge>
                    )}
                    {contact.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs bg-muted/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Score Rings */}
            <div className="flex items-center gap-4 lg:gap-6 px-4 py-3 bg-muted/30 rounded-xl">
              {scoresUpdating && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <ContactScoreRing
                value={scores.current.intent}
                label="Intent"
                icon={<Zap className="h-3 w-3" />}
                size="md"
              />
              <ContactScoreRing
                value={scores.current.engagement}
                label="Engagement"
                icon={<TrendingUp className="h-3 w-3" />}
                size="md"
              />
              <ContactScoreRing
                value={scores.current.churn_risk}
                label="Churn Risk"
                icon={<AlertTriangle className="h-3 w-3" />}
                size="md"
                inverted
              />
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-border/50">
            <Button size="sm" variant="default" className="gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Call
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              Add Task
            </Button>
            <Link to={`/crm/contacts/${contact.id}/flows`}>
              <Button size="sm" variant="secondary" className="gap-1.5">
                <Workflow className="h-3.5 w-3.5" />
                Manage Flows
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                <DropdownMenuItem>Merge Duplicates</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
