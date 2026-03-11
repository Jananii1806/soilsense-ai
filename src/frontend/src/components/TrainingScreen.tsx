import { Progress } from "@/components/ui/progress";
import type { TrainingMetrics } from "../neural-network";

interface Props {
  progress: number;
  stage: string;
  currentMetrics: TrainingMetrics | null;
}

export default function TrainingScreen({
  progress,
  stage,
  currentMetrics,
}: Props) {
  return (
    <div
      data-ocid="training.loading_state"
      className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-8"
    >
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sidebar-accent mb-4">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-sidebar-foreground">
            SoilSense AI
          </h1>
          <p className="text-sidebar-foreground/60 mt-1">
            Neural Network Phytoremediation Analyzer
          </p>
        </div>

        {/* Progress */}
        <div className="bg-sidebar-accent rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-sidebar-foreground/80">
              Training Progress
            </span>
            <span className="text-sm font-bold text-sidebar-primary">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-3 mb-4" />
          <p className="text-sm text-sidebar-foreground/70 font-mono">
            {stage}
          </p>
        </div>

        {/* Live metrics */}
        {currentMetrics && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sidebar-accent rounded-lg p-4 text-center">
              <div className="text-xs text-sidebar-foreground/50 mb-1">
                Epoch
              </div>
              <div className="text-xl font-bold text-sidebar-foreground">
                {currentMetrics.epoch}
              </div>
            </div>
            <div className="bg-sidebar-accent rounded-lg p-4 text-center">
              <div className="text-xs text-sidebar-foreground/50 mb-1">
                Loss
              </div>
              <div className="text-xl font-bold text-sidebar-primary">
                {currentMetrics.loss.toFixed(3)}
              </div>
            </div>
            <div className="bg-sidebar-accent rounded-lg p-4 text-center">
              <div className="text-xs text-sidebar-foreground/50 mb-1">
                Accuracy
              </div>
              <div className="text-xl font-bold text-sidebar-primary">
                {(currentMetrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Architecture */}
        <div className="mt-6 text-center">
          <p className="text-xs text-sidebar-foreground/40">
            Architecture: Input(10) → Dense(32, ReLU) → Dense(16, ReLU) →
            Softmax(7)
          </p>
        </div>
      </div>
    </div>
  );
}
