import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, AlertCircle } from "lucide-react";

interface ViewPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ViewPPD({ params }: ViewPageProps) {
  const resolvedParams = await params;
  const filenameWithoutExt = resolvedParams.slug.join('-');
  const filename = `${filenameWithoutExt}.ppd`;
  const filePath = path.join(process.cwd(), 'public', 'ppds', filename);

  let content = "";
  let error = null;

  try {
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    } else {
      error = `File not found.`;
    }
  } catch (e) {
    console.error("Error reading file:", e);
    error = "An error occurred while reading the file.";
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gradient-card border-destructive/20 shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-full bg-destructive/10 text-destructive w-fit mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl text-foreground">File Not Found</CardTitle>
            <CardDescription className="text-destructive mt-2">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen pb-20">
      <div className="w-full px-6 md:px-12 py-6 mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-gradient-card border-border/50 text-muted-foreground hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>PPD Source Viewer</span>
          </div>
        </div>
        <Card className="bg-gradient-card border-border/50 shadow-card overflow-hidden w-full">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 bg-muted/20 pb-6 px-8">
            <div className="space-y-1">
              <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                {filename}
              </CardTitle>
              <CardDescription className="text-muted-foreground font-mono text-xs break-all">
                public/ppds/{filename}
              </CardDescription>
            </div>

            <a href={`/ppds/${filename}`} download>
              <Button className="gap-2 shadow-md" size="default">
                <Download className="h-4 w-4" />
                Download Raw File
              </Button>
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative group">
              <pre className="p-8 overflow-auto max-h-[85vh] text-sm md:text-base font-mono leading-relaxed bg-[#0d0d0d] text-gray-300 w-full">
                <code>{content}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const ppdRoot = path.join(process.cwd(), 'public', 'ppds');
  if (!fs.existsSync(ppdRoot)) return [];

  const params = [];
  try {
    const files = fs.readdirSync(ppdRoot);
    for (const file of files) {
      if (file.endsWith('.ppd')) {
        params.push({
          slug: [file.replace('.ppd', '')],
        });
      }
    }
  } catch (err) {
    console.error("Error reading PPDs:", err);
  }
  return params;
}