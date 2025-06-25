import React from 'react';
import YesCoachBodyMap, { MuscleInfo } from './components/BodyMap';

function App(): React.JSX.Element {
  const handleMuscleSelected = (muscle: MuscleInfo): void => {
    console.log('Selected muscle:', muscle);
    // Here you can add navigation logic or state updates
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <YesCoachBodyMap onMuscleSelected={handleMuscleSelected} />
      </main>
    </div>
  );
}

export default App;