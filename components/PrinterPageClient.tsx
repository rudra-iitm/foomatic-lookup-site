
'use client'

import { Printer } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Separator } from '@/components/ui/separator';

interface PrinterPageClientProps {
  printer: Printer | undefined;
}

export default function PrinterPageClient({ printer }: PrinterPageClientProps) {
  if (!printer) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold">Printer not found</h1>
        <Link href="/">
          <Button variant="link" className="mt-4">
            &larr; Back to all printers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            &larr; Back
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{printer.model}</CardTitle>
              <CardDescription>{printer.manufacturer}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Type:</strong> {printer.type}</p>
                <p><strong>Status:</strong> <Badge variant={printer.status === 'recommended' ? 'default' : 'secondary'}>{printer.status}</Badge></p>
              </div>
              <Separator className="my-4" />
              <div>
                <h3 className="font-bold mb-2">Notes</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{printer.notes || 'No notes available.'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <div>
            <h2 className="text-2xl font-bold mb-4">Drivers</h2>
            <div className="space-y-4">
              {printer.drivers.map((driver) => (
                <Card key={driver.id} className="bg-card/50">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{driver.name}</CardTitle>
                      {driver.url && (
                        <Link href={driver.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                          {driver.url}
                        </Link>
                      )}
                    </div>
                    {driver.id === printer.recommended_driver && (
                      <Badge>Recommended</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-semibold">Comments</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: driver.comments || 'No comments available.' }} />
                    </div>
                    {driver.execution && (
                      <div className="mt-4">
                        <details>
                          <summary className="cursor-pointer font-semibold">View PPD Generation Command</summary>
                          <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={{background: 'transparent', border: 'none', padding: 0}}>
                            {driver.execution.prototype}
                          </SyntaxHighlighter>
                        </details>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
