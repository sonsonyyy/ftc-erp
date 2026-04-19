<?php

use App\Http\Controllers\Projects\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('projects/{project}/status', [ProjectController::class, 'updateStatus'])->name('projects.update-status');
    Route::post('projects/{project}/assignments', [ProjectController::class, 'storeAssignment'])->name('projects.assignments.store');
    Route::delete('projects/{project}/assignments/{assignment}', [ProjectController::class, 'destroyAssignment'])->name('projects.assignments.destroy');
    Route::resource('projects', ProjectController::class);
});
