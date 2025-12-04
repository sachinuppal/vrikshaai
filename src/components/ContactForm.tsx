import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { countries, getCountryByCode } from "@/data/countries";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  countryCode: z.string().min(1, "Please select a country"),
  phone: z.string().trim().min(5, "Phone number is required").max(20),
  message: z.string().trim().max(1000).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  source?: string;
  onSuccess?: () => void;
}

const ContactForm = ({ source = "contact_form", onSuccess }: ContactFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("IN");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      countryCode: "IN",
    },
  });

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setValue("countryCode", code);
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    const country = getCountryByCode(data.countryCode);
    const fullPhone = country ? `${country.dialCode} ${data.phone}` : data.phone;

    try {
      const { error } = await supabase.from("lead_submissions").insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        country_code: data.countryCode,
        mobile: fullPhone,
        use_case: data.message || null,
        source: source,
      });

      if (error) throw error;

      // Send email notification (fire and forget - don't block on it)
      supabase.functions.invoke("send-contact-notification", {
        body: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          countryCode: data.countryCode,
          mobile: fullPhone,
          message: data.message,
        },
      }).catch((emailError) => {
        console.error("Email notification failed:", emailError);
      });

      toast({
        title: "Message sent!",
        description: "We'll get back to you shortly.",
      });

      reset();
      setSelectedCountry("IN");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountryData = getCountryByCode(selectedCountry);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-foreground">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            {...register("firstName")}
            className="bg-background border-input"
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-foreground">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            {...register("lastName")}
            className="bg-background border-input"
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register("email")}
          className="bg-background border-input"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Country & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-foreground">
            Country <span className="text-destructive">*</span>
          </Label>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="bg-background border-input">
              <SelectValue>
                {selectedCountryData && (
                  <span className="flex items-center gap-2">
                    <span>{selectedCountryData.flag}</span>
                    <span>{selectedCountryData.name}</span>
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-[300px]">
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="text-muted-foreground">({country.dialCode})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.countryCode && (
            <p className="text-sm text-destructive">{errors.countryCode.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone" className="text-foreground">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <div className="flex">
            <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground text-sm">
              {selectedCountryData?.dialCode}
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="9876543210"
              {...register("phone")}
              className="bg-background border-input rounded-l-none"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-foreground">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Tell us about your requirements..."
          rows={4}
          {...register("message")}
          className="bg-background border-input resize-none"
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
};

export default ContactForm;
