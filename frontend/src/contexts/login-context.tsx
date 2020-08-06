import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import type { UserDTO } from "../api/types/dto";
import { clearLoginToken, isLoginTokenSet } from "../authentication";
import { useApi } from "../hooks/use-api";
import { useContextOrThrow } from "../hooks/use-context-or-throw";
import { Nullable } from "../state";

interface ILoginBaseContextValue {
  updateLogin: (user: UserDTO) => void;
  logout: () => void;
  user: Nullable<UserDTO>;
}

interface ILoggedOutContextValue extends ILoginBaseContextValue {
  isLoggedIn: false;
}

interface ILoggedInContextValue extends ILoginBaseContextValue {
  isLoggedIn: true;
}

type ILoginContextValue = ILoggedOutContextValue | ILoggedInContextValue;

const Context = React.createContext<Nullable<ILoginContextValue>>(null);
Context.displayName = "LoginContext";

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
  const [user, setUser] = useState<Nullable<UserDTO>>(null);

  useApi(
    async (api) => {
      if (isAlreadyLoggedIn) {
        const apiRole = await api.refreshLoginToken();
        setUser(apiRole);
      }
    },
    [
      // don't ever rerun this hook, since we only want this to run
      // once during app boot
    ],
  );

  const updateLogin = useCallback((newUser: UserDTO) => {
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearLoginToken();
    setUser(null);
  }, []);

  const value = useMemo<ILoginContextValue>(
    () => ({
      isLoggedIn: user != null || isAlreadyLoggedIn,
      logout,
      updateLogin,
      user,
    }),
    [user, isAlreadyLoggedIn, updateLogin, logout],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

/**
 * Gets the login context's value.
 */
export const useLoginContext = (): ILoginContextValue =>
  useContextOrThrow(Context);
