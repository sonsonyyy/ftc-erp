<?php

namespace App\Console\Commands;

use App\Actions\Compliance\GenerateComplianceAlertsAction;
use App\Jobs\GenerateComplianceAlertsJob;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class GenerateComplianceAlertsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'compliance:generate-alerts
        {--date= : Generate alerts for a specific YYYY-MM-DD date}
        {--sync : Run the alert generation inline instead of dispatching a queued job}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate compliance reminder and overdue alerts';

    /**
     * Execute the console command.
     */
    public function handle(GenerateComplianceAlertsAction $generateComplianceAlertsAction): int
    {
        $date = $this->option('date');
        $runDate = filled($date)
            ? CarbonImmutable::parse((string) $date)
            : null;

        if ($this->option('sync')) {
            $createdCount = $generateComplianceAlertsAction->handle($runDate);

            $this->info("Generated {$createdCount} compliance alert(s).");

            return self::SUCCESS;
        }

        GenerateComplianceAlertsJob::dispatch(
            $runDate?->toDateString(),
        );

        $this->info('Compliance alert generation job dispatched.');

        return self::SUCCESS;
    }
}
