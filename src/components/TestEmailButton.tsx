import { useState } from 'react';
import { Loader2, Send, CheckCheck, XCircle } from 'lucide-react';

export default function TestEmailButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});

  const sendTestEmail = async () => {
    try {
      setIsLoading(true);
      setResult({});

      const response = await fetch('/api/test-email');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setResult({
        success: true,
        message: data.message || 'Email sent successfully!'
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-4 p-4 border border-[#0ff0fc]/30 rounded-lg bg-[#051723]">
      <h3 className="text-lg font-bold mb-2 text-white">Test Email Delivery</h3>
      <p className="text-gray-400 mb-3 text-sm">
        Click the button below to send a test email to your account.
      </p>
      
      <button
        onClick={sendTestEmail}
        disabled={isLoading}
        className={`flex items-center justify-center px-4 py-2 rounded-md text-black font-medium ${isLoading ? 'bg-gray-700 text-gray-300' : 'bg-[#0ff0fc] hover:bg-[#0cd8e4]'}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Test Email
          </>
        )}
      </button>
      
      {result.success && (
        <div className="mt-3 p-2 bg-green-900/30 border border-green-500 rounded text-sm flex items-start">
          <CheckCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-green-400">{result.message}</span>
        </div>
      )}
      
      {result.error && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-500 rounded text-sm flex items-start">
          <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-red-400">{result.error}</span>
        </div>
      )}
    </div>
  );
} 