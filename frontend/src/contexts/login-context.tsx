import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { UserRole } from "../../../types/roles";
import { clearLoginToken, isLoginTokenSet } from "../authentication";
import { useApi } from "../hooks/use-api";
import { useContextOrThrow } from "../hooks/use-context-or-throw";
import { Nullable } from "../state";

interface ILoginBaseContextValue {
  login: (role: UserRole) => void;
  logout: () => void;
}

interface ILoggedOutContextValue extends ILoginBaseContextValue {
  isLoggedIn: false;
  role: Nullable<UserRole>;
}

interface ILoggedInContextValue extends ILoginBaseContextValue {
  isLoggedIn: true;
  role: UserRole;
}

type ILoginContextValue = ILoggedOutContextValue | ILoggedInContextValue;

const Context = React.createContext<Nullable<ILoginContextValue>>(null);

interface ILoginContextProviderProps {
  children: React.ReactNode;
}

/**
 * A context storing and providing login functionality.
 * @param props The props to pass to this context
 */
export const LoginContextProvider = ({
  children,
}: ILoginContextProviderProps) => {
  const isAlreadyLoggedIn = isLoginTokenSet();
  const [role, setRole] = useState<Nullable<UserRole>>(null);

  useApi(
    async (api) => {
      if (isAlreadyLoggedIn) {
        await api.refreshLoginToken();
        const apiRole = await api.getRole();
        setRole(apiRole);
      }
    },
    [
      // don't ever rerun this hook, since we only want this to run
      // once during app boot
    ],
  );

  const login = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  const logout = useCallback(() => {
    clearLoginToken();
  }, []);

  const value = useMemo<ILoginContextValue>(
    () => ({
      isLoggedIn: role != null || isAlreadyLoggedIn,
      login,
      logout,
      role: role as any,
    }),
    [role, isAlreadyLoggedIn, login, logout],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

/**
 * Gets the login context's value.
 */
export const useLoginContext = (): ILoginContextValue =>
  useContextOrThrow(Context);
