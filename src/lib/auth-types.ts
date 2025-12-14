// Client-safe auth types and error messages
// This file can be safely imported from Client Components

// Define auth error types
export type AuthError = {
  type: 'AccessDenied' | 'InvalidDepartment' | 'DepartmentNotFound' | 'Unknown' | 'Unauthorized';
  message: string;
};

// Map of error types to user-friendly messages
export const authErrorMessages: Record<AuthError['type'], string> = {
  AccessDenied: 'Only IIT BHU email addresses (@itbhu.ac.in) are allowed to sign in.',
  InvalidDepartment: 'Could not determine your department from your email address.',
  DepartmentNotFound: 'Your department is not registered in our system.',
  Unknown: 'An unexpected error occurred during sign in.',
  Unauthorized: 'Please sign in first'
};
