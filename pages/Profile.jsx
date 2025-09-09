
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { UserProgress } from "@/entities/UserProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User as UserIcon,
  MapPin,
  Wheat,
  Award,
  Flame,
  Star,
  TrendingUp,
  Calendar,
  Target,
  Leaf,
  Edit,
  LogOut
} from "lucide-react";

import BadgeShowcase from "../components/profile/BadgeShowcase";
import StatCard from "../components/profile/StatCard";
import ActivityCalendar from "../components/profile/ActivityCalendar";

const BADGE_INFO = {
  welcome_farmer: {
    name: "Welcome Farmer",
    icon: "🌱",
    description: "For joining FarmQuest",
    color: "bg-green-100 text-green-800"
  },
  first_mission: {
    name: "First Mission",
    icon: "🎯",
    description: "For completing your first mission",
    color: "bg-blue-100 text-blue-800"
  },
  streak_5: {
    name: "5 Day Streak",
    icon: "🔥",
    description: "For being active 5 days in a row",
    color: "bg-orange-100 text-orange-800"
  },
  eco_warrior: {
    name: "Eco Warrior",
    icon: "🌿",
    description: "For reaching 50+ sustainability score",
    color: "bg-emerald-100 text-emerald-800"
  },
  quiz_master: {
    name: "Quiz Master", 
    icon: "🧠",
    description: "For acing 10 quizzes",
    color: "bg-purple-100 text-purple-800"
  }
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const progressData = await UserProgress.filter({ user_id: currentUser.id });
      setUserProgress(progressData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletedMissions = () => {
    return userProgress.filter(p => p.status === "completed").length;
  };

  const getTotalXP = () => {
    return userProgress
      .filter(p => p.status === "completed")
      .reduce((total, p) => total + (p.xp_earned || 0), 0);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-6">
      {/* Profile Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.full_name}</h2>
              <div className="flex items-center gap-1 text-green-100 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{user?.village}, {user?.district}</span>
              </div>
              <div className="flex items-center gap-1 text-green-100 mt-1">
                <Wheat className="w-4 h-4" />
                <span className="text-sm">
                  {user?.farm_size} {user?.farm_size_unit}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Edit className="w-5 h-5" />
            </Button>
          </div>

          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Level {user?.current_level || 1}</span>
              <span className="text-sm">
                {((user?.total_xp || 0) % 100)} / 100 XP
              </span>
            </div>
            <Progress 
              value={((user?.total_xp || 0) % 100)} 
              className="h-2 bg-green-400/20" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Target}
          label="Missions Completed"
          value={getCompletedMissions()}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${user?.current_streak || 0} days`}
          color="text-orange-500"
          bgColor="bg-orange-50"
        />
        <StatCard
          icon={Star}
          label="Total XP"
          value={user?.total_xp || 0}
          color="text-yellow-500"
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={Leaf}
          label="Sustainability Score"
          value={user?.sustainability_score || 0}
          color="text-green-500"
          bgColor="bg-green-50"
        />
      </div>

      {/* Badges Section */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-purple-600" />
            Badges Earned
            <Badge variant="secondary" className="ml-auto">
              {user?.badges_earned?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeShowcase badges={user?.badges_earned || []} badgeInfo={BADGE_INFO} />
        </CardContent>
      </Card>

      {/* Primary Crops */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wheat className="w-5 h-5 text-amber-600" />
            Primary Crops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user?.primary_crops?.map((crop, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-amber-100 text-amber-800 border-amber-200"
              >
                {crop}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Calendar */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-green-600" />
            Activity Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityCalendar userProgress={userProgress} />
        </CardContent>
      </Card>

      {/* Achievement Summary */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-800 mb-1">Achievement Summary</h3>
          <p className="text-sm text-purple-600">
            You've completed {getCompletedMissions()} missions and earned {user?.total_xp || 0} XP!
          </p>
          {user?.longest_streak > 0 && (
            <p className="text-xs text-purple-500 mt-2">
              🏆 Longest Streak: {user.longest_streak} days
            </p>
          )}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Log Out
      </Button>
    </div>
  );
}
