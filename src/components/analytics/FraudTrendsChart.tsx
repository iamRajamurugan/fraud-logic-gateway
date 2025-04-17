import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  ReferenceArea,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data
const hourlyData = [
  { date: "2023-09-16 00:00", predicted: 3, reported: 2 },
  { date: "2023-09-16 02:00", predicted: 2, reported: 1 },
  { date: "2023-09-16 04:00", predicted: 1, reported: 0 },
  { date: "2023-09-16 06:00", predicted: 2, reported: 1 },
  { date: "2023-09-16 08:00", predicted: 4, reported: 3 },
  { date: "2023-09-16 10:00", predicted: 7, reported: 5 },
  { date: "2023-09-16 12:00", predicted: 8, reported: 6 },
  { date: "2023-09-16 14:00", predicted: 6, reported: 4 },
  { date: "2023-09-16 16:00", predicted: 9, reported: 7 },
  { date: "2023-09-16 18:00", predicted: 5, reported: 4 },
  { date: "2023-09-16 20:00", predicted: 4, reported: 3 },
  { date: "2023-09-16 22:00", predicted: 3, reported: 2 },
];

const dailyData = [
  { date: "2023-09-10", predicted: 18, reported: 12 },
  { date: "2023-09-11", predicted: 15, reported: 10 },
  { date: "2023-09-12", predicted: 22, reported: 16 },
  { date: "2023-09-13", predicted: 17, reported: 12 },
  { date: "2023-09-14", predicted: 24, reported: 19 },
  { date: "2023-09-15", predicted: 21, reported: 15 },
  { date: "2023-09-16", predicted: 19, reported: 14 },
];

const weeklyData = [
  { date: "Week 36", predicted: 98, reported: 78 },
  { date: "Week 37", predicted: 112, reported: 92 },
  { date: "Week 38", predicted: 103, reported: 85 },
  { date: "Week 39", predicted: 118, reported: 97 },
  { date: "Week 40", predicted: 124, reported: 104 },
  { date: "Week 41", predicted: 115, reported: 92 },
  { date: "Week 42", predicted: 128, reported: 109 },
];

const monthlyData = [
  { date: "May 2023", predicted: 387, reported: 312 },
  { date: "Jun 2023", predicted: 412, reported: 346 },
  { date: "Jul 2023", predicted: 398, reported: 325 },
  { date: "Aug 2023", predicted: 427, reported: 352 },
  { date: "Sep 2023", predicted: 456, reported: 379 },
  { date: "Oct 2023", predicted: 429, reported: 361 },
];

export function FraudTrendsChart() {
  const [timeRange, setTimeRange] = useState<"hourly" | "daily" | "weekly" | "monthly">("daily");
  const [zoomMode, setZoomMode] = useState<boolean>(false);
  const [zoomArea, setZoomArea] = useState<{ x1: string | number | null; x2: string | number | null }>({ 
    x1: null, 
    x2: null 
  });

  const getData = () => {
    switch (timeRange) {
      case "hourly":
        return hourlyData.map(item => ({
          ...item,
          formattedDate: format(new Date(item.date), "HH:mm")
        }));
      case "daily":
        return dailyData.map(item => ({
          ...item,
          formattedDate: format(new Date(item.date), "MMM dd")
        }));
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      default:
        return dailyData;
    }
  };

  const formatXAxis = (tickItem: string) => {
    if (timeRange === "hourly") {
      return format(new Date(tickItem), "HH:mm");
    } else if (timeRange === "daily") {
      return format(new Date(tickItem), "MMM dd");
    }
    return tickItem;
  };

  const getXAxisLabel = () => {
    switch (timeRange) {
      case "hourly":
        return "Hour";
      case "daily":
        return "Day";
      case "weekly":
        return "Week";
      case "monthly":
        return "Month";
    }
  };

  const chartConfig = {
    predicted: {
      label: "Predicted Frauds",
      theme: {
        light: "#1A49A5",
        dark: "#3A69C5",
      },
    },
    reported: {
      label: "Reported Frauds",
      theme: {
        light: "#F38C26",
        dark: "#F5A54F",
      },
    },
  };

  const handleZoom = (data: any, startIndex?: number, endIndex?: number) => {
    if (!data || !startIndex || !endIndex) return;
    
    const items = data.activePayload;
    if (!items || items.length === 0) return;
    
    setZoomArea({
      x1: items[0].payload.date,
      x2: items[items.length - 1].payload.date
    });
  };
  
  const handleZoomOut = () => {
    setZoomArea({ x1: null, x2: null });
    setZoomMode(false);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Fraud Trends Over Time</CardTitle>
            <CardDescription>
              Visualizing predicted vs reported frauds over time
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {zoomMode && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomOut}
                className="flex items-center gap-1"
              >
                <ZoomOut className="h-4 w-4" />
                Reset Zoom
              </Button>
            )}
            <Button 
              variant={zoomMode ? "default" : "outline"} 
              size="sm" 
              onClick={() => setZoomMode(!zoomMode)}
              className={cn(
                "flex items-center gap-1",
                zoomMode ? "bg-brand-blue hover:bg-brand-blue-light" : ""
              )}
            >
              <ZoomIn className="h-4 w-4" />
              {zoomMode ? "Zooming" : "Zoom"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <Tabs
            defaultValue="daily"
            value={timeRange}
            onValueChange={(value) => {
              setTimeRange(value as "hourly" | "daily" | "weekly" | "monthly");
              handleZoomOut(); // Reset zoom when changing time range
            }}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="hourly" className="text-xs sm:text-sm">Hourly</TabsTrigger>
                <TabsTrigger value="daily" className="text-xs sm:text-sm">Daily</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs sm:text-sm">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly</TabsTrigger>
              </TabsList>
              
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Refresh Data</span>
              </Button>
            </div>
          </Tabs>
          
          <div className="h-[350px] w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getData()}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                  onMouseDown={(e) => zoomMode && e && setZoomArea({ ...zoomArea, x1: e.activeLabel })}
                  onMouseMove={(e) => zoomMode && e && zoomArea.x1 && setZoomArea({ ...zoomArea, x2: e.activeLabel })}
                  onMouseUp={() => zoomMode && zoomArea.x1 && zoomArea.x2 && handleZoom(zoomArea, 0, 1)}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey={timeRange === "weekly" || timeRange === "monthly" ? "date" : "date"} 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    tickFormatter={formatXAxis}
                    axisLine={{ stroke: '#E2E8F0' }}
                    padding={{ left: 10, right: 10 }}
                  >
                    <Label
                      value={getXAxisLabel()}
                      offset={-15}
                      position="insideBottom"
                      style={{ textAnchor: 'middle', fontSize: '12px', fill: 'var(--muted-foreground)' }}
                    />
                  </XAxis>
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    axisLine={{ stroke: '#E2E8F0' }}
                    padding={{ top: 10, bottom: 10 }}
                  >
                    <Label
                      value="Number of Frauds"
                      angle={-90}
                      position="insideLeft"
                      style={{ textAnchor: 'middle', fontSize: '12px', fill: 'var(--muted-foreground)' }}
                    />
                  </YAxis>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="predicted"
                    stroke="var(--color-predicted)"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6, strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    name="reported"
                    stroke="var(--color-reported)"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6, strokeWidth: 1 }}
                  />
                  {zoomMode && zoomArea.x1 && zoomArea.x2 && (
                    <ReferenceArea
                      x1={zoomArea.x1}
                      x2={zoomArea.x2}
                      strokeOpacity={0.3}
                      fill="#1A49A5"
                      fillOpacity={0.1}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
