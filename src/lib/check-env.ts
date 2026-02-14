
export function checkRequiredEnv() {
    const required = [
        'AUTH_SECRET',
        'GEMINI_API_KEY',
    ];

    const missing = required.filter(key => {
        const val = process.env[key];
        return !val || val.includes('your-') || val.length < 5;
    });

    if (missing.length > 0) {
        console.warn('⚠️ [DIAGNOSTICS] Missing or invalid critical environment variables:', missing.join(', '));
        console.warn('⚠️ [DIAGNOSTICS] Some features like AI processing or secure auth may fail.');
    } else {
        console.log('✅ [DIAGNOSTICS] Critical environment variables verified.');
    }
}
