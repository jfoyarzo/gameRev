'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReactNode } from 'react';

interface ReCaptchaProviderProps {
    children: ReactNode;
    siteKey: string;
}

export function ReCaptchaProvider({ children, siteKey }: ReCaptchaProviderProps) {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
            {children}
        </GoogleReCaptchaProvider>
    );
}
