'use server';

import { appConfig } from '@/lib/dal/config';

interface RecaptchaVerificationResponse {
    success: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
}

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_SCORE_THRESHOLD = 0.5;

export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
    if (process.env.NODE_ENV !== 'production') {
        console.log('reCAPTCHA verification bypassed (non-production environment)');
        return { success: true, score: 1.0 };
    }

    const secretKey = appConfig.recaptcha.secretKey;

    try {
        const response = await fetch(RECAPTCHA_VERIFY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
            }),
        });

        if (!response.ok) {
            return { success: false, error: 'Failed to verify reCAPTCHA' };
        }

        const data: RecaptchaVerificationResponse = await response.json();

        if (!data.success) {
            const errorMessage = data['error-codes']?.join(', ') || 'Unknown error';
            console.error('reCAPTCHA verification failed:', errorMessage);
            return { success: false, error: 'reCAPTCHA verification failed' };
        }

        if (data.score !== undefined && data.score < RECAPTCHA_SCORE_THRESHOLD) {
            console.warn(`reCAPTCHA score too low: ${data.score}`);
            return { success: false, score: data.score, error: 'Suspicious activity detected. Please try again.' };
        }

        return { success: true, score: data.score };
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return { success: false, error: 'Failed to verify reCAPTCHA' };
    }
}

