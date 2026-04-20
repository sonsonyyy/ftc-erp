<?php

use App\Http\Controllers\Tax\TaxReportRunController;
use App\Http\Controllers\Tax\VatRecordController;
use App\Http\Controllers\Tax\WithholdingRecordController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('withholding-records', [WithholdingRecordController::class, 'index'])
        ->name('withholding-records.index');

    Route::get('vat-records', [VatRecordController::class, 'index'])
        ->name('vat-records.index');

    Route::resource('tax-report-runs', TaxReportRunController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy']);
});
