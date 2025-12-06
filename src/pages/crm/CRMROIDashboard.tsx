import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users, 
  Target,
  Zap,
  PhoneCall,
  Mail,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PiggyBank,
  Timer,
  UserCheck,
  Percent
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for ROI metrics
const monthlyROIData = [
  { month: 'Jan', costSaved: 12500, timeSaved: 320, conversions: 45, revenue: 125000 },
  { month: 'Feb', costSaved: 15200, timeSaved: 380, conversions: 52, revenue: 148000 },
  { month: 'Mar', costSaved: 18900, timeSaved: 420, conversions: 61, revenue: 172000 },
  { month: 'Apr', costSaved: 22100, timeSaved: 485, conversions: 68, revenue: 195000 },
  { month: 'May', costSaved: 26500, timeSaved: 540, conversions: 75, revenue: 225000 },
  { month: 'Jun', costSaved: 31200, timeSaved: 610, conversions: 84, revenue: 268000 },
];

const channelROIData = [
  { channel: 'Voice AI', calls: 2450, conversions: 196, costPerLead: 12, timeSaved: 245 },
  { channel: 'Email', calls: 8200, conversions: 328, costPerLead: 8, timeSaved: 164 },
  { channel: 'WhatsApp', calls: 3100, conversions: 186, costPerLead: 15, timeSaved: 155 },
  { channel: 'SMS', calls: 5600, conversions: 224, costPerLead: 6, timeSaved: 112 },
];

const automationSavings = [
  { name: 'Lead Qualification', manual: 45, automated: 8, savings: 82 },
  { name: 'Follow-up Scheduling', manual: 30, automated: 2, savings: 93 },
  { name: 'Data Entry', manual: 60, automated: 5, savings: 92 },
  { name: 'Report Generation', manual: 120, automated: 10, savings: 92 },
  { name: 'Customer Routing', manual: 15, automated: 1, savings: 93 },
];

const conversionFunnel = [
  { stage: 'Leads Generated', value: 10000, percentage: 100 },
  { stage: 'Qualified', value: 4500, percentage: 45 },
  { stage: 'Engaged', value: 2700, percentage: 27 },
  { stage: 'Proposal Sent', value: 1350, percentage: 13.5 },
  { stage: 'Converted', value: 675, percentage: 6.75 },
];

const costBreakdown = [
  { name: 'Voice AI Calls', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Email Automation', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'SMS Campaigns', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'WhatsApp Business', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 5, color: 'hsl(var(--chart-5))' },
];

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  subtitle?: string;
}

const MetricCard = ({ title, value, change, changeLabel, icon, trend, subtitle }: MetricCardProps) => (
  <Card className="relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      <div className="flex items-center gap-1 mt-2">
        {trend === 'up' ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span className={trend === 'up' ? 'text-green-500 text-sm font-medium' : 'text-red-500 text-sm font-medium'}>
          {change}%
        </span>
        <span className="text-xs text-muted-foreground">{changeLabel}</span>
      </div>
    </CardContent>
  </Card>
);

export default function CRMROIDashboard() {
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              ROI Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your automation ROI, cost savings, and conversion metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="gap-1 py-1.5">
              <Sparkles className="h-3 w-3" />
              AI Insights Active
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Cost Saved"
            value="$126,400"
            change={24.5}
            changeLabel="vs last period"
            icon={<PiggyBank className="h-5 w-5" />}
            trend="up"
            subtitle="From automation efficiency"
          />
          <MetricCard
            title="Time Saved"
            value="2,755 hrs"
            change={18.2}
            changeLabel="vs last period"
            icon={<Timer className="h-5 w-5" />}
            trend="up"
            subtitle="Equivalent to 1.5 FTEs"
          />
          <MetricCard
            title="Conversion Rate"
            value="6.75%"
            change={12.8}
            changeLabel="vs last period"
            icon={<UserCheck className="h-5 w-5" />}
            trend="up"
            subtitle="675 conversions this period"
          />
          <MetricCard
            title="Cost per Lead"
            value="$8.42"
            change={15.3}
            changeLabel="reduction"
            icon={<Target className="h-5 w-5" />}
            trend="up"
            subtitle="Down from $9.93"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ROI Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                ROI Trend
              </CardTitle>
              <CardDescription>Cost savings and revenue growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyROIData}>
                  <defs>
                    <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="costSaved" 
                    name="Cost Saved"
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorSaved)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue"
                    stroke="hsl(var(--chart-2))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Cost Distribution
              </CardTitle>
              <CardDescription>Spending breakdown by channel</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Automation Savings & Channel Performance */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Automation Savings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Automation Savings
              </CardTitle>
              <CardDescription>Time saved per automated task (minutes)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationSavings.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.manual}min → {item.automated}min
                      </Badge>
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        {item.savings}% saved
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={item.savings} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Channel Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Channel Performance
              </CardTitle>
              <CardDescription>ROI metrics by communication channel</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={channelROIData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="channel" type="category" width={80} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="conversions" name="Conversions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="timeSaved" name="Time Saved (hrs)" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>Lead progression through sales stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ 
                          backgroundColor: `hsl(var(--primary) / ${0.2 + (index * 0.2)})`,
                          color: 'hsl(var(--primary))'
                        }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">{stage.value.toLocaleString()}</span>
                      <Badge variant="secondary">{stage.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="ml-11">
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${stage.percentage}%`,
                          background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))`
                        }}
                      />
                    </div>
                  </div>
                  {index < conversionFunnel.length - 1 && (
                    <div className="absolute left-4 top-10 h-4 w-0.5 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Performance Summary
            </CardTitle>
            <CardDescription>Detailed breakdown of key metrics by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Month</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Cost Saved</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Time Saved (hrs)</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conversions</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyROIData.map((row, index) => {
                    const roi = ((row.revenue - row.costSaved) / row.costSaved * 100).toFixed(0);
                    return (
                      <tr key={row.month} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{row.month}</td>
                        <td className="text-right py-3 px-4 text-green-500">${row.costSaved.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{row.timeSaved}</td>
                        <td className="text-right py-3 px-4">{row.conversions}</td>
                        <td className="text-right py-3 px-4">${row.revenue.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                            {roi}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
