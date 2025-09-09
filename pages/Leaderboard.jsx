
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { UserProgress } from "@/entities/UserProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Award,
  Crown,
  Star,
  TrendingUp,
  Users,
  MapPin
} from "lucide-react";

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Get all users who have completed onboarding
      const users = await User.list();
      const activeUsers = users.filter(u => u.onboarding_completed);
      
      setAllUsers(activeUsers);

      // Get progress for all users
      const allProgress = await UserProgress.list();

      // Calculate stats for each user
      const userStats = activeUsers.map(user => {
        const userProgressData = allProgress.filter(p => p.user_id === user.id);
        const completedMissions = userProgressData.filter(p => p.status === "completed");
        
        return {
          ...user,
          completed_missions: completedMissions.length,
          total_xp: user.total_xp || 0,
          sustainability_score: user.sustainability_score || 0,
          current_streak: user.current_streak || 0,
          badges_count: user.badges_earned?.length || 0
        };
      });

      // Sort by total XP (primary ranking)
      userStats.sort((a, b) => b.total_xp - a.total_xp);

      setLeaderboardData(userStats);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    if (activeFilter === "village" && currentUser?.village) {
      return leaderboardData.filter(user => user.village === currentUser.village);
    }
    if (activeFilter === "district" && currentUser?.district) {
      return leaderboardData.filter(user => user.district === currentUser.district);
    }
    return leaderboardData;
  };

  const getCurrentUserRank = () => {
    const filtered = getFilteredUsers();
    return filtered.findIndex(user => user.id === currentUser?.id) + 1;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();
  const userRank = getCurrentUserRank();

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
          <p className="text-purple-100">Who are the top farmers?</p>
          
          {userRank > 0 && (
            <div className="mt-4 bg-white/20 rounded-lg p-3">
              <p className="text-sm text-purple-100">Your Current Rank</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                {getRankIcon(userRank)}
                <span className="text-xl font-bold">#{userRank}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-600" />
            Select Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="village" className="text-xs">
                Village
              </TabsTrigger>
              <TabsTrigger value="district" className="text-xs">
                District
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-3 text-center">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {filteredUsers.length} farmers
            </Badge>
            {activeFilter === "village" && currentUser?.village && (
              <p className="text-xs text-gray-600 mt-1">
                📍 {currentUser.village}, {currentUser.district}
              </p>
            )}
            {activeFilter === "district" && currentUser?.district && (
              <p className="text-xs text-gray-600 mt-1">
                📍 {currentUser.district}, {currentUser.state}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard List */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {filteredUsers.slice(0, 20).map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.id === currentUser?.id;
              
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 ${
                    isCurrentUser 
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500" 
                      : "hover:bg-gray-50"
                  } ${rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : ""}`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadgeColor(rank)}`}>
                      {rank <= 3 ? getRankIcon(rank) : <span className="font-bold">#{rank}</span>}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold truncate ${isCurrentUser ? "text-green-800" : "text-gray-900"}`}>
                        {user.full_name}
                        {isCurrentUser && <span className="text-green-600 ml-1">(You)</span>}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{user.village}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-medium">{user.total_xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-medium">{user.completed_missions}</span>
                      </div>
                      {user.current_streak > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">🔥</span>
                          <span className="text-xs font-medium">{user.current_streak}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        isCurrentUser 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      L{user.current_level || 1}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No farmers found in this category</p>
