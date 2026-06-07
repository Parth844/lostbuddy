import { User, Calendar } from 'lucide-react';
import type { FormData } from '@/types/report';

interface ReviewStepProps {
    formData: FormData;
}

const ReviewStep = ({ formData }: ReviewStepProps) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#0B1A3E]">Review Your Report</h2>
            <p className="text-gray-600">
                Please review all information before submitting. Once submitted,
                your case will be reviewed by authorities.
            </p>

            <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-[#0B1A3E] mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Personal Details
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-500">Name:</span> {formData.firstName} {formData.lastName}</p>
                        <p><span className="text-gray-500">Age:</span> {formData.age}</p>
                        <p><span className="text-gray-500">Gender:</span> {formData.gender === 'M' ? 'Male' : formData.gender === 'F' ? 'Female' : 'Other'}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-[#0B1A3E] mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Location
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">State:</span> {formData.state}</p>
                        <p><span className="text-gray-500">District:</span> {formData.district}</p>
                        <p><span className="text-gray-500">Police Station:</span> {formData.policeStation}</p>
                    </div>
                </div>

                {formData.photo && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-[#0B1A3E] mb-3">Photo</h3>
                        <img
                            src={formData.photo}
                            alt="Uploaded"
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                    </div>
                )}
            </div>

            <div className="bg-[#1E6BFF]/5 border border-[#1E6BFF]/20 rounded-xl p-4">
                <p className="text-sm text-[#1E6BFF]">
                    By submitting this report, you confirm that all information provided
                    is accurate to the best of your knowledge. False reporting is a
                    punishable offense.
                </p>
            </div>
        </div>
    );
};

export default ReviewStep;
