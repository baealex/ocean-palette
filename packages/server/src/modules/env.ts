import { loadEnvFile } from 'node:process';

let loaded = false;

export const loadServerEnv = () => {
    if (loaded) {
        return;
    }

    loaded = true;

    try {
        loadEnvFile();
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
    }
};
