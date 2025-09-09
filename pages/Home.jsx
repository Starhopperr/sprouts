
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Mission } from "@/entities/Mission";
import { UserProgress } from "@/entities/UserProgress";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Star, 
  Target, 
  Calendar,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  Sun,
  Leaf
} from "lucide-react";

import UserStatsCard from "../components/home/UserStatsCard";
import MissionCard from "../components/home/MissionCard";
import StreakCounter from "../components/home/StreakCounter";
import DailyBonus from "../components/home/DailyBonus";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [todayMissions, setTodayMissions] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDailyBonus, setShowDailyBonus] = useState(false);

  const getPreviousDay = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const loadUserAndMissions = useCallback(async () => {
    try {
      const currentUser = await User.me();
      
      if (!currentUser.onboarding_completed) {
        navigate(createPageUrl("Onboarding"));
        return;
      }

      setUser(currentUser);
      
      // Check for daily bonus
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = currentUser.last_activity_date;
      
      if (lastActivity !== today) {
        setShowDailyBonus(true);
        // Update streak and last activity
        const newStreak = lastActivity === getPreviousDay(today) 
          ? (currentUser.current_streak || 0) + 1 
          : 1;
        
        await User.updateMyUserData({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, currentUser.longest_streak || 0),
          last_activity_date: today,
          total_xp: (currentUser.total_xp || 0) + 10 // Daily login bonus
        });
      }

      // Load personalized missions
      const allMissions = await Mission.filter({ is_active: true });
      const userCrops = currentUser.primary_crops || [];
      
      // Filter missions based on user's crops and get progress
      const personalizedMissions = allMissions.filter(mission => {
        if (mission.target_crops && mission.target_crops.length > 0) {
          return mission.target_crops.some(crop => 
            userCrops.some(userCrop => userCrop.toLowerCase().includes(crop.toLowerCase()))
          );
        }
        return true;
      });

      const progressData = await UserProgress.filter({ user_id: currentUser.id });
      setUserProgress(progressData);
      
      // Get today's recommended missions (limit to 3-5)
      setTodayMissions(personalizedMissions.slice(0, 5));
      
    } catch (error) {
      console.error("Error loading user data:", error);
      navigate(createPageUrl("Onboarding"));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUserAndMissions();
  }, [loadUserAndMissions]);

  const getMissionProgress = (missionId) => {
    return userProgress.find(p => p.mission_id === missionId);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleClaimBonus = async () => {
    setShowDailyBonus(false);
    // Bonus already added in loadUserAndMissions
    window.location.reload(); // Refresh to show updated stats
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
    <div className="p-4 max-w-md mx-auto space-y-6">
      {/* Daily Bonus Modal */}
      {showDailyBonus && (
        <DailyBonus 
          onClaim={handleClaimBonus}
          streak={user?.current_streak || 1}
        />
      )}

      {/* User Greeting */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {getGreeting()}, {user?.full_name?.split(' ')[0]}!
            </h2>
            <p className="text-green-100 mt-1">
              Let's learn something new today 🌱
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-300">
              <Sun className="w-5 h-5" />
              <span className="font-bold">Level {user?.current_level || 1}</span>
            </div>
            <p className="text-green-100 text-sm">{user?.total_xp || 0} XP</p>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-green-100 mb-1">
            <span>To next level</span>
            <span>{((user?.total_xp || 0) % 100)} / 100 XP</span>
          </div>
          <Progress value={((user?.total_xp || 0) % 100)} className="h-2 bg-green-400/20" />
        </div>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <UserStatsCard
          icon={Flame}
          label="Streak"
          value={`${user?.current_streak || 0} days`}
          color="text-orange-500"
          bgColor="bg-orange-50"
        />
        <UserStatsCard
          icon={Award}
          label="Badges"
          value={user?.badges_earned?.length || 0}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
        <UserStatsCard
          icon={Leaf}
          label="Score"
          value={user?.sustainability_score || 0}
          color="text-green-500"
          bgColor="bg-green-50"
        />
      </div>

      {/* Today's Missions */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-green-600" />
            Today's Missions
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
              {todayMissions.length} available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayMissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No new missions available</p>
              <p className="text-sm mt-1">Check back tomorrow!</p>
            </div>
          ) : (
            todayMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                progress={getMissionProgress(mission.id)}
                onStart={() => navigate(createPageUrl(`Mission?id=${mission.id}`))}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-none bg-gradient-to-br from-blue-50 to-blue-100"
          onClick={() => navigate(createPageUrl("Leaderboard"))}
        >
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-blue-800">Leaderboard</p>
            <p className="text-xs text-blue-600 mt-1">See your rank</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-none bg-gradient-to-br from-purple-50 to-purple-100"
          onClick={() => navigate(createPageUrl("Profile"))}
        >
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-semibold text-purple-800">Profile</p>
            <p className="text-xs text-purple-600 mt-1">View your badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Weekly Goal</span>
            </div>
            <span className="text-sm text-orange-600">3/7 missions</span>
          </div>
          <Progress value={43} className="h-2 mb-2" />
          <p className="text-xs text-orange-600">
            Complete 4 more missions this week!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
