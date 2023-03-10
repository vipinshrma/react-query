import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

async function getUser(user: User | null): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
    },
  );
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  // TODO: call useQuery to update user data from server
  const { data: user } = useQuery(queryKeys.user, () => getUser(user), {
    initialData: getStoredUser(),
    onSuccess: (received: User | null) => {
      if (!received) {
        clearStoredUser();
      } else {
        setStoredUser(received);
      }
    },
  });

  // meant to be called from useAuth
  const queryClient = useQueryClient();
  function updateUser(newUser: User): void {
    // TODO: update the user in the query cache
    queryClient.setQueriesData(queryKeys.user, newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    queryClient.setQueriesData(queryKeys.user, null);
    queryClient.removeQueries('user-appointments');

    // TODO: reset user to null in query cache
  }

  return { user, updateUser, clearUser };
}
