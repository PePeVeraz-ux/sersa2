export class RegisterPatientDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  secondLastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export class RegisterNurseDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  secondLastName?: string;
  phone?: string;
  professionalLicense!: string;
  licenseState?: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}
