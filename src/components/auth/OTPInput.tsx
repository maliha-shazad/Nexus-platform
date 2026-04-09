import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Shield, Check } from 'lucide-react';

interface OTPInputProps {
  onVerify: (success: boolean) => void;
  onCancel: () => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({ onVerify, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState(false);
  
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleVerify = () => {
    const enteredOtp = otp.join('');
    // Mock 2FA - any 6-digit code works for demo
    if (enteredOtp.length === 6 && /^\d+$/.test(enteredOtp)) {
      onVerify(true);
    } else {
      setError(true);
    }
  };
  
  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield size={32} className="text-primary-600" />
          </div>
          <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
          <p className="text-gray-500 text-sm mt-1">
            Enter the 6-digit verification code sent to your email
          </p>
        </div>
        
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-primary-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          ))}
        </div>
        
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            Invalid verification code. Please try again.
          </p>
        )}
        
        <p className="text-xs text-gray-400 text-center mb-4">
          Demo mode: Enter any 6-digit number (e.g., 123456)
        </p>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleVerify} className="flex-1" leftIcon={<Check size={16} />}>
            Verify
          </Button>
        </div>
      </div>
    </div>
  );
};