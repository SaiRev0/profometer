'use client';
import { signIn } from 'next-auth/react';
export default function SignInPage() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <h1>Sign in with your Institute Email</h1>
            <div style={{ marginTop: '20px' }}>
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                    onClick={() => signIn('google', { callbackUrl: '/' })}>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
