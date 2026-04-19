<?php

use App\Http\Controllers\Quotations\QuotationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('quotations/kpi', [QuotationController::class, 'kpi'])->name('quotations.kpi');
    Route::get('quotations/{quotation}/convert-to-project', [QuotationController::class, 'convertToProject'])->name('quotations.convert-to-project');
    Route::get('quotations/{quotation}/convert-to-work-order', [QuotationController::class, 'convertToWorkOrder'])->name('quotations.convert-to-work-order');
    Route::post('quotations/{quotation}/status', [QuotationController::class, 'updateStatus'])->name('quotations.update-status');
    Route::resource('quotations', QuotationController::class);
});
