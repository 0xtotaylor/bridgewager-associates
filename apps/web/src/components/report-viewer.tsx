'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, Share2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReportFile {
  id: string;
  name: string;
  buffer: number[];
}

interface ReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  onLoadReport: () => Promise<ReportFile[]>;
}

export function ReportViewer({
  isOpen,
  onClose,
  reportTitle,
  onLoadReport,
}: ReportViewerProps) {
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const loadFileContent = async (file: ReportFile) => {
    try {
      const uint8Array = new Uint8Array(file.buffer);
      const decoder = new TextDecoder('utf-8');
      const content = decoder.decode(uint8Array);
      setSelectedFileContent(content);
      setSelectedFileName(file.name);

      // Auto-scroll to top when switching files
      setTimeout(() => {
        const contentElement = document.querySelector('[data-content-area]');
        if (contentElement) {
          contentElement.scrollTop = 0;
        }
      }, 100);
    } catch (error) {
      console.error('Error decoding file content:', error);
      setSelectedFileContent('Error: Unable to decode file content');
      setSelectedFileName(file.name);
    }
  };

  const handleFileSelect = (file: ReportFile) => {
    loadFileContent(file);
  };

  const truncateFileName = (fileName: string, maxLength: number = 30) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName =
      nameWithoutExt.substring(0, maxLength - extension!.length - 4) + '...';
    return `${truncatedName}.${extension}`;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'md':
        return '📝';
      case 'txt':
        return '📄';
      case 'json':
        return '⚙️';
      case 'csv':
        return '📊';
      case 'pdf':
        return '📕';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Load report files when dialog opens
  useEffect(() => {
    if (isOpen && files.length === 0) {
      const loadReport = async () => {
        setLoading(true);
        try {
          const reportFiles = await onLoadReport();
          setFiles(reportFiles);

          if (reportFiles.length > 0 && reportFiles[0]) {
            await loadFileContent(reportFiles[0]);
          }
        } catch (error) {
          console.error('Error loading report:', error);
        } finally {
          setLoading(false);
        }
      };

      loadReport();
    }
  }, [isOpen, files.length, onLoadReport]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setSelectedFileContent('');
      setSelectedFileName('');
      setLoading(false);
    }
  }, [isOpen]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      }

      // Ctrl/Cmd + K to close
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh] p-0 overflow-hidden bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>{reportTitle}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading report files...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
              <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex h-[calc(98vh-73px)] min-h-0">
              {/* Left Sidebar - Files List */}
              {files.length > 1 && (
                <div className="w-80 border-r bg-muted/20 flex flex-col shrink-0">
                  <div className="p-3 border-b bg-muted/30">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Files ({files.length})
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-2 space-y-1">
                      {files.map((file) => (
                        <Button
                          key={file.id}
                          variant={
                            selectedFileName === file.name ? 'default' : 'ghost'
                          }
                          size="sm"
                          className="w-full justify-start text-left text-sm h-auto py-2 px-3 rounded-md"
                          onClick={() => handleFileSelect(file)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-lg shrink-0">
                              {getFileIcon(file.name)}
                            </span>
                            <div className="flex flex-col items-start w-full min-w-0">
                              <span className="w-full text-left font-medium break-words text-xs leading-tight">
                                {truncateFileName(file.name)}
                              </span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {formatFileSize(file.buffer.length)}
                              </span>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Right Content Area */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0">
                {selectedFileContent ? (
                  <>
                    {/* File Header */}
                    <div className="px-4 py-3 border-b bg-muted/10 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h4
                            className="font-medium text-base text-foreground break-words"
                            title={selectedFileName}
                          >
                            {selectedFileName}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Content preview •{' '}
                            {formatFileSize(selectedFileContent.length)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-4 min-h-0">
                      <div className="bg-muted/20 rounded-lg border w-full h-full overflow-hidden">
                        <div
                          className="p-4 h-full overflow-auto"
                          data-content-area
                        >
                          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-foreground">
                            {selectedFileContent}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-6 border-t bg-muted/10 shrink-0">
                      <div className="flex items-center">
                        <div className="flex-1" />
                        <div className="flex items-center">
                          <Button>Place Wager</Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : files.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-12">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">
                        No files found for this report
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        The report may not have any attached files or there was
                        an error loading them.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-12">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">
                        Select a file to view its content
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Choose a file from the left sidebar to display its
                        contents here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
