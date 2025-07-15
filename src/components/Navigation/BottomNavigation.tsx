import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../../stores/workoutStore';
import { 
  RiSearchLine, 
  RiPlaneLine, 
  RiBarChartLine, 
  RiUserLine,
  RiSearchFill,
  RiPlaneFill,
  RiBarChartFill,
  RiUserFill
} from 'react-icons/ri';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  activeIcon: React.ComponentType<{ size?: number }>;
  path: string;
  badge?: number;
}

interface BottomNavigationProps {
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workoutExercises } = useWorkoutStore();

  const tabs: TabItem[] = useMemo(() => [
    {
      id: 'browse',
      label: 'Browse',
      icon: RiSearchLine,
      activeIcon: RiSearchFill,
      path: '/'
    },
    {
      id: 'plan',
      label: 'Plan',
      icon: RiPlaneLine,
      activeIcon: RiPlaneFill,
      path: '/workout',
      badge: workoutExercises.length > 0 ? workoutExercises.length : undefined
    },
    {
      id: 'track',
      label: 'Track',
      icon: RiBarChartLine,
      activeIcon: RiBarChartFill,
      path: '/calendar'
    },
    {
      id: 'account',
      label: 'Account',
      icon: RiUserLine,
      activeIcon: RiUserFill,
      path: '/account'
    }
  ], [workoutExercises.length]);

  const getActiveTab = useCallback((pathname: string): string => {
    if (pathname === '/') return 'browse';
    if (pathname.startsWith('/exercises/')) return 'browse';
    if (pathname === '/workout') return 'plan';
    if (pathname === '/calendar') return 'track';
    if (pathname === '/account') return 'account';
    return 'browse';
  }, []);

  const activeTab = getActiveTab(location.pathname);

  const handleTabClick = useCallback((tab: TabItem) => {
    if (location.pathname !== tab.path) {
      navigate(tab.path);
    }
  }, [navigate, location.pathname]);

  return (
    <nav className={`bottom-navigation ${className}`}>
      <div className="bottom-navigation-container">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = isActive ? tab.activeIcon : tab.icon;
          
          return (
            <button
              key={tab.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
              aria-label={`${tab.label} tab`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="tab-icon-container">
                <IconComponent size={24} />
                {tab.badge && (
                  <span className="tab-badge" aria-label={`${tab.badge} items`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;