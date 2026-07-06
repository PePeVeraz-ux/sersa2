"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDto = exports.RegisterNurseDto = exports.RegisterPatientDto = void 0;
class RegisterPatientDto {
    email;
    password;
    firstName;
    lastName;
    secondLastName;
    phone;
    dateOfBirth;
    gender;
}
exports.RegisterPatientDto = RegisterPatientDto;
class RegisterNurseDto {
    email;
    password;
    firstName;
    lastName;
    secondLastName;
    phone;
    professionalLicense;
    licenseState;
}
exports.RegisterNurseDto = RegisterNurseDto;
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
//# sourceMappingURL=auth.dto.js.map