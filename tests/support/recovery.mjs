import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {boot,base} from './runtime.mjs';
export const copy=value=>JSON.parse(JSON.stringify(value));
export const keys=['liftlog-recovery-v1','liftlog-recovery-pending-v1'];
export async function recoveryBoot(initial={...base(),rankingVersion:11},options={}){
 const z=await boot(initial,{TextEncoder,crypto:webcrypto,...options});
 vm.runInContext('globalThis.recoveryTest={captureRecovery,recoveryContents,retainRecovery,clearStoredState,openRecoveryCentre,verifyBackupContents,get status(){return recoveryStatus},get epoch(){return recoveryEpoch}};',z.ctx);
 z.recovery=z.ctx.recoveryTest;return z;
}
