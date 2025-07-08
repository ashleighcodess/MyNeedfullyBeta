import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [location, navigate] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [message, setMessage] = useState('');

  // Extract token from URL
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const token = urlParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await apiRequest('POST', '/api/auth/verify-email', { token });
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified!');
      } catch (error: any) {
        console.error('Email verification error:', error);
        if (error.message.includes('expired')) {
          setVerificationStatus('expired');
          setMessage('This verification link has expired. Please request a new one.');
        } else if (error.message.includes('already verified')) {
          setVerificationStatus('success');
          setMessage('Your email is already verified!');
        } else {
          setVerificationStatus('error');
          setMessage('Failed to verify email. The link may be invalid or expired.');
        }
      }
    };

    verifyEmail();
  }, [token]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRequestNewLink = async () => {
    try {
      await apiRequest('POST', '/api/auth/resend-verification', {});
      setMessage('A new verification email has been sent to your inbox.');
    } catch (error) {
      setMessage('Failed to send new verification email. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Email Verification
          </CardTitle>
          <CardDescription>
            {verificationStatus === 'pending' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Verification Complete'}
            {verificationStatus === 'error' && 'Verification Failed'}
            {verificationStatus === 'expired' && 'Link Expired'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {verificationStatus === 'pending' && (
              <Loader2 className="h-12 w-12 text-coral animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {(verificationStatus === 'error' || verificationStatus === 'expired') && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
            
            <p className="text-center text-gray-600">
              {message}
            </p>
          </div>

          {verificationStatus === 'success' && (
            <Button 
              onClick={handleGoToDashboard}
              className="w-full bg-coral hover:bg-coral/90"
            >
              Go to Dashboard
            </Button>
          )}

          {verificationStatus === 'expired' && (
            <Button 
              onClick={handleRequestNewLink}
              className="w-full bg-coral hover:bg-coral/90"
            >
              Request New Verification Link
            </Button>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={handleRequestNewLink}
                className="w-full bg-coral hover:bg-coral/90"
              >
                Request New Verification Link
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}