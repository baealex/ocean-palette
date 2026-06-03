import childProcess from 'child_process';
import { createDatabase, removeDatabase } from './shared';

const main = async () => {
    const databaseUrl = `file:./.tmp/test/db-${process.pid}-${Date.now()}.sqlite3`;
    process.env.DATABASE_URL = databaseUrl;

    try {
        await removeDatabase(databaseUrl);
        await createDatabase();
        childProcess.execSync('jest --coverage --runInBand', {
            env: {
                ...process.env,
                DATABASE_URL: databaseUrl,
            },
            stdio: 'inherit',
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await removeDatabase(databaseUrl);
    }
};

main();
