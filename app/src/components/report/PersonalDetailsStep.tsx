import type { FormData, FormErrors } from '@/types/report';

interface PersonalDetailsStepProps {
    formData: FormData;
    errors: FormErrors;
    updateField: (field: keyof FormData, value: string) => void;
}

const PersonalDetailsStep = ({ formData, errors, updateField }: PersonalDetailsStepProps) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#0B1A3E]">Personal Details</h2>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="label">First Name *</label>
                    <input
                        type="text"
                        className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                    />
                    {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                </div>
                <div>
                    <label className="label">Last Name *</label>
                    <input
                        type="text"
                        className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                    />
                    {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="label">Age *</label>
                    <input
                        type="number"
                        className={`input-field ${errors.age ? 'border-red-500' : ''}`}
                        placeholder="Years"
                        value={formData.age}
                        onChange={(e) => updateField('age', e.target.value)}
                    />
                    {errors.age && (
                        <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                    )}
                </div>
                <div>
                    <label className="label">Gender *</label>
                    <select
                        className={`input-field ${errors.gender ? 'border-red-500' : ''}`}
                        value={formData.gender}
                        onChange={(e) => updateField('gender', e.target.value)}
                    >
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>
                    {errors.gender && (
                        <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonalDetailsStep;
