import { useState, useRef } from 'react';
import { Upload, FileJson, MessageSquare, Link2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

interface ObservabilityUploaderProps {
  onAnalyze: (data: { scriptJson?: object; transcript: object[]; callId?: string }) => void;
  isLoading: boolean;
}

export function ObservabilityUploader({ onAnalyze, isLoading }: ObservabilityUploaderProps) {
  const [scriptJson, setScriptJson] = useState<object | null>(null);
  const [transcript, setTranscript] = useState<object[]>([]);
  const [transcriptText, setTranscriptText] = useState('');
  const [callId, setCallId] = useState('');
  const [scriptFileName, setScriptFileName] = useState('');
  const [transcriptFileName, setTranscriptFileName] = useState('');
  
  const scriptInputRef = useRef<HTMLInputElement>(null);
  const transcriptInputRef = useRef<HTMLInputElement>(null);

  const handleScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setScriptJson(json);
          setScriptFileName(file.name);
        } catch {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTranscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const transcriptArray = Array.isArray(json) ? json : json.transcript || [];
          setTranscript(transcriptArray);
          setTranscriptFileName(file.name);
          setTranscriptText(JSON.stringify(transcriptArray, null, 2));
        } catch {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const parseTranscriptText = () => {
    try {
      const parsed = JSON.parse(transcriptText);
      const transcriptArray = Array.isArray(parsed) ? parsed : parsed.transcript || [];
      setTranscript(transcriptArray);
      return transcriptArray;
    } catch {
      // Try to parse as simple text format
      const lines = transcriptText.split('\n').filter(line => line.trim());
      const parsed = lines.map(line => {
        const match = line.match(/^(Bot|User|Assistant):\s*(.+)$/i);
        if (match) {
          return { role: match[1].toLowerCase() === 'bot' ? 'assistant' : match[1].toLowerCase(), content: match[2] };
        }
        return { role: 'user', content: line };
      });
      setTranscript(parsed);
      return parsed;
    }
  };

  const handleAnalyze = () => {
    let transcriptData = transcript;
    if (transcript.length === 0 && transcriptText) {
      transcriptData = parseTranscriptText();
    }
    
    if (transcriptData.length === 0) {
      alert('Please provide a transcript');
      return;
    }

    onAnalyze({
      scriptJson: scriptJson || undefined,
      transcript: transcriptData,
      callId: callId || undefined,
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload for Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Script Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Script JSON (Optional)
          </Label>
          <div className="flex gap-2">
            <Input
              ref={scriptInputRef}
              type="file"
              accept=".json"
              onChange={handleScriptUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => scriptInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {scriptFileName || 'Upload Script JSON'}
            </Button>
            {scriptJson && (
              <Button variant="ghost" size="icon" onClick={() => { setScriptJson(null); setScriptFileName(''); }}>
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Transcript Input */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Transcript (Required)
          </Label>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="paste">Paste</TabsTrigger>
              <TabsTrigger value="callid">Call ID</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-2">
              <Input
                ref={transcriptInputRef}
                type="file"
                accept=".json"
                onChange={handleTranscriptUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => transcriptInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {transcriptFileName || 'Upload Transcript JSON'}
              </Button>
            </TabsContent>
            
            <TabsContent value="paste">
              <Textarea
                placeholder={`Paste transcript JSON or simple format:\nBot: Hello, how can I help?\nUser: I need information about...\nBot: Sure, let me help you with that.`}
                className="min-h-[200px] font-mono text-sm"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
              />
            </TabsContent>
            
            <TabsContent value="callid" className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Call ID or Ringg Call ID"
                  value={callId}
                  onChange={(e) => setCallId(e.target.value)}
                />
                <Button variant="outline">
                  <Link2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a call ID to fetch the transcript automatically
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Analyze Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleAnalyze}
          disabled={isLoading || (transcript.length === 0 && !transcriptText && !callId)}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Run Comprehensive Analysis'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
