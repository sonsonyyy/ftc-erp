<?php

namespace App\Enums;

enum WorkOrderServiceType: string
{
    case PreventiveMaintenance = 'preventive_maintenance';
    case CorrectiveService = 'corrective_service';
    case EmergencyService = 'emergency_service';
    case InspectionRelatedWork = 'inspection_related_work';
    case InstallationSupport = 'installation_support';
    case OtherServiceJob = 'other_service_job';

    /**
     * Get a human readable label for the service type.
     */
    public function label(): string
    {
        return match ($this) {
            self::PreventiveMaintenance => 'Preventive Maintenance',
            self::CorrectiveService => 'Corrective Service',
            self::EmergencyService => 'Emergency Service',
            self::InspectionRelatedWork => 'Inspection-related Work',
            self::InstallationSupport => 'Installation Support',
            self::OtherServiceJob => 'Other Service Job',
        };
    }
}
