export interface FormData {
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    state: string;
    district: string;
    policeStation: string;
    photo: string | null;
    photoFile: File | null;
}

// Making errors optional so we can pass partial errors
export type FormErrors = Partial<Record<keyof FormData, string>>;
