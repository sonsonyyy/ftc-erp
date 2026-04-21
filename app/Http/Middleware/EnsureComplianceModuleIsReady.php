<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureComplianceModuleIsReady
{
    private const REQUIRED_TABLES = [
        'compliance_templates',
        'compliance_records',
        'compliance_tasks',
        'compliance_submissions',
        'compliance_alerts',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->moduleReady()) {
            return $next($request);
        }

        if ($request->user()?->hasPermissionTo('dashboard.view') ?? false) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => __('Compliance & Renewals is not available until its migrations are run.'),
            ]);

            return to_route('dashboard');
        }

        abort(503, __('Compliance & Renewals is not available until its migrations are run.'));
    }

    /**
     * Determine if the compliance module tables are available.
     */
    private function moduleReady(): bool
    {
        foreach (self::REQUIRED_TABLES as $table) {
            if (! Schema::hasTable($table)) {
                return false;
            }
        }

        return true;
    }
}
