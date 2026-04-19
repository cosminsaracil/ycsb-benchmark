"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, X } from "lucide-react";
import { useCurrentTheme } from "@/utils/useCurrentTheme";

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

export function AISummaryModal({
  isOpen,
  onClose,
  summary,
  isLoading,
  error,
}: AISummaryModalProps) {
  const currentTheme = useCurrentTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <DialogTitle>AI Benchmark Summary</DialogTitle>
          </div>
          <DialogDescription>
            Powered by OpenRouter • Mistral 7B Instruct
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            {/* Animated loading container */}
            <div className="relative w-24 h-24">
              {/* Outer rotating ring */}
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600"
                style={{
                  animation: "spin 3s linear infinite",
                }}
              />
              {/* Middle rotating ring (opposite direction) */}
              <div
                className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 border-l-pink-500"
                style={{
                  animation: "spin 2s linear reverse infinite",
                }}
              />
              {/* Inner pulsing circle */}
              <div
                className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Generating AI summary...
            </p>
            <style>{`
              @keyframes spin {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        )}

        {error && (
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                Please make sure the API key is valid and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {summary && !isLoading && (
          <Card
            className={`border-l-4 border-l-blue-600 ${
              currentTheme === "dark"
                ? "bg-gradient-to-br from-gray-900 to-gray-800"
                : "bg-gradient-to-br from-blue-50 to-gray-50"
            }`}
          >
            <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  color:
                    currentTheme === "dark"
                      ? "rgb(229, 231, 235)"
                      : "rgb(31, 41, 55)",
                }}
              >
                {summary}
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !summary && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No summary generated yet</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {summary ? "Close" : "Cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
