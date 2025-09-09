
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  Square, 
  Play,
  BookOpen,
  HelpCircle,
  Camera,
  Image as ImageIcon
} from "lucide-react";

export default function MissionCard({ card, onQuizAnswer, selectedAnswer }) {
  const renderCardContent = () => {
    switch (card.type) {
      case "text":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Information
              </Badge>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed text-base">
                {card.content}
              </p>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-5 h-5 text-green-500" />
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                Image
              </Badge>
            </div>
            {card.image_url && (
              <img 
                src={card.image_url} 
                alt={card.title}
                className="w-full rounded-lg shadow-md max-h-48 object-cover"
              />
            )}
            <p className="text-gray-700 text-base">{card.content}</p>
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Play className="w-5 h-5 text-purple-500" />
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                Video
              </Badge>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Video Player (Coming Soon)</p>
            </div>
            <p className="text-gray-700 text-base">{card.content}</p>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                Question
              </Badge>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              {card.content}
            </h3>
            <div className="space-y-3">
              {card.quiz_options?.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className={`w-full p-4 h-auto text-left justify-start ${
                    selectedAnswer === index 
                      ? "bg-green-600 hover:bg-green-700 border-green-600" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onQuizAnswer(index)}
                >
                  <div className="flex items-center gap-3">
                    {selectedAnswer === index ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                    <span className="flex-1">{option}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case "checklist":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-5 h-5 text-teal-500" />
              <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700">
                Checklist
              </Badge>
            </div>
            <p className="text-gray-700 text-base mb-4">{card.content}</p>
            <div className="bg-teal-50 rounded-lg p-4">
              <p className="text-teal-800 text-sm font-medium">
                ✓ Make sure you've followed all the steps
              </p>
            </div>
          </div>
        );

      case "photo_proof":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-pink-500" />
              <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                Photo Proof
              </Badge>
            </div>
            <p className="text-gray-700 text-base">{card.content}</p>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <Camera className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-pink-800 font-medium">
                Take a photo of your work
              </p>
              <p className="text-pink-600 text-sm mt-1">
                Uploading a photo is required to complete the mission
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Unknown card type</p>
          </div>
        );
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900">
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderCardContent()}
      </CardContent>
    </Card>
  );
}
