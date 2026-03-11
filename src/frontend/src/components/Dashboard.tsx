import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { NeuralNetwork, TrainingResult } from "../neural-network";
import AboutTab from "./AboutTab";
import HistoryTab from "./HistoryTab";
import SoilForm from "./SoilForm";

interface Props {
  nn: NeuralNetwork;
  trainingResult: TrainingResult;
}

export default function Dashboard({ nn, trainingResult }: Props) {
  const [activeTab, setActiveTab] = useState("analyze");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <h1 className="text-lg font-bold leading-none">SoilSense AI</h1>
              <p className="text-xs text-sidebar-foreground/60">
                Phytoremediation Analyzer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30 text-xs">
              Train: {(trainingResult.trainAccuracy * 100).toFixed(1)}%
            </Badge>
            <Badge className="bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30 text-xs">
              Test: {(trainingResult.testAccuracy * 100).toFixed(1)}%
            </Badge>
            <Badge
              variant="outline"
              className="text-sidebar-foreground/70 border-sidebar-border text-xs"
            >
              {trainingResult.epochs} epochs
            </Badge>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="analyze" data-ocid="nav.analyze_tab">
              🪧 Analyze Soil
            </TabsTrigger>
            <TabsTrigger value="history" data-ocid="nav.history_tab">
              📊 History
            </TabsTrigger>
            <TabsTrigger value="about" data-ocid="nav.about_tab">
              ℹ️ About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <SoilForm nn={nn} />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>
          <TabsContent value="about">
            <AboutTab trainingResult={trainingResult} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
