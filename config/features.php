<?php

return [
    'compliance_tax_enabled' => (bool) env('FEATURE_COMPLIANCE_TAX_ENABLED', false),
    'payroll_runs_enabled' => (bool) env('FEATURE_PAYROLL_RUNS_ENABLED', false),
];
