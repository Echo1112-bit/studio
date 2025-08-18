
'use client';

/**
 * @fileoverview This file configures Genkit for use in the client-side
 * (browser) part of the application. It is separate from `genkit.ts` to
 * isolate client-side dependencies.
 */

import {genkit} from 'genkit';
import {firebase} from '@genkit-ai/firebase';
import {next} from '@genkit-ai/next';

// This is the Genkit configuration for the client-side. This should be
// imported by client-side components that need to call Genkit flows.
export const ai = genkit({
  plugins: [firebase(), next()],
});
