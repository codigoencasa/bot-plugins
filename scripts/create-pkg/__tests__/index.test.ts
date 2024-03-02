import { exec } from "child_process";

let errorMsg = '';

/*

    The following tests are for the create-pkg script which creates a new package

    there are two tests
    1. Package name must be defined
    2. Package name exists

    firts test checks if the package name is not defined
    second test checks if the package name already exists

    both tests should should be a string error message


*/

describe('create-pkg tests', () => {

    it('Package name must be defined', (done) => {
        exec('pnpm run create.package', (_, stdout, stderr) => {
            errorMsg = stderr || stdout;
            errorMsg = errorMsg.split('\n').filter(Boolean).at(-1) as string
            
            expect(errorMsg).toBe("[ERROR]: npm run create-pkg <YOUR_PACKAGE>");
            done();
        });
    });

    it ('Package name exists!', (done) => {
        exec('pnpm run create.package telegram', (_, stdout, stderr) => {
            errorMsg = stderr || stdout;
            errorMsg = errorMsg.split('\n').filter(Boolean).at(-1) as string
            
            expect(errorMsg).toBe("[ERROR]: Package telegram already exists")
            done();
        });
    });
});
