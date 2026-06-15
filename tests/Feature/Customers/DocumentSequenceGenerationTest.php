<?php

use App\Actions\Documents\GenerateDocumentNumberAction;
use App\Models\DocumentSequence;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow();
});

test('document numbers increment within the same month', function () {
    Carbon::setTestNow('2026-06-14 09:00:00');

    $generator = app(GenerateDocumentNumberAction::class);

    expect($generator->forCustomer())->toBe('CUST-0626-0001');
    expect($generator->forCustomer())->toBe('CUST-0626-0002');
    expect($generator->forSite())->toBe('SITE-0626-0001');

    expect(DocumentSequence::query()
        ->where('document_type', 'customer')
        ->where('period_key', '0626')
        ->value('last_number'))
        ->toBe(2);

    expect(DocumentSequence::query()
        ->where('document_type', 'site')
        ->where('period_key', '0626')
        ->value('last_number'))
        ->toBe(1);
});

test('document numbers reset when the month changes', function () {
    $generator = app(GenerateDocumentNumberAction::class);

    Carbon::setTestNow('2026-06-30 18:00:00');
    expect($generator->forCustomer())->toBe('CUST-0626-0001');

    Carbon::setTestNow('2026-07-01 08:00:00');
    expect($generator->forCustomer())->toBe('CUST-0726-0001');

    expect(DocumentSequence::query()->count())->toBe(2);
});
