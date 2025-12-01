import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DietMeal, MEAL_TYPE_LABELS } from '@/types/diet';
import { ChevronDown, Flame, Beef, Wheat, Droplet, RefreshCw, Coffee, Sun, Moon, Cookie } from 'lucide-react';

interface MealCardProps {
  meal: DietMeal;
  onReplace: () => void;
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

export function MealCard({ meal, onReplace }: MealCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const MealIcon = mealIcons[meal.mealType];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <div className="mt-1">
              <MealIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {MEAL_TYPE_LABELS[meal.mealType]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  {meal.calories} kcal
                </Badge>
              </div>
              <CardTitle className="text-base leading-tight">{meal.titleTr}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {meal.descriptionTr}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Beef className="h-4 w-4 text-red-500" />
            <span className="font-medium">{meal.protein}g</span>
          </div>
          <div className="flex items-center gap-1">
            <Wheat className="h-4 w-4 text-amber-500" />
            <span className="font-medium">{meal.carbs}g</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplet className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{meal.fat}g</span>
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <span>Tarifi Göster</span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <Button
              variant="outline"
              size="sm"
              onClick={onReplace}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Değiştir
            </Button>
          </div>

          <CollapsibleContent className="mt-3">
            <Separator className="mb-3" />
            <div className="text-sm space-y-2">
              <h4 className="font-semibold">Tarif:</h4>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {meal.instructions}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
