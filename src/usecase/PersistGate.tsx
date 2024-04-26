import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PersistPartial } from '../store/persist';

interface Props {
  loading?: React.ReactNode;
  onBeforeLift?: () => void;
  children: React.ReactNode;
}

const PersistGate: React.FC<Props> = ({ loading, onBeforeLift, children }) => {
  const rehydrated = useSelector(
    (state: PersistPartial) => state._persist.rehydrated
  );
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (rehydrated && !bootstrapped) {
      Promise.resolve(onBeforeLift?.()).finally(() => setBootstrapped(true));
    }
  }, [rehydrated, bootstrapped, setBootstrapped, onBeforeLift]);

  if (bootstrapped) {
    return children;
  } else {
    return loading;
  }
};

export default PersistGate;
