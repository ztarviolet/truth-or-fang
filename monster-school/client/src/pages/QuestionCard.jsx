import { useState, useEffect } from 'react';
import Chalkboard from '../components/Chalkboard';

const QUESTIONS = [
  'Truth or Fang?',
  'Who do you trust?',
  'Are you really a student?',
  'Can you survive the night?',
  'Who is hiding among you?',
];

export default function QuestionCard({ onDone }) {
  const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 300);
    const t2 = setTimeout(() => onDone(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="screen center" style={{ background: '#111' }}>
      {show && (
        <Chalkboard lines={[question]} />
      )}
    </div>
  );
}
