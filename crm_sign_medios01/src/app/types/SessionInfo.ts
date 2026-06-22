export type SessionInfo = {
  type?: string;
  app_id?: string;
  user_id?: string;
  phone_number?: string;
  [key: string]: unknown;
};

export default SessionInfo;
