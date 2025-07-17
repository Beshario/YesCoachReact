import React, { useState, useEffect } from 'react';
import { RiSettingsLine, RiInformationLine, RiHeartLine, RiGithubLine, RiMailLine, RiToolsLine, RiEyeLine, RiFilterLine } from 'react-icons/ri';
import { preferencesService } from '../../services/preferencesService';
import { UserPreferences, SortType, ExerciseListView } from '../../types/models';
import { DifficultyLevel } from '../../types/SimpleExerciseTypes';

export const AccountPage: React.FC = () => {
  const appVersion = '0.0.1';
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultSortBy: 'muscle_recruitment',
    showSynergistExercises: false,
    showStabilizerExercises: false,
    exerciseListView: 'compact',
    autoExpandChildMuscles: true,
    availableEquipment: ['bodyweight'],
    defaultDifficultyFilter: [],
    autoFilterByEquipment: true,
    autoFilterByDifficulty: false,
    visibleExerciseTabs: ['strength', 'plyometrics', 'stretching', 'all'],
    selectedExerciseTab: 'all'
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const userPrefs = await preferencesService.getUserPreferences();
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    
    try {
      await preferencesService.updatePreferences(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleEmailFeedback = () => {
    window.open('mailto:feedback@yescoach.app?subject=YesCoach Feedback', '_blank');
  };

  const handleGithubIssue = () => {
    window.open('https://github.com/your-username/yescoach/issues', '_blank');
  };

  // Equipment options
  const equipmentOptions = [
    'bodyweight', 'dumbbell', 'barbell', 'cable', 'machine',
    'resistance_band', 'kettlebell', 'suspension', 'medicine_ball',
    'plate', 'bench', 'pull_up_bar'
  ];

  // Difficulty options
  const difficultyOptions: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];

  const handleEquipmentToggle = (equipment: string) => {
    const newEquipment = preferences.availableEquipment.includes(equipment)
      ? preferences.availableEquipment.filter(e => e !== equipment)
      : [...preferences.availableEquipment, equipment];
    updatePreference('availableEquipment', newEquipment);
  };

  const handleDifficultyToggle = (difficulty: DifficultyLevel) => {
    const newFilter = preferences.defaultDifficultyFilter.includes(difficulty)
      ? preferences.defaultDifficultyFilter.filter(d => d !== difficulty)
      : [...preferences.defaultDifficultyFilter, difficulty];
    updatePreference('defaultDifficultyFilter', newFilter);
  };

  const handleTabToggle = (tabValue: string) => {
    const newTabs = preferences.visibleExerciseTabs.includes(tabValue)
      ? preferences.visibleExerciseTabs.filter(t => t !== tabValue)
      : [...preferences.visibleExerciseTabs, tabValue];
    
    // Ensure at least one tab remains visible
    if (newTabs.length > 0) {
      updatePreference('visibleExerciseTabs', newTabs);
    }
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

      {/* Exercise Preferences Section */}
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
          <RiEyeLine size={20} />
          Exercise Preferences
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sort Order */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              Default Sort Order
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { value: 'muscle_recruitment', label: 'Muscle Recruitment', desc: 'Primary muscles first, then secondary' },
                { value: 'relevance', label: 'Most Relevant', desc: 'Target muscles first, then synergists' },
                { value: 'type', label: 'Exercise Type', desc: 'Compound exercises first, then isolated' },
                { value: 'alphabetical', label: 'Alphabetical', desc: 'A-Z by exercise name' }
              ].map(option => (
                <label key={option.value} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: preferences.defaultSortBy === option.value ? '#e3f2fd' : 'transparent'
                }}>
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={preferences.defaultSortBy === option.value}
                    onChange={(e) => updatePreference('defaultSortBy', e.target.value as SortType)}
                    style={{ marginTop: '0.125rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: '500', color: '#2c3e50' }}>{option.label}</div>
                    <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              Display Options
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.autoExpandChildMuscles}
                  onChange={(e) => updatePreference('autoExpandChildMuscles', e.target.checked)}
                />
                <span style={{ fontWeight: '500', color: '#2c3e50' }}>Show exercises for all sub-muscles</span>
              </label>
              <p style={{ margin: '0 0 0 1.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                When selecting "Chest", also show exercises for Pectorals, Serratus Anterior, etc.
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.showSynergistExercises}
                  onChange={(e) => updatePreference('showSynergistExercises', e.target.checked)}
                />
                <span style={{ fontWeight: '500', color: '#2c3e50' }}>Include synergist exercises</span>
              </label>
              <p style={{ margin: '0 0 0 1.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                Show exercises where the muscle assists the movement
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.showStabilizerExercises}
                  onChange={(e) => updatePreference('showStabilizerExercises', e.target.checked)}
                />
                <span style={{ fontWeight: '500', color: '#2c3e50' }}>Include stabilizer exercises</span>
              </label>
              <p style={{ margin: '0 0 0 1.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                Show exercises where the muscle provides stability
              </p>
            </div>
          </div>

          {/* List View */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              List View Style
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { value: 'compact', label: 'Compact', desc: 'Show more exercises on screen' },
                { value: 'detailed', label: 'Detailed', desc: 'Show more information per exercise' }
              ].map(option => (
                <label key={option.value} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: preferences.exerciseListView === option.value ? '#e3f2fd' : 'transparent'
                }}>
                  <input
                    type="radio"
                    name="listView"
                    value={option.value}
                    checked={preferences.exerciseListView === option.value}
                    onChange={(e) => updatePreference('exerciseListView', e.target.value as ExerciseListView)}
                    style={{ marginTop: '0.125rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: '500', color: '#2c3e50' }}>{option.label}</div>
                    <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Equipment & Filtering Section */}
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
          <RiToolsLine size={20} />
          Equipment & Filtering
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Available Equipment */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              Available Equipment
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              {equipmentOptions.map(equipment => (
                <label key={equipment} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                  background: preferences.availableEquipment.includes(equipment) ? '#e8f5e8' : '#f8f9fa'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.availableEquipment.includes(equipment)}
                    onChange={() => handleEquipmentToggle(equipment)}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#2c3e50', textTransform: 'capitalize' }}>
                    {equipment.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferences.autoFilterByEquipment}
                onChange={(e) => updatePreference('autoFilterByEquipment', e.target.checked)}
              />
              <span style={{ fontWeight: '500', color: '#2c3e50' }}>Auto-filter exercises by available equipment</span>
            </label>
          </div>

          {/* Difficulty Preferences */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              Preferred Difficulty Levels
            </h4>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              {difficultyOptions.map(difficulty => (
                <label key={difficulty} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid #e9ecef',
                  background: preferences.defaultDifficultyFilter.includes(difficulty) ? '#e8f5e8' : '#f8f9fa'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.defaultDifficultyFilter.includes(difficulty)}
                    onChange={() => handleDifficultyToggle(difficulty)}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#2c3e50', textTransform: 'capitalize' }}>
                    {difficulty}
                  </span>
                </label>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferences.autoFilterByDifficulty}
                onChange={(e) => updatePreference('autoFilterByDifficulty', e.target.checked)}
              />
              <span style={{ fontWeight: '500', color: '#2c3e50' }}>Auto-filter exercises by preferred difficulty</span>
            </label>
            <p style={{ margin: '0.5rem 0 0 1.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
              Leave empty to show all difficulty levels
            </p>
          </div>

          {/* Category Tab Preferences */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#2c3e50' }}>
              Exercise Category Tabs
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              {[
                { value: 'strength', label: 'Strength', icon: '💪' },
                { value: 'plyometrics', label: 'Plyometrics', icon: '⚡' },
                { value: 'stretching', label: 'Stretching', icon: '🧘' },
                { value: 'all', label: 'All', icon: '📋' }
              ].map(tab => (
                <label key={tab.value} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                  background: preferences.visibleExerciseTabs.includes(tab.value) ? '#e8f5e8' : '#f8f9fa'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.visibleExerciseTabs.includes(tab.value)}
                    onChange={() => handleTabToggle(tab.value)}
                    disabled={preferences.visibleExerciseTabs.length === 1 && preferences.visibleExerciseTabs.includes(tab.value)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>{tab.icon}</span>
                  <span style={{ fontSize: '0.875rem', color: '#2c3e50' }}>
                    {tab.label}
                  </span>
                </label>
              ))}
            </div>
            <p style={{ margin: '0', fontSize: '0.875rem', color: '#7f8c8d' }}>
              Choose which category tabs to show in exercise lists. At least one tab must remain visible.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            background: '#27ae60',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
        {saved && (
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: '#27ae60', 
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            ✓ Preferences saved successfully!
          </p>
        )}
      </div>

      {/* App Settings Section */}
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
          App Settings
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