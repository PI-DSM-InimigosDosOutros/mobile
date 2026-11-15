import { createContext, useContext, useState, type Dispatch, type SetStateAction, type PropsWithChildren } from 'react';
import { initialRegistration, type RegistrationDraft } from '@/utils/registration';

const RegistrationContext = createContext<{
  draft: RegistrationDraft;
  setDraft: Dispatch<SetStateAction<RegistrationDraft>>;
} | null>(null);

export function RegistrationProvider({ children }: PropsWithChildren) {
  // Mantém as cinco etapas na memória mesmo quando a navegação remonta a rota.
  const [draft, setDraft] = useState(initialRegistration);
  return <RegistrationContext.Provider value={{ draft, setDraft }}>{children}</RegistrationContext.Provider>;
}
export function useRegistration() {
  const value = useContext(RegistrationContext);
  if (!value) throw new Error('O cadastro precisa estar dentro de RegistrationProvider.');
  return value;
}

