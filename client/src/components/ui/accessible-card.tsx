import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Clock, Eye, Users } from "lucide-react";
import { ResponsiveImage } from "./responsive-image";

interface AccessibleCardProps {
  id: number;
  title: string;
  description: string;
  location: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  completionPercentage: number;
  totalItems: number;
  imageUrl?: string;
  viewCount?: number;
  className?: string;
  onClick?: () => void;
}

const urgencyColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", 
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const urgencyLabels = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority", 
  urgent: "Urgent"
};

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  id,
  title,
  description,
  location,
  urgencyLevel,
  completionPercentage,
  totalItems,
  imageUrl,
  viewCount,
  className = '',
  onClick
}) => {
  const fulfilledItems = Math.floor((completionPercentage / 100) * totalItems);
  const remainingItems = totalItems - fulfilledItems;

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-coral-500 focus-within:ring-offset-2 ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-labelledby={`card-title-${id}`}
      aria-describedby={`card-description-${id} card-progress-${id} card-location-${id}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardContent className="p-0">
        {/* Image Section with improved accessibility */}
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <ResponsiveImage
              src={imageUrl}
              alt={`Support needed: ${title} in ${location}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Urgency Badge */}
            <div className="absolute top-3 left-3">
              <Badge 
                className={urgencyColors[urgencyLevel]}
                aria-label={`Priority level: ${urgencyLabels[urgencyLevel]}`}
              >
                {urgencyLabels[urgencyLevel]}
              </Badge>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title and Location */}
          <div className="space-y-2">
            <h3 
              id={`card-title-${id}`}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-coral-600 transition-colors line-clamp-2"
            >
              {title}
            </h3>
            
            <div 
              id={`card-location-${id}`}
              className="flex items-center text-gray-600 dark:text-gray-400"
              aria-label={`Location: ${location}`}
            >
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm truncate">{location}</span>
            </div>
          </div>

          {/* Description */}
          <p 
            id={`card-description-${id}`}
            className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed"
          >
            {description}
          </p>

          {/* Progress Section */}
          <div id={`card-progress-${id}`} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Progress: {fulfilledItems} of {totalItems} items
              </span>
              <span 
                className="font-medium text-coral-600 dark:text-coral-400"
                aria-label={`${completionPercentage}% complete`}
              >
                {completionPercentage}%
              </span>
            </div>
            
            <Progress 
              value={completionPercentage} 
              className="h-2"
              aria-label={`${completionPercentage}% of items fulfilled, ${remainingItems} items remaining`}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {viewCount && (
                <div className="flex items-center" aria-label={`${viewCount} views`}>
                  <Eye className="h-3 w-3 mr-1" aria-hidden="true" />
                  <span>{viewCount}</span>
                </div>
              )}
              
              <div className="flex items-center" aria-label={`${remainingItems} items still needed`}>
                <Users className="h-3 w-3 mr-1" aria-hidden="true" />
                <span>{remainingItems} needed</span>
              </div>
            </div>

            <div className="text-xs text-gray-400 dark:text-gray-500" aria-hidden="true">
              <Clock className="h-3 w-3 inline mr-1" />
              View Details
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};