<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureIsEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature): Response|RedirectResponse
    {
        if (config("features.{$feature}", false)) {
            return $next($request);
        }

        if ($request->user()?->hasPermissionTo('dashboard.view') ?? false) {
            return redirect()->route('dashboard')->with('warning', __('This module is temporarily unavailable.'));
        }

        abort(503, __('This module is temporarily unavailable.'));
    }
}
