<?php

use App\Http\Controllers\Compliance\ComplianceAlertController;
use App\Http\Controllers\Compliance\ComplianceCalendarController;
use App\Http\Controllers\Compliance\ComplianceRecordController;
use App\Http\Controllers\Compliance\ComplianceSubmissionController;
use App\Http\Controllers\Compliance\ComplianceTaskController;
use App\Http\Middleware\EnsureComplianceModuleIsReady;
use Illuminate\Support\Facades\Route;

Route::middleware([
    'auth',
    'verified',
    'feature:compliance_tax_enabled',
    EnsureComplianceModuleIsReady::class,
])->group(function () {
    Route::get('compliance-records/calendar', ComplianceCalendarController::class)
        ->name('compliance-records.calendar');
    Route::get('compliance-alerts', [ComplianceAlertController::class, 'index'])
        ->name('compliance-alerts.index');
    Route::patch('compliance-alerts/{compliance_alert}/acknowledge', [ComplianceAlertController::class, 'acknowledge'])
        ->name('compliance-alerts.acknowledge');
    Route::post('compliance-records/{compliance_record}/submissions', [ComplianceSubmissionController::class, 'store'])
        ->name('compliance-records.submissions.store');
    Route::patch('compliance-records/{compliance_record}/submissions/{submission}/approve', [ComplianceSubmissionController::class, 'approve'])
        ->name('compliance-records.submissions.approve');
    Route::post('compliance-records/{compliance_record}/tasks', [ComplianceTaskController::class, 'store'])
        ->name('compliance-records.tasks.store');
    Route::patch('compliance-records/{compliance_record}/tasks/{task}', [ComplianceTaskController::class, 'update'])
        ->name('compliance-records.tasks.update');
    Route::delete('compliance-records/{compliance_record}/tasks/{task}', [ComplianceTaskController::class, 'destroy'])
        ->name('compliance-records.tasks.destroy');
    Route::resource('compliance-records', ComplianceRecordController::class);
});
