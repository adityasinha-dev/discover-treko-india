/**
 * Temporary frontend demo auth adapter.
 *
 * Replace these functions with the Treko MERN API when it is available.
 * This module intentionally does not persist credentials or claim to secure
 * accounts. Form validation stays in the UI; passwords are discarded here.
 */
export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegistrationDetails = AuthCredentials & {
  fullName: string;
};

export async function signInDemo(_credentials: AuthCredentials): Promise<void> {
  // Demo flow: accept validated form data without storing or transmitting it.
}

export async function registerDemo(_details: RegistrationDetails): Promise<void> {
  // Demo flow: accept validated form data without storing or transmitting it.
}
