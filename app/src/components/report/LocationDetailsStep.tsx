import type { FormData, FormErrors } from '@/types/report';

interface LocationDetailsStepProps {
    formData: FormData;
    errors: FormErrors;
    updateField: (field: keyof FormData, value: string) => void;
}

const LocationDetailsStep = ({ formData, errors, updateField }: LocationDetailsStepProps) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#0B1A3E]">Location Details</h2>

            <div>
                <label className="label">State *</label>
                <input
                    type="text"
                    className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                />
                {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
            </div>

            <div>
                <label className="label">District *</label>
                <input
                    type="text"
                    className={`input-field ${errors.district ? 'border-red-500' : ''}`}
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                />
                {errors.district && (
                    <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                )}
            </div>

            <div>
                <label className="label">Police Station *</label>
                <input
                    type="text"
                    className={`input-field ${errors.policeStation ? 'border-red-500' : ''}`}
                    placeholder="Enter police station"
                    value={formData.policeStation}
                    onChange={(e) => updateField('policeStation', e.target.value)}
                />
                {errors.policeStation && (
                    <p className="text-red-500 text-sm mt-1">{errors.policeStation}</p>
                )}
            </div>
        </div>
    );
};

export default LocationDetailsStep;
