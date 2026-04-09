import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (pass: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (!pass) {
      return { score: 0, label: 'No password', color: 'bg-gray-200' };
    }
    
    // Length check
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    
    // Uppercase check
    if (/[A-Z]/.test(pass)) score++;
    
    // Lowercase check
    if (/[a-z]/.test(pass)) score++;
    
    // Numbers check
    if (/[0-9]/.test(pass)) score++;
    
    // Special characters check
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score < 2) {
      return { score, label: 'Weak', color: 'bg-red-500' };
    } else if (score < 4) {
      return { score, label: 'Fair', color: 'bg-yellow-500' };
    } else if (score < 6) {
      return { score, label: 'Good', color: 'bg-blue-500' };
    } else {
      return { score, label: 'Strong', color: 'bg-green-500' };
    }
  };
  
  const strength = calculateStrength(password);
  
  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'At least 12 characters (strong)', met: password.length >= 12 },
    { text: 'Contains uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { text: 'Contains number (0-9)', met: /[0-9]/.test(password) },
    { text: 'Contains special character (!@#$%)', met: /[^A-Za-z0-9]/.test(password) },
  ];
  
  if (!password) return null;
  
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password Strength:</span>
          <span className={`font-medium ${
            strength.label === 'Strong' ? 'text-green-600' :
            strength.label === 'Good' ? 'text-blue-600' :
            strength.label === 'Fair' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.score / 7) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="text-xs space-y-1">
        <p className="text-gray-500 mb-1">Password requirements:</p>
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            {req.met ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <X size={12} className="text-gray-300" />
            )}
            <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};