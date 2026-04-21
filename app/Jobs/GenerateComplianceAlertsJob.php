<?php

namespace App\Jobs;

use App\Actions\Compliance\GenerateComplianceAlertsAction;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateComplianceAlertsJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ?string $runDate = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GenerateComplianceAlertsAction $generateComplianceAlertsAction): void
    {
        $generateComplianceAlertsAction->handle(
            filled($this->runDate)
                ? CarbonImmutable::parse($this->runDate)
                : null,
        );
    }
}
