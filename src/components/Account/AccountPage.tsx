import React from 'react';
import { RiSettingsLine, RiInformationLine, RiHeartLine, RiGithubLine, RiMailLine } from 'react-icons/ri';

export const AccountPage: React.FC = () => {
  const appVersion = '1.0.0';
  
  const handleEmailFeedback = () => {
    window.open('mailto:feedback@yescoach.app?subject=YesCoach Feedback', '_blank');
  };

  const handleGithubIssue = () => {
    window.open('https://github.com/your-username/yescoach/issues', '_blank');
  };

  return (
    <div style={{ 
      padding: '1rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      paddingBottom: '100px' // Account for bottom navigation
    }}>
      
      {/* App Info Section */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: '#e74c3c', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            💪
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#2c3e50' }}>
              YesCoach
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f8c8d' }}>
              Version {appVersion}
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f8c8d', lineHeight: '1.5' }}>
          Your personal fitness companion for tracking workouts, planning exercises, and monitoring progress.
        </p>
      </div>

      {/* Settings Section */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          fontSize: '1.125rem', 
          fontWeight: 'bold', 
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <RiSettingsLine size={20} />
          Settings
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ 
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              Theme Preference
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f8c8d' }}>
              Coming soon: Light/Dark mode toggle
            </p>
          </div>
          
          <div style={{ 
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              Data & Privacy
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f8c8d' }}>
              All data stored locally on your device
            </p>
          </div>
          
          <div style={{ 
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              Notifications
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f8c8d' }}>
              Coming soon: Workout reminders
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          fontSize: '1.125rem', 
          fontWeight: 'bold', 
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <RiHeartLine size={20} />
          Feedback & Support
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleEmailFeedback}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background 0.2s ease'
            }}
          >
            <RiMailLine size={16} />
            Send Feedback
          </button>
          
          <button
            onClick={handleGithubIssue}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background 0.2s ease'
            }}
          >
            <RiGithubLine size={16} />
            Report Issue
          </button>
        </div>
      </div>

      {/* About Section */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          fontSize: '1.125rem', 
          fontWeight: 'bold', 
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <RiInformationLine size={20} />
          About
        </h3>
        
        <div style={{ fontSize: '0.875rem', color: '#7f8c8d', lineHeight: '1.5' }}>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            YesCoach is a Progressive Web App (PWA) designed to help you track your fitness journey, 
            plan effective workouts, and monitor your progress over time.
          </p>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            Built with modern web technologies for a native app-like experience that works across 
            all your devices.
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#95a5a6' }}>
            © 2024 YesCoach. Built with ❤️ for fitness enthusiasts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;