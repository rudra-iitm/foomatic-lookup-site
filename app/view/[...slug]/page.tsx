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
    if (resolvedParams.slug[0] === '__static_export_stub__') {
        return null;
    }

    const basePath = process.env.NODE_ENV === "production" ? "/foomatic-lookup-site" : "";
    const filenameWithoutExt = resolvedParams.slug.join('-');
    const filename = `${filenameWithoutExt}.ppd`;
    const filePath = path.join(process.cwd(), 'public', 'ppds', filename);
    let content = "";
    let error = null;

    try {
        if (fs.existsSync(filePath)) {
            content = fs.readFileSync(filePath, 'utf8');
        } else {
            error = "PPD file is not available.";
        }
    } catch (e) {
        console.error("Error reading file:", e);
        error = "PPD file is not available.";
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
                            Back
                        </Button>
                    </Link>
                    <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>PPD Source</span>
                    </div>
                </div>
                <Card className="bg-gradient-card border-border/50 shadow-card overflow-hidden w-full">
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-6 px-8">
                        <div className="space-y-1">
                            <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
                                <FileText className="h-6 w-6 text-primary" />
                                {filename}
                            </CardTitle>
                        </div>

                        <a href={`${basePath}/ppds/${filename}`} download>
                            <Button className="gap-2 shadow-md" size="default">
                                <Download className="h-4 w-4" />
                                Download PPD File
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
    const printersPath = path.join(process.cwd(), 'public', 'foomatic-db', 'printers.json');

    if (!fs.existsSync(printersPath)) {
        console.log('[generateStaticParams] printers.json not found, returning stub for lightweight build');
        return [{ slug: ['__static_export_stub__'] }];
    }

    try {
        const data = fs.readFileSync(printersPath, 'utf8');
        const json = JSON.parse(data);
        const printers = json.printers || [];

        const params = [];

        for (const printer of printers) {
            const printerId = printer.id;
            if (printer.drivers && printer.drivers.length > 0) {
                for (const driver of printer.drivers) {
                    const driverId = driver.id.replace('driver/', '');
                    const slug = `${printerId}-${driverId}`;
                    params.push({ slug: slug.split('-') });
                }
            }
        }

        console.log(`[generateStaticParams] Generated ${params.length} PPD view routes`);
        if (params.length === 0) {
            console.log('[generateStaticParams] No routes found, returning stub');
            return [{ slug: ['__static_export_stub__'] }];
        }

        return params;
    } catch (e) {
        console.error('[generateStaticParams] Error:', e);
        return [{ slug: ['__static_export_stub__'] }];
    }
}

