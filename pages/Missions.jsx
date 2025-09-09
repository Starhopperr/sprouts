
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Mission as MissionEntity } from "@/entities/Mission";
import { UserProgress } from "@/entities/UserProgress";
import { User } from "@/entities/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Camera, 
  X,
  Star,
  Trophy
} from "lucide-react";

import MissionCard from "../components/mission/MissionCard";
import PhotoProofModal from "../components/mission/PhotoProofModal";
import CompletionModal from "../components/mission/CompletionModal";

export default function Mission() {
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMission = useCallback(async (missionId) => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const missionData = await MissionEntity.get(missionId);
      setMission(missionData);

      // Get or create user progress
      const existingProgress = await UserProgress.filter({ 
        user_id: currentUser.id, 
        mission_id: missionId 
      });

      if (existingProgress.length > 0) {
        const prog = existingProgress[0];
        setProgress(prog);
        setCurrentCardIndex(prog.current_card_index || 0);
        setQuizAnswers(prog.quiz_answers || []);
      } else {
        const newProgress = await UserProgress.create({
          user_id: currentUser.id,
          mission_id: missionId,
          status: "in_progress",
          current_card_index: 0,
          quiz_answers: []
        });
        setProgress(newProgress);
      }
    } catch (error) {
      console.error("Error loading mission:", error);
      navigate(createPageUrl("Home"));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const missionId = urlParams.get('id');
    if (missionId) {
      loadMission(missionId);
    }
  }, [loadMission]);

  const updateProgress = async (updates) => {
    if (!progress) return;
    
    const updatedProgress = await UserProgress.update(progress.id, updates);
    setProgress(updatedProgress);
  };

  const handleNext = async () => {
    const currentCard = mission.content_cards[currentCardIndex];
    
    if (currentCard.type === "quiz") {
      // Validate quiz answer
      if (quizAnswers[currentCardIndex] === undefined) {
        alert("Please select an option");
        return;
      }
    }

    if (currentCardIndex < mission.content_cards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      await updateProgress({ 
        current_card_index: nextIndex,
        quiz_answers: quizAnswers
      });
    } else {
      // Mission completed - check if photo proof needed
      const hasPhotoCard = mission.content_cards.some(card => card.type === "photo_proof");
      if (hasPhotoCard && !progress.photo_proof_url) {
        setShowPhotoModal(true);
      } else {
        await completeMission();
      }
    }
  };

  const handlePrevious = async () => {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      setCurrentCardIndex(prevIndex);
      await updateProgress({ 
        current_card_index: prevIndex,
        quiz_answers: quizAnswers
      });
    }
  };

  const handleQuizAnswer = (answerIndex) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentCardIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handlePhotoSubmit = async (photoUrl) => {
    await updateProgress({ photo_proof_url: photoUrl });
    setShowPhotoModal(false);
    await completeMission();
  };

  const completeMission = async () => {
    try {
      // Update progress to completed
      await updateProgress({ 
        status: "completed",
        completed_at: new Date().toISOString(),
        xp_earned: mission.xp_reward
      });

      // Update user XP and stats
      const newXP = (user.total_xp || 0) + mission.xp_reward;
      const newLevel = Math.floor(newXP / 100) + 1;
      const newSustainabilityScore = (user.sustainability_score || 0) + 5;

      await User.updateMyUserData({
        total_xp: newXP,
        current_level: newLevel,
        sustainability_score: newSustainabilityScore
      });

      setShowCompletionModal(true);
    } catch (error) {
      console.error("Error completing mission:", error);
    }
  };

  const handleCompletionClose = () => {
    setShowCompletionModal(false);
    navigate(createPageUrl("Home"));
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <p>Mission not found</p>
        <Button onClick={() => navigate(createPageUrl("Home"))}>
          Back to Home
        </Button>
      </div>
    );
  }

  const currentCard = mission.content_cards[currentCardIndex];
  const progressPercent = ((currentCardIndex + 1) / mission.content_cards.length) * 100;

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Home"))}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-gray-900 leading-tight">
            {mission.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progressPercent} className="flex-1 h-2" />
            <span className="text-sm text-gray-600">
              {currentCardIndex + 1}/{mission.content_cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Mission Card */}
      <div className="mb-6">
        <MissionCard
          card={currentCard}
          onQuizAnswer={handleQuizAnswer}
          selectedAnswer={quizAnswers[currentCardIndex]}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {currentCardIndex === mission.content_cards.length - 1 ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* XP Indicator */}
      <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
        <Star className="w-4 h-4" />
        +{mission.xp_reward} XP
      </div>

      {/* Photo Proof Modal */}
      {showPhotoModal && (
        <PhotoProofModal
          onSubmit={handlePhotoSubmit}
          onClose={() => setShowPhotoModal(false)}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <CompletionModal
          mission={mission}
          xpEarned={mission.xp_reward}
          onClose={handleCompletionClose}
        />
      )}
    </div>
  );
}
