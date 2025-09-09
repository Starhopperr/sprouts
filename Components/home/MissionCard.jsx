
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Star, 
  CheckCircle, 
  Play, 
  RotateCcw,
  Target
} from "lucide-react";

const CATEGORY_COLORS = {
  soil_health: "bg-amber-100 text-amber-800 border-amber-200",
  water_management: "bg-blue-100 text-blue-800 border-blue-200", 
  pest_control: "bg-red-100 text-red-800 border-red-200",
  crop_rotation: "bg-green-100 text-green-800 border-green-200",
  organic_farming: "bg-emerald-100 text-emerald-800 border-emerald-200",
  post_harvest: "bg-purple-100 text-purple-800 border-purple-200",
  marketing: "bg-pink-100 text-pink-800 border-pink-200"
};

const CATEGORY_NAMES = {
  soil_health: "Soil Health",
  water_management: "Water Management",
  pest_control: "Pest Control", 
  crop_rotation: "Crop Rotation",
  organic_farming: "Organic Farming",
  post_harvest: "Post-Harvest",
  marketing: "Marketing"
};

export default function MissionCard({ mission, progress, onStart }) {
  const getStatusInfo = () => {
    if (!progress) {
      return {
        status: "not_started",
        buttonText: "Start",
        icon: Play,
        disabled: false
      };
    }

    switch (progress.status) {
      case "completed":
        return {
          status: "completed", 
          buttonText: "Completed",
          icon: CheckCircle,
          disabled: true
        };
      case "in_progress":
        return {
          status: "in_progress",
          buttonText: "Continue", 
          icon: RotateCcw,
          disabled: false
        };
      default:
        return {
          status: "not_started",
          buttonText: "Start",
          icon: Play, 
          disabled: false
        };
    }
  };

  const statusInfo = getStatusInfo();
  const completionPercent = progress 
    ? Math.round((progress.current_card_index / (mission.content_cards?.length || 1)) * 100)
    : 0;

  return (
    <Card className={`border-none shadow-md hover:shadow-lg transition-all ${
      statusInfo.status === "completed" ? "bg-green-50" : "bg-white"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 leading-tight mb-1">
              {mission.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {mission.description}
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary"
                className={`text-xs border ${CATEGORY_COLORS[mission.category] || "bg-gray-100 text-gray-800"}`}
              >
                {CATEGORY_NAMES[mission.category] || mission.category}
              </Badge>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{mission.estimated_duration || 5} min</span>
              </div>
            </div>

            {/* Progress Bar for In Progress */}
            {statusInfo.status === "in_progress" && (
              <div className="mb-2">
                <Progress value={completionPercent} className="h-1 mb-1" />
                <p className="text-xs text-gray-500">{completionPercent}% complete</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 ml-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {mission.xp_reward}
            </span>
          </div>
        </div>

        <Button 
          onClick={onStart}
          disabled={statusInfo.disabled}
          className={`w-full text-sm ${
            statusInfo.status === "completed" 
              ? "bg-green-600 hover:bg-green-700" 
              : statusInfo.status === "in_progress"
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <statusInfo.icon className="w-4 h-4 mr-2" />
          {statusInfo.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
