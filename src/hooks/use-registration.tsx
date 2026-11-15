import { createContext, useContext, useState, useEffect, type Dispatch, type SetStateAction, type PropsWithChildren } from 'react';
import { initialRegistration, type RegistrationDraft } from '@/utils/registration';
import { readLocalDraft, saveLocalDraft } from '@/services/mock-storage';

const RegistrationContext = createContext<{
  draft: RegistrationDraft;
  setDraft: Dispatch<SetStateAction<RegistrationDraft>>;
  ready: boolean;
  storageError: string;
} | null>(null);

export function RegistrationProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState(initialRegistration);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    let active = true;
    readLocalDraft().then(value => { if (active) setDraft(value); })
      .catch(() => { if (active) setStorageError('Não foi possível recuperar seu cadastro.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => {
      saveLocalDraft(draft).then(() => setStorageError(''))
        .catch(() => setStorageError('Não foi possível salvar seu cadastro. Tente novamente.'));
    }, 300);
    return () => clearTimeout(timeout);
  }, [draft, ready]);
  return <RegistrationContext.Provider value={{ draft, setDraft, ready, storageError }}>{children}</RegistrationContext.Provider>;
}
export function useRegistration() {
  const value = useContext(RegistrationContext);
  if (!value) throw new Error('O cadastro precisa estar dentro de RegistrationProvider.');
  return value;
}

