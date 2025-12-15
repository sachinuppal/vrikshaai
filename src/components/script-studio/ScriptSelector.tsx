import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SavedScript {
  id: string;
  name: string;
  industry: string | null;
  use_case: string | null;
  status: string | null;
  updated_at: string | null;
}

interface ScriptSelectorProps {
  currentScriptId: string | null;
  onSelectScript: (scriptId: string | null) => void;
  onNewScript: () => void;
}

export const ScriptSelector = ({
  currentScriptId,
  onSelectScript,
  onNewScript,
}: ScriptSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [scripts, setScripts] = useState<SavedScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_scripts")
        .select("id, name, industry, use_case, status, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error("Failed to load scripts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedScript = scripts.find((s) => s.id === currentScriptId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : selectedScript ? (
            <span className="truncate">{selectedScript.name}</span>
          ) : (
            "Select or create script..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search scripts..." />
          <CommandList>
            <CommandEmpty>No scripts found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onNewScript();
                  setOpen(false);
                }}
                className="text-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Script
              </CommandItem>
            </CommandGroup>
            {scripts.length > 0 && (
              <CommandGroup heading="Saved Scripts">
                {scripts.map((script) => (
                  <CommandItem
                    key={script.id}
                    value={script.name}
                    onSelect={() => {
                      onSelectScript(script.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentScriptId === script.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="truncate">{script.name}</span>
                      {script.industry && (
                        <span className="text-xs text-muted-foreground">
                          {script.industry}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
