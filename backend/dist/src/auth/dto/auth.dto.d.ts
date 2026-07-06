export declare class RegisterPatientDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    secondLastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
}
export declare class RegisterNurseDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    secondLastName?: string;
    phone?: string;
    professionalLicense: string;
    licenseState?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
