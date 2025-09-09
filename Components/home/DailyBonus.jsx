
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Flame, Star } from "lucide-react";

export default function DailyBonus({ onClaim, streak }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm border-none shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Daily Bonus!
          </h3>
          
          <p className="text-gray-600 mb-4">
            Thanks for coming back!
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-600">
                {streak} Day Streak!
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-yellow-600">
                +10 XP earned!
              </span>
            </div>
          </div>

          <Button 
            onClick={onClaim}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            Claim Bonus!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
