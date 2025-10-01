import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';

export default function UpdateWhatsAppPhoneForm({ whatsapp_phone, className = '' }) {
    const { setData, post, processing, errors, recentlySuccessful } = useForm({
        whatsapp_phone: whatsapp_phone || '',
    });

    const [displayPhone, setDisplayPhone] = useState(formatPhoneForDisplay(whatsapp_phone || ''));

    function formatPhoneForDisplay(phone) {
        // Remove all non-digits
        const digits = phone.replace(/\D/g, '');

        // Format as 01X-XXXX-XXXX or 01X-XXX-XXXX
        if (digits.length === 11) {
            // 01X-XXX-XXXX (11 digits)
            return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length === 12) {
            // 01X-XXXX-XXXX (12 digits)
            return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
        }
        return phone;
    }

    const handlePhoneChange = (e) => {
        let value = e.target.value;

        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Limit to 12 digits
        if (digits.length > 12) {
            return;
        }

        // Format as user types
        let formatted = '';
        if (digits.length >= 3) {
            formatted = digits.slice(0, 3);
            if (digits.length > 3) {
                formatted += '-';
                if (digits.length === 11) {
                    // 01X-XXX-XXXX
                    formatted += digits.slice(3, 6);
                    if (digits.length > 6) {
                        formatted += '-' + digits.slice(6, 10);
                    }
                } else {
                    // 01X-XXXX-XXXX
                    formatted += digits.slice(3, 7);
                    if (digits.length > 7) {
                        formatted += '-' + digits.slice(7, 11);
                    }
                }
            }
        } else {
            formatted = digits;
        }

        setDisplayPhone(formatted);
        setData('whatsapp_phone', formatted);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.whatsapp.update'), {
            preserveScroll: true,
        });
    };

    const formatForWhatsApp = (phone) => {
        const digits = phone.replace(/\D/g, '');
        return `+6${digits}`;
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    WhatsApp Settings
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your WhatsApp phone number for customer orders.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="whatsapp_phone" value="WhatsApp Phone Number" />

                    <input
                        id="whatsapp_phone"
                        type="text"
                        value={displayPhone}
                        onChange={handlePhoneChange}
                        placeholder="01X-XXXX-XXXX"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    />

                    <InputError className="mt-2" message={errors.whatsapp_phone} />

                    <p className="mt-2 text-sm text-gray-500">
                        Format: 01X-XXXX-XXXX (11-12 digits). This number will be used for WhatsApp orders.
                    </p>

                    {displayPhone && (
                        <p className="mt-2 text-sm text-blue-600">
                            WhatsApp URL format: {formatForWhatsApp(displayPhone)}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
