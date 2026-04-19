<?php

use App\Http\Controllers\Quotations\QuotationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('quotations/kpi', [QuotationController::class, 'kpi'])->name('quotations.kpi');
    Route::post('quotations/{quotation}/status', [QuotationController::class, 'updateStatus'])->name('quotations.update-status');
    Route::resource('quotations', QuotationController::class);
});
