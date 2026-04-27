import { dashboard } from '@/routes';
import { index as paymentsIndex } from '@/routes/payments';
import { PaymentForm } from '@/components/billing/payment-form';
import type {
    PaymentFormDefaults,
    PaymentInvoiceOption,
    PaymentMethodOption,
    SelectOption,
} from '@/types';

type Props = {
    customerOptions: SelectOption[];
    invoiceOptions: PaymentInvoiceOption[];
    paymentMethodOptions: PaymentMethodOption[];
    defaults: PaymentFormDefaults;
};

export default function PaymentsCreate(props: Props) {
    return (
        <div className="app-page flex flex-1 flex-col gap-6">
            <PaymentForm
                {...props}
                title="Record Payment"
                description="Capture the receipt and allocate it across one or more customer invoices."
                cancelHref={paymentsIndex()}
            />
        </div>
    );
}

PaymentsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Payments',
            href: paymentsIndex(),
        },
        {
            title: 'Record Payment',
            href: paymentsIndex(),
        },
    ],
};
