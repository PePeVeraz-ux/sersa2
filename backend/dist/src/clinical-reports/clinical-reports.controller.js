"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalReportsController = void 0;
const common_1 = require("@nestjs/common");
const clinical_reports_service_1 = require("./clinical-reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let ClinicalReportsController = class ClinicalReportsController {
    clinicalReportsService;
    constructor(clinicalReportsService) {
        this.clinicalReportsService = clinicalReportsService;
    }
    async createReport(req, data) {
        const userId = req.user?.userId || req.user?.id || req.user?.sub;
        return this.clinicalReportsService.createReport(userId, data);
    }
    async getMyReports(req) {
        const userId = req.user?.userId || req.user?.id || req.user?.sub;
        return this.clinicalReportsService.getNurseReports(userId);
    }
    async getReportByRequest(req, requestId) {
        const userId = req.user?.userId || req.user?.id || req.user?.sub;
        return this.clinicalReportsService.getReportByRequest(requestId, userId);
    }
};
exports.ClinicalReportsController = ClinicalReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('nurse'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ClinicalReportsController.prototype, "createReport", null);
__decorate([
    (0, common_1.Get)('my-reports'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('nurse'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClinicalReportsController.prototype, "getMyReports", null);
__decorate([
    (0, common_1.Get)(':requestId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClinicalReportsController.prototype, "getReportByRequest", null);
exports.ClinicalReportsController = ClinicalReportsController = __decorate([
    (0, common_1.Controller)('clinical-reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [clinical_reports_service_1.ClinicalReportsService])
], ClinicalReportsController);
//# sourceMappingURL=clinical-reports.controller.js.map