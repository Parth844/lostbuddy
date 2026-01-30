import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { reportMissing } from '@/services/api';
import { toast } from 'sonner';
import {
  User, MapPin, Upload, CheckCircle,
  ChevronRight, ChevronLeft, Loader2
} from 'lucide-react';
import type { FormData, FormErrors } from '@/types/report';

// Step Components
import PersonalDetailsStep from '@/components/report/PersonalDetailsStep';
import LocationDetailsStep from '@/components/report/LocationDetailsStep';
import PhotoUploadStep from '@/components/report/PhotoUploadStep';
import ReviewStep from '@/components/report/ReviewStep';

type Step = 'personal' | 'location' | 'photo' | 'review';

export default function ReportMissing() {
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    state: '',
    district: '',
    policeStation: '',
    photo: null,
    photoFile: null
  });

  useEffect(() => {
    if (location.state?.photoFile) {
      setFormData(prev => ({
        ...prev,
        photoFile: location.state.photoFile,
        photo: location.state.photoPreview
      }));
      toast.info('Photo from search included in report');
    }
  }, [location.state]);

  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (step === 'personal') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.age || parseInt(formData.age) <= 0) newErrors.age = 'Valid age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    if (step === 'location') {
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.district.trim()) newErrors.district = 'District is required';
      if (!formData.policeStation.trim()) newErrors.policeStation = 'Police station is required';
    }

    // Photo validation if strictly required, otherwise optional

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 'personal') setCurrentStep('location');
      else if (currentStep === 'location') setCurrentStep('photo');
      else if (currentStep === 'photo') setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'location') setCurrentStep('personal');
    else if (currentStep === 'photo') setCurrentStep('location');
    else if (currentStep === 'review') setCurrentStep('photo');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!formData.photoFile) {
        toast.error("Photo is required for registration");
        setIsSubmitting(false);
        return;
      }

      const birthYear = new Date().getFullYear() - parseInt(formData.age);

      await reportMissing({
        name: `${formData.firstName} ${formData.lastName}`,
        gender: formData.gender,
        birth_year: birthYear,
        state: formData.state,
        district: formData.district,
        police_station: formData.policeStation,
        photo: formData.photoFile
      });

      toast.success('Report submitted successfully', {
        description: 'Case ID: PEH-2026-X892. Authorities will verify details.',
      });

      // Reset form
      setFormData({
        firstName: '', lastName: '', age: '', gender: '',
        state: '', district: '', policeStation: '',
        photo: null, photoFile: null
      });
      setCurrentStep('personal');

    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit report', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'photo', label: 'Photo', icon: Upload },
    { id: 'review', label: 'Review', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col">
      <Navbar />

      <div className="flex-1 container max-w-4xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1A3E]">Report a Missing Person</h1>
          <p className="text-gray-600 mt-2">
            Provide details to help us find them. All information is secured.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 hidden sm:block" />
          <div className="relative z-10 flex justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

              return (
                <div key={step.id} className="flex flex-col items-center bg-[#F4F6FA] px-2 sm:px-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive || isCompleted
                      ? 'bg-[#1E6BFF] text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                      }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${isActive ? 'text-[#1E6BFF]' : 'text-gray-500'
                    }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[18px] shadow-lg border border-gray-100 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {currentStep === 'personal' && (
            <PersonalDetailsStep
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
          )}

          {currentStep === 'location' && (
            <LocationDetailsStep
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
          )}

          {currentStep === 'photo' && (
            <PhotoUploadStep
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {currentStep === 'review' && (
            <ReviewStep formData={formData} />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'personal' || isSubmitting}
              className={currentStep === 'personal' ? 'invisible' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === 'review' ? (
              <Button
                onClick={handleSubmit}
                className="bg-[#1E6BFF] hover:bg-[#1a5fe6]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Report
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#1E6BFF] hover:bg-[#1a5fe6]"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
