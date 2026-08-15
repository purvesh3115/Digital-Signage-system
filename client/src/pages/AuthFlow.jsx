import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Apple,
  ArrowLeft,
  Check,
  CheckCircle2,
  Chrome,
  Eye,
  EyeOff,
  Monitor,
  ShieldCheck,
} from 'lucide-react';

const DEMO_ACCOUNT = {
  email: 'admin@signage.local',
  password: 'Admin@123',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (password) => {
  if (!password) return { label: 'No password', score: 0, color: '#6b7280' };

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  if (score <= 1) return { label: 'Weak', score, color: '#ef4444' };
  if (score === 2) return { label: 'Fair', score, color: '#f59e0b' };
  if (score === 3) return { label: 'Good', score, color: '#22c55e' };
  return { label: 'Strong', score: 4, color: '#10b981' };
};

const persistAuth = (email, name) => {
  localStorage.setItem('authSession', JSON.stringify({ email, name, authenticatedAt: Date.now() }));
};

const clearAuth = () => {
  localStorage.removeItem('authSession');
};

const focusInput = (event) => {
  const target = event.currentTarget;
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 120);
};

const BrandHeader = () => (
  <div className="auth-brand-wrap">
    <div className="auth-brand-mark">
      <Monitor size={22} />
    </div>
    <span className="auth-brand-name">SignageAdmin</span>
  </div>
);

const SocialButton = ({ icon: Icon, label }) => (
  <button type="button" className="auth-social-btn">
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const Field = ({ label, type, name, value, onChange, placeholder, error, autoComplete, onFocus }) => (
  <div className="auth-field">
    <label className="auth-label" htmlFor={name}>{label}</label>
    <div className={`auth-input-wrap ${error ? 'has-error' : ''}`}>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="auth-input"
        onFocus={onFocus || focusInput}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </div>
    {error ? (
      <p id={`${name}-error`} className="auth-field-error">
        {error}
      </p>
    ) : null}
  </div>
);

const PasswordField = ({ label, name, value, onChange, placeholder, error, showPassword, togglePassword, autoComplete, onFocus }) => (
  <div className="auth-field">
    <label className="auth-label" htmlFor={name}>{label}</label>
    <div className={`auth-input-wrap ${error ? 'has-error' : ''}`}>
      <input
        id={name}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="auth-input"
        onFocus={onFocus || focusInput}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      <button
        type="button"
        className="auth-toggle-password"
        onClick={togglePassword}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error ? (
      <p id={`${name}-error`} className="auth-field-error">
        {error}
      </p>
    ) : null}
  </div>
);

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isSubmitDisabled = !form.email.trim() || !form.password || !EMAIL_REGEX.test(form.email.trim());

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
      password: name === 'password' ? '' : current.password,
      email: name === 'email' ? '' : current.email,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    const email = form.email.trim();

    if (!email) nextErrors.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(email)) nextErrors.email = 'Please enter a valid email address.';

    if (!form.password) nextErrors.password = 'Password is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    await new Promise((resolve) => setTimeout(resolve, 900));

    const matchesDemoAccount =
      form.email.trim().toLowerCase() === DEMO_ACCOUNT.email && form.password === DEMO_ACCOUNT.password;

    if (!matchesDemoAccount) {
      setErrors({
        password: 'Incorrect email or password. Please try again.',
      });
      setIsLoading(false);
      return;
    }

    persistAuth(form.email.trim(), form.email.trim().split('@')[0]);
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--compact">
        <BrandHeader />
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@company.com"
            error={errors.email}
            autoComplete="email"
          />

          <PasswordField
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            showPassword={showPassword}
            togglePassword={() => setShowPassword((current) => !current)}
            autoComplete="current-password"
          />

          <div className="auth-row auth-row--space-between">
            <label className="auth-checkbox" htmlFor="remember">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitDisabled || isLoading}>
            {isLoading ? 'Signing In...' : 'Login / Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>

        <div className="auth-socials">
          <SocialButton icon={Chrome} label="Continue with Google" />
          <SocialButton icon={Apple} label="Continue with Apple" />
        </div>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup" className="auth-link auth-link--strong">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const isSubmitDisabled =
    !form.fullName.trim() ||
    !form.email.trim() ||
    !form.password ||
    !form.confirmPassword ||
    !form.agree ||
    !EMAIL_REGEX.test(form.email.trim()) ||
    form.password.length < 8 ||
    form.password !== form.confirmPassword;

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
      fullName: name === 'fullName' ? '' : current.fullName,
      email: name === 'email' ? '' : current.email,
      password: name === 'password' ? '' : current.password,
      confirmPassword: name === 'confirmPassword' ? '' : current.confirmPassword,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    const trimmedName = form.fullName.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) nextErrors.fullName = 'Full name is required.';
    else if (trimmedName.length < 2) nextErrors.fullName = 'Name must be at least 2 characters.';

    if (!trimmedEmail) nextErrors.email = 'Email address is required.';
    else if (!EMAIL_REGEX.test(trimmedEmail)) nextErrors.email = 'Please enter a valid email address.';

    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters for your password.';

    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';

    if (!form.agree) nextErrors.agree = 'You must agree to the terms and privacy policy.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    await new Promise((resolve) => setTimeout(resolve, 900));

    localStorage.setItem('pendingSignupEmail', form.email.trim());
    setIsLoading(false);
    navigate('/verify-email');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <BrandHeader />
        <div className="auth-header">
          <h1>Create Your Account</h1>
          <p>Sign up to get started</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field
            label="Full Name"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.fullName}
            autoComplete="name"
          />

          <Field
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@company.com"
            error={errors.email}
            autoComplete="email"
          />

          <PasswordField
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            error={errors.password}
            showPassword={showPassword}
            togglePassword={() => setShowPassword((current) => !current)}
            autoComplete="new-password"
          />

          {form.password ? (
            <div className="auth-strength">
              <div className="auth-strength-row">
                <span>Password strength</span>
                <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
              </div>
              <div className="auth-strength-meter">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={step <= passwordStrength.score ? 'is-active' : ''}
                    style={{ backgroundColor: step <= passwordStrength.score ? passwordStrength.color : '#2d3748' }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            showPassword={showConfirmPassword}
            togglePassword={() => setShowConfirmPassword((current) => !current)}
            autoComplete="new-password"
          />

          <label className="auth-checkbox auth-checkbox--stacked" htmlFor="agree">
            <input
              id="agree"
              name="agree"
              type="checkbox"
              checked={form.agree}
              onChange={handleChange}
            />
            <span>
              I agree to the <span className="auth-link auth-link--inline">Terms & Conditions</span> and{' '}
              <span className="auth-link auth-link--inline">Privacy Policy</span>
            </span>
          </label>
          {errors.agree ? <p className="auth-field-error auth-field-error--compact">{errors.agree}</p> : null}

          <button type="submit" className="auth-button" disabled={isSubmitDisabled || isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account / Sign Up'}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>

        <div className="auth-socials">
          <SocialButton icon={Chrome} label="Continue with Google" />
          <SocialButton icon={Apple} label="Continue with Apple" />
        </div>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link auth-link--strong">Login</Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    await new Promise((resolve) => setTimeout(resolve, 700));
    localStorage.setItem('pendingSignupEmail', trimmedEmail);
    setIsLoading(false);
    navigate('/reset-password');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--compact">
        <div className="auth-back-link-wrap">
          <button type="button" className="auth-back-link" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} />
            Back to login
          </button>
        </div>

        <BrandHeader />
        <div className="auth-header">
          <h1>Reset Your Password</h1>
          <p>Enter the email linked to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field
            label="Email address"
            name="forgot-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            error={error}
            autoComplete="email"
          />

          <button type="submit" className="auth-button" disabled={isLoading || !email.trim()}>
            {isLoading ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.password) nextErrors.password = 'New password is required.';
    else if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';

    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your new password.';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--compact">
        <div className="auth-back-link-wrap">
          <button type="button" className="auth-back-link" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} />
            Back to login
          </button>
        </div>

        <BrandHeader />
        <div className="auth-header">
          <h1>Create New Password</h1>
          <p>Choose a secure password for your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <PasswordField
            label="New Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New password"
            error={errors.password}
            showPassword={showPassword}
            togglePassword={() => setShowPassword((current) => !current)}
            autoComplete="new-password"
          />

          {form.password ? (
            <div className="auth-strength">
              <div className="auth-strength-row">
                <span>Password strength</span>
                <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
              </div>
              <div className="auth-strength-meter">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={step <= passwordStrength.score ? 'is-active' : ''}
                    style={{ backgroundColor: step <= passwordStrength.score ? passwordStrength.color : '#2d3748' }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            showPassword={showConfirmPassword}
            togglePassword={() => setShowConfirmPassword((current) => !current)}
            autoComplete="new-password"
          />

          <button type="submit" className="auth-button" disabled={isLoading || !form.password || !form.confirmPassword}>
            {isLoading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function VerificationPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem('pendingSignupEmail') || 'your email';

  const handleChange = (index, value) => {
    const nextValue = value.replace(/\D/g, '').slice(0, 1);
    const updated = [...otp];
    updated[index] = nextValue;
    setOtp(updated);
    setError('');

    if (nextValue && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      const previousInput = document.getElementById(`otp-${index - 1}`);
      previousInput?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError('');

    await new Promise((resolve) => setTimeout(resolve, 800));
    localStorage.removeItem('pendingSignupEmail');
    setIsLoading(false);
    navigate('/account-created');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--compact">
        <BrandHeader />
        <div className="auth-header auth-header--centered">
          <div className="auth-status-badge">
            <ShieldCheck size={18} />
            Verify Email
          </div>
          <h1>Email Verification</h1>
          <p>We sent a 6-digit code to {email}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-otp-row">
            {otp.map((value, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="auth-otp-input"
                aria-label={`Verification digit ${index + 1}`}
                onFocus={focusInput}
              />
            ))}
          </div>

          {error ? <p className="auth-field-error auth-field-error--centered">{error}</p> : null}

          <button type="submit" className="auth-button" disabled={isLoading || otp.join('').length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="auth-footer-text">
          Didn’t receive the code? <button type="button" className="auth-link auth-link--button">Resend</button>
        </p>
      </div>
    </div>
  );
}

export function AccountCreatedPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const email = localStorage.getItem('pendingSignupEmail') || 'admin@signage.local';
    persistAuth(email, 'New User');
    localStorage.removeItem('pendingSignupEmail');
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--compact">
        <div className="auth-success-icon">
          <CheckCircle2 size={56} />
        </div>

        <div className="auth-header auth-header--centered">
          <h1>Account Created</h1>
          <p>Your account is ready. You can continue to the dashboard.</p>
        </div>

        <div className="auth-success-list">
          <div className="auth-success-item">
            <span className="auth-success-check"><Check size={14} /></span>
            Email verified successfully
          </div>
          <div className="auth-success-item">
            <span className="auth-success-check"><Check size={14} /></span>
            Security setup completed
          </div>
        </div>

        <button type="button" className="auth-button" onClick={handleContinue} disabled={isLoading}>
          {isLoading ? 'Loading dashboard...' : 'Continue to Dashboard'}
        </button>
      </div>
    </div>
  );
}

export function AuthShell() {
  return null;
}

export { clearAuth };
