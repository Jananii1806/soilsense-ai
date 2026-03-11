import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { PLANT_CLASSES, PLANT_INFO } from "../soil-dataset";
import type { PlantClass } from "../soil-dataset";

export default function HistoryTab() {
  const { identity, login } = useInternetIdentity();
  const { actor } = useActor();
  const qc = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnalysisHistory();
    },
    enabled: !!actor && !!identity,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      await actor!.deleteAnalysis(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["history"] });
      toast.success("Record deleted.");
    },
    onError: () => toast.error("Failed to delete."),
  });

  if (!identity) {
    return (
      <Card className="text-center p-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold mb-2">Login Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You need to login to view and save your analysis history.
        </p>
        <Button onClick={login}>Login with Internet Identity</Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div
        data-ocid="history.list"
        className="flex items-center justify-center py-20"
      >
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <Card data-ocid="history.list" className="text-center p-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">No History Yet</h3>
        <p className="text-sm text-muted-foreground">
          Run a soil analysis and save it to see your history here.
        </p>
      </Card>
    );
  }

  return (
    <div data-ocid="history.list" className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {records.length} saved analyses
      </p>
      {records.map((rec, i) => {
        const plant = PLANT_CLASSES.includes(rec.recommendedPlant as PlantClass)
          ? (rec.recommendedPlant as PlantClass)
          : null;
        const info = plant ? PLANT_INFO[plant] : null;
        const date = new Date(
          Number(rec.timestamp) / 1_000_000,
        ).toLocaleDateString();

        return (
          <Card key={String(rec.id)} data-ocid={`history.item.${i + 1}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{info?.emoji ?? "🌳"}</span>
                  <div>
                    <h4 className="font-semibold">{rec.recommendedPlant}</h4>
                    <p className="text-xs text-muted-foreground">
                      {info?.specialty}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {String(rec.remediationCycles)} cycles
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {(rec.confidenceScore * 100).toFixed(1)}% confidence
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        pH {rec.parameters.pH}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">{date}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(rec.id)}
                    disabled={deleteMutation.isPending}
                    data-ocid={`history.delete_button.${i + 1}`}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t">
                {[
                  ["Pb", rec.parameters.leadPPM],
                  ["Cd", rec.parameters.cadmiumPPM],
                  ["As", rec.parameters.arsenicPPM],
                  ["Ni", rec.parameters.nickelPPM],
                  ["Cr", rec.parameters.chromiumPPM],
                ].map(([label, val]) => (
                  <div key={label as string} className="text-center">
                    <div className="text-xs font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">
                      {val} ppm
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
