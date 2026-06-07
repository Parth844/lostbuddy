import { useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import type { FormData } from '@/types/report';

interface PhotoUploadStepProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const PhotoUploadStep = ({ formData, setFormData }: PhotoUploadStepProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File size should be less than 10MB'); // Simple alert, toast handled in parent or use context
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    photo: e.target?.result as string,
                    photoFile: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#0B1A3E]">Photo Upload</h2>
            <p className="text-gray-600">
                A recent, clear photo significantly improves search accuracy.
                Photos are encrypted and used only for matching purposes.
            </p>

            {!formData.photo ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-zone cursor-pointer"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                    />
                    <div className="w-20 h-20 rounded-2xl bg-[#1E6BFF]/10 flex items-center justify-center mx-auto mb-6">
                        <Upload className="w-10 h-10 text-[#1E6BFF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#0B1A3E] mb-2">
                        Upload a photo
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Click to browse or drag and drop
                    </p>
                    <p className="text-sm text-gray-400">
                        JPG, PNG up to 10MB. Clear front-facing photos work best.
                    </p>
                </div>
            ) : (
                <div className="relative">
                    <button
                        onClick={() => setFormData(prev => ({ ...prev, photo: null, photoFile: null }))}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="relative rounded-xl overflow-hidden">
                        <img
                            src={formData.photo}
                            alt="Uploaded photo"
                            className="w-full max-h-[300px] object-contain bg-gray-50"
                        />
                    </div>
                </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-amber-800">
                        <strong>Photo Tips:</strong> Use a clear, well-lit photo showing
                        the person's face. Avoid sunglasses, hats, or heavy makeup that
                        might obscure facial features.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PhotoUploadStep;
