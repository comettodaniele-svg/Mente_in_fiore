import { useEffect, useState } from 'react';
import { actions, getState, useApp } from './store';
import { navigate, useRoute } from './router';
import { daysBetween, dayKey } from './lib/dates';
import { Screen } from './components/ui';
import { QuestionnaireFlow } from './screens/Questionnaire';
import { back } from './router';
import Onboarding from './screens/Onboarding';
import Today from './screens/Today';
import Session from './screens/Session';
import SessionEnd from './screens/SessionEnd';
import Garden from './screens/Garden';
import Corner from './screens/Corner';
import WeeklyGoal from './screens/WeeklyGoal';
import Progress from './screens/Progress';
import Me from './screens/Me';
import WelcomeBack from './screens/WelcomeBack';
import Invite from './screens/Invite';
import Dev from './screens/Dev';

function RedoQuestionnaire() {
  return (
    <Screen>
      <QuestionnaireFlow
        onExit={() => back('/progressi')}
        onDone={(a) => {
          actions.saveQuestionnaire(a);
          navigate('/progressi', { replace: true });
        }}
      />
    </Screen>
  );
}

export default function App() {
  const s = useApp();
  const route = useRoute();
  const path = route.split('?')[0];
  const [checked, setChecked] = useState(false);

  // All'apertura: dopo almeno 3 giorni di pausa, un "bentornato" (una volta sola).
  useEffect(() => {
    const st = getState();
    if (st.onboarded && st.lastOpen && daysBetween(st.lastOpen, dayKey()) >= 3 && st.welcomeBack !== dayKey()) {
      navigate('/bentornato', { replace: true });
    }
    actions.touchOpen();
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!s.onboarded && path !== '/inizio') navigate('/inizio', { replace: true });
    else if (s.onboarded && (path === '/' || path === '/inizio')) navigate('/oggi', { replace: true });
  }, [checked, s.onboarded, path]);

  if (!checked) return null;
  if (!s.onboarded) return <Onboarding />;

  switch (path) {
    case '/oggi': return <Today />;
    case '/sessione': return <Session />;
    case '/fine': return <SessionEnd />;
    case '/giardino': return <Garden />;
    case '/angolo': return <Corner />;
    case '/obiettivo': return <WeeklyGoal />;
    case '/progressi': return <Progress />;
    case '/io': return <Me />;
    case '/bentornato': return <WelcomeBack />;
    case '/invita': return <Invite />;
    case '/questionario': return <RedoQuestionnaire />;
    case '/sviluppatore': return <Dev />;
    default: return <Today />;
  }
}
