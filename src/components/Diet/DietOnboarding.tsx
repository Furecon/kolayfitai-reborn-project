import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  DietProfile,
  Gender,
  WeightGoal,
  ActivityLevel,
  DietType,
  Allergen,
  ALLERGEN_LABELS,
  DIET_TYPE_LABELS,
  ACTIVITY_LEVEL_LABELS,
  GOAL_LABELS,
} from '@/types/diet';

interface DietOnboardingProps {
  onComplete: (profile: DietProfile) => void;
  onSkip: () => void;
  initialData?: DietProfile;
}

export function DietOnboarding({ onComplete, onSkip, initialData }: DietOnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [profile, setProfile] = useState<DietProfile>(initialData || {
    age: undefined,
    gender: undefined,
    height_cm: undefined,
    weight_kg: undefined,
    goal: undefined,
    activity_level: undefined,
    diet_type: 'normal',
    allergens: [],
    disliked_foods: '',
    preferred_cuisines: '',
  });

  const updateProfile = (updates: Partial<DietProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const toggleAllergen = (allergen: Allergen) => {
    const allergens = profile.allergens || [];
    const newAllergens = allergens.includes(allergen)
      ? allergens.filter((a) => a !== allergen)
      : [...allergens, allergen];
    updateProfile({ allergens: newAllergens });
  };

  const canProceed = () => {
    if (step === 1) {
      return profile.age && profile.gender && profile.height_cm && profile.weight_kg && profile.goal && profile.activity_level;
    }
    if (step === 2) {
      return profile.diet_type;
    }
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col">
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-4 pt-safe border-b bg-background">
        <h1 className="text-lg font-semibold">Diyet Profili Oluştur</h1>
        <Button variant="ghost" size="icon" onClick={onSkip}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress */}
      <div className="flex-none px-4 py-2 bg-background border-b">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Adım {step}/{totalSteps}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>
                  Sana özel bir diyet planı oluşturmak için bazı bilgilere ihtiyacımız var
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Yaş</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Örn: 30"
                    value={profile.age || ''}
                    onChange={(e) => updateProfile({ age: parseInt(e.target.value) || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cinsiyet</Label>
                  <RadioGroup
                    value={profile.gender}
                    onValueChange={(value) => updateProfile({ gender: value as Gender })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal">Erkek</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal">Kadın</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal">Diğer</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Boy (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Örn: 175"
                      value={profile.height_cm || ''}
                      onChange={(e) => updateProfile({ height_cm: parseInt(e.target.value) || undefined })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Kilo (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Örn: 70"
                      value={profile.weight_kg || ''}
                      onChange={(e) => updateProfile({ weight_kg: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hedefin</Label>
                  <RadioGroup
                    value={profile.goal}
                    onValueChange={(value) => updateProfile({ goal: value as WeightGoal })}
                  >
                    {Object.entries(GOAL_LABELS).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`goal-${value}`} />
                        <Label htmlFor={`goal-${value}`} className="font-normal">{label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Aktivite Seviyesi</Label>
                  <RadioGroup
                    value={profile.activity_level}
                    onValueChange={(value) => updateProfile({ activity_level: value as ActivityLevel })}
                  >
                    {Object.entries(ACTIVITY_LEVEL_LABELS).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`activity-${value}`} />
                        <Label htmlFor={`activity-${value}`} className="font-normal text-sm">{label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Diyet Tercihleri</CardTitle>
                <CardDescription>
                  Diyet türünü ve alerji bilgilerini belirle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Diyet Türü</Label>
                  <RadioGroup
                    value={profile.diet_type}
                    onValueChange={(value) => updateProfile({ diet_type: value as DietType })}
                  >
                    {Object.entries(DIET_TYPE_LABELS).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`diet-${value}`} />
                        <Label htmlFor={`diet-${value}`} className="font-normal">{label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Alerjenler (varsa seç)</Label>
                  <div className="space-y-2">
                    {Object.entries(ALLERGEN_LABELS).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`allergen-${value}`}
                          checked={profile.allergens?.includes(value as Allergen)}
                          onCheckedChange={() => toggleAllergen(value as Allergen)}
                        />
                        <Label htmlFor={`allergen-${value}`} className="font-normal">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Tercihler</CardTitle>
                <CardDescription>
                  Sevdiğin ve sevmediğin yemekler hakkında bilgi ver (opsiyonel)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disliked">Sevmediğim Yemekler / Malzemeler</Label>
                  <Textarea
                    id="disliked"
                    placeholder="Örn: patlıcan, kereviz, mantar..."
                    value={profile.disliked_foods || ''}
                    onChange={(e) => updateProfile({ disliked_foods: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred">Sevdiğim Mutfaklar</Label>
                  <Textarea
                    id="preferred"
                    placeholder="Örn: Türk mutfağı, Akdeniz, İtalyan, Uzak Doğu..."
                    value={profile.preferred_cuisines || ''}
                    onChange={(e) => updateProfile({ preferred_cuisines: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>İpucu:</strong> Daha fazla bilgi verirsen, diyet planın senin için daha kişisel olacak!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

      </div>

      {/* Footer - Fixed at bottom with safe area */}
      <div className="flex-none border-t p-4 pb-safe flex items-center justify-between gap-2 bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] min-h-[80px]">
        <Button
          variant="outline"
          onClick={onSkip}
          className="flex-shrink-0"
        >
          Daha Sonra
        </Button>

        <div className="flex gap-2 flex-shrink-0">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Geri
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === totalSteps ? 'Tamamla' : 'İleri'}
            {step < totalSteps && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
