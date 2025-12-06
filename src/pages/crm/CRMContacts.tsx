import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  Phone,
  Mail,
  Building,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CRMLayout } from "@/components/crm/CRMLayout";

interface Contact {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  user_type: string | null;
  primary_industry: string | null;
  lifecycle_stage: string | null;
  intent_score: number;
  engagement_score: number;
  total_interactions: number;
  last_interaction_at: string | null;
  tags: string[];
}

export default function CRMContacts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [userType, setUserType] = useState(searchParams.get("user_type") || "all");
  const [lifecycleStage, setLifecycleStage] = useState(searchParams.get("stage") || "all");
  const [industry, setIndustry] = useState(searchParams.get("industry") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "last_interaction_at");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchContacts();
  }, [userType, lifecycleStage, industry, sortBy, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchContacts();
      } else {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("crm_contacts")
        .select("*", { count: "exact" });

      // Apply filters
      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company_name.ilike.%${search}%`
        );
      }

      if (userType !== "all") {
        query = query.eq("user_type", userType);
      }

      if (lifecycleStage !== "all") {
        query = query.eq("lifecycle_stage", lifecycleStage);
      }

      if (industry !== "all") {
        query = query.eq("primary_industry", industry);
      }

      // Sorting
      const sortOrder = sortBy.startsWith("-") ? true : false;
      const sortField = sortBy.replace("-", "");
      query = query.order(sortField, { ascending: sortOrder, nullsFirst: false });

      // Pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setContacts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const lifecycleColors: Record<string, string> = {
    lead: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    qualified: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    opportunity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    customer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    churned: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const getIntentColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground">
              {totalCount} contacts in your CRM
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="founder">Founder</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={lifecycleStage} onValueChange={setLifecycleStage}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="edtech">EdTech</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="ecommerce">E-Commerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_interaction_at">Last Activity</SelectItem>
                  <SelectItem value="-intent_score">Intent (High → Low)</SelectItem>
                  <SelectItem value="intent_score">Intent (Low → High)</SelectItem>
                  <SelectItem value="-engagement_score">Engagement</SelectItem>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="-created_at">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))
          ) : contacts.length === 0 ? (
            <Card className="border-none shadow-card">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No contacts found</h3>
                <p className="text-muted-foreground mb-4">
                  {search || userType !== "all" || lifecycleStage !== "all"
                    ? "Try adjusting your filters"
                    : "Sync your voice calls to populate contacts"}
                </p>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="border-none shadow-card hover:shadow-hover cursor-pointer transition-all"
                  onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-primary">
                          {(contact.full_name || "U")[0].toUpperCase()}
                        </span>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {contact.full_name || "Unknown Contact"}
                          </h3>
                          <Badge className={lifecycleColors[contact.lifecycle_stage || "lead"]}>
                            {contact.lifecycle_stage || "lead"}
                          </Badge>
                          {contact.user_type && contact.user_type !== "general" && (
                            <Badge variant="outline">{contact.user_type}</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {contact.company_name && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {contact.company_name}
                            </span>
                          )}
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="hidden md:flex items-center gap-6 text-center">
                        <div>
                          <div className={`text-lg font-bold ${getIntentColor(contact.intent_score)}`}>
                            {contact.intent_score}%
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Intent
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-foreground">
                            {contact.engagement_score}%
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Engagement
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-foreground">
                            {contact.total_interactions}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Interactions
                          </div>
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div className="hidden lg:block text-right text-sm text-muted-foreground">
                        {contact.last_interaction_at ? (
                          <>
                            <div>Last activity</div>
                            <div>
                              {new Date(contact.last_interaction_at).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <div>No activity yet</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
