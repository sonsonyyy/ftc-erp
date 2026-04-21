<?php

namespace App\Actions\Exports;

use BackedEnum;
use DateTimeInterface;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StreamCsvExportAction
{
    /**
     * Stream a CSV download without writing the export to disk first.
     *
     * @param  array<int, string>  $headers
     * @param  iterable<int, array<int, mixed>>  $rows
     */
    public function handle(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $rows): void {
            $stream = fopen('php://output', 'w');

            if ($stream === false) {
                return;
            }

            fputcsv($stream, $headers);

            foreach ($rows as $row) {
                fputcsv(
                    $stream,
                    array_map(fn (mixed $value) => $this->normalizeValue($value), $row),
                );
            }

            fclose($stream);
        }, $this->asciiFilename($filename), [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Normalize exported values into CSV-safe scalars.
     */
    private function normalizeValue(mixed $value): string|int|float
    {
        return match (true) {
            $value === null => '',
            is_bool($value) => $value ? 'Yes' : 'No',
            $value instanceof DateTimeInterface => $value->format('Y-m-d H:i:s'),
            $value instanceof BackedEnum => $value->value,
            is_int($value), is_float($value) => $value,
            default => (string) $value,
        };
    }

    /**
     * Keep streamed-download filenames ASCII-safe for HttpFoundation.
     */
    private function asciiFilename(string $filename): string
    {
        $filename = Str::ascii($filename);

        return blank($filename) ? 'export.csv' : $filename;
    }
}
