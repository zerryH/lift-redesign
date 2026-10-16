// A fixture marker is test metadata, never authority to overwrite persisted app data.
export function seedFixture(state){
 if(localStorage.getItem('slat-test-seeded'))return;
 if(localStorage.getItem('liftlog-state')===null)localStorage.setItem('liftlog-state',typeof state==='string'?state:JSON.stringify(state));
 localStorage.setItem('slat-test-seeded','1');
}

// null starts an unseeded page. Its reloads must never reinstall an old fixture.
export async function installFixture(page,state){
 if(state===null)return;
 return page.addInitScript(seedFixture,state);
}
