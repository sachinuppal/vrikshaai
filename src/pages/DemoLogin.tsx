import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/data/countries";
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Phone, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function DemoLogin() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullPhone, setFullPhone] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/call-history';
  const callId = (location.state as { callId?: string })?.callId;

  // Pre-fill from sessionStorage (captured during first call)
  const storedName = sessionStorage.getItem('voice_user_name') || '';
  const storedPhone = sessionStorage.getItem('voice_user_phone') || '';
  
  // Parse stored phone to extract country code and number
  const parseStoredPhone = () => {
    if (!storedPhone) return { code: 'IN', number: '' };
    // Find matching country by dial code
    for (const country of countries) {
      if (storedPhone.startsWith(country.dialCode)) {
        return {
          code: country.code,
          number: storedPhone.replace(country.dialCode, '')
        };
      }
    }
    return { code: 'IN', number: storedPhone };
  };

  const parsedPhone = parseStoredPhone();
  const [name, setName] = useState(storedName);
  const [phone, setPhone] = useState(parsedPhone.number);
  const [countryCode, setCountryCode] = useState(parsedPhone.code);

  const selectedCountry = countries.find(c => c.code === countryCode);

  useEffect(() => {
    if (user) {
      // Link calls to user after login
      linkCallsToUser().then(() => {
        if (callId) {
          navigate(`/call-analysis/${callId}`, { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      });
    }
  }, [user, navigate, from, callId]);

  const linkCallsToUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/link-calls-to-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (data.linked > 0) {
        toast.success(`Linked ${data.linked} previous call(s) to your account`);
      }
    } catch (error) {
      console.error('Error linking calls:', error);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    const phoneWithCode = `${selectedCountry?.dialCode}${phone}`;
    setFullPhone(phoneWithCode);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneWithCode,
      });

      if (error) {
        console.error('OTP error:', error);
        toast.error(error.message || 'Failed to send OTP');
      } else {
        setStep('otp');
        toast.success('OTP sent to your phone');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        console.error('Verify error:', error);
        toast.error(error.message || 'Invalid OTP');
      } else {
        toast.success('Phone verified successfully!');
        // User state will update via AuthContext and trigger redirect
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {step === 'phone' ? (
                <Phone className="w-8 h-8 text-primary" />
              ) : (
                <Shield className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">
                {step === 'phone' 
                  ? (storedName ? `Welcome back, ${storedName}` : 'Verify Your Phone')
                  : 'Enter OTP'
                }
              </CardTitle>
              <CardDescription>
                {step === 'phone' 
                  ? (storedName 
                      ? 'Verify your phone to create an account and access all your calls'
                      : 'Enter your phone number to create an account')
                  : `We sent a code to ${fullPhone}`
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                            <span className="text-muted-foreground">{country.dialCode}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-muted rounded-md border border-input text-sm">
                      {selectedCountry?.dialCode}
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      disabled={isLoading}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send a one-time password to verify your phone
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  disabled={isLoading}
                >
                  Change phone number
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="w-full text-muted-foreground"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  Didn't receive code? Resend OTP
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
