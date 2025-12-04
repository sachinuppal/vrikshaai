import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, 
  Phone, 
  Home, 
  ShoppingCart, 
  HeartPulse, 
  GraduationCap, 
  Briefcase, 
  ClipboardList,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

const industries = [
  { 
    icon: Landmark, 
    name: 'Financial Services', 
    color: 'from-blue-500 to-blue-600',
    useCases: [
      'Loan eligibility calls',
      'Payment reminders',
      'KYC verification',
      'Compliance calls',
      'Customer support',
    ]
  },
  { 
    icon: Phone, 
    name: 'Telecom / Utilities', 
    color: 'from-purple-500 to-purple-600',
    useCases: [
      'Billing follow-ups',
      'Outage notifications',
      'Plan upgrades',
      'Churn management',
      'Customer support',
    ]
  },
  { 
    icon: Home, 
    name: 'Real Estate', 
    color: 'from-primary to-orange-500',
    useCases: [
      'Lead qualification',
      'Property inquiries',
      'Site visit booking',
      'Follow-up calls',
      'Loan reminders',
    ]
  },
  { 
    icon: ShoppingCart, 
    name: 'E-commerce / D2C', 
    color: 'from-green-500 to-emerald-500',
    useCases: [
      'Abandoned cart reminders',
      'Order confirmations',
      'Payment follow-ups',
      'Feedback calls',
      'Customer support',
    ]
  },
  { 
    icon: HeartPulse, 
    name: 'Healthcare', 
    color: 'from-red-500 to-pink-500',
    useCases: [
      'Appointment booking',
      'Follow-up calls',
      'Prescription reminders',
      'Tele-consultation scheduling',
      'Patient support',
    ]
  },
  { 
    icon: GraduationCap, 
    name: 'Education / EdTech', 
    color: 'from-indigo-500 to-indigo-600',
    useCases: [
      'Admission calls',
      'Fee collection',
      'Course suggestions',
      'Student support',
      'Feedback calls',
    ]
  },
  { 
    icon: Briefcase, 
    name: 'SaaS / B2B', 
    color: 'from-cyan-500 to-cyan-600',
    useCases: [
      'Client onboarding',
      'Demo scheduling',
      'Renewal reminders',
      'NPS / feedback',
      'Support calls',
    ]
  },
  { 
    icon: ClipboardList, 
    name: 'Market Research', 
    color: 'from-amber-500 to-amber-600',
    useCases: [
      'Survey calls',
      'Data capture',
      'Sentiment analysis',
      'Feedback loops',
      'Callback scheduling',
    ]
  },
];

export const InteractiveIndustryGrid = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {industries.map((industry, index) => {
        const Icon = industry.icon;
        const isSelected = selectedIndustry === index;

        return (
          <motion.div
            key={index}
            className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
              isSelected 
                ? 'bg-card border-2 border-primary shadow-lg shadow-primary/10' 
                : 'bg-card border border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedIndustry(isSelected ? null : index)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            layout
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center`}
                animate={{ scale: isSelected ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ rotate: isSelected ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </motion.div>
            </div>

            <h3 className={`font-semibold mb-2 ${isSelected ? 'text-primary' : ''}`}>
              {industry.name}
            </h3>

            {/* Use cases - expandable */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-border mt-2 space-y-2">
                    {industry.useCases.map((useCase, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-2 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{useCase}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click hint when not selected */}
            {!isSelected && (
              <p className="text-xs text-muted-foreground mt-2">
                Click to view use cases →
              </p>
            )}

            {/* Subtle glow when selected */}
            {isSelected && (
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${industry.color} opacity-5 -z-10`}
                layoutId={`glow-${index}`}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
