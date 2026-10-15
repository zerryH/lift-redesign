// A fixture marker is test metadata, never authority to overwrite persisted app data.
export function seedFixture(state){
 if(localStorage.getItem('slat-test-seeded'))return;
 if(localStorage.getItem('liftlog-state')===null)localStorage.setItem('liftlog-state',typeof state==='string'?state:JSON.stringify(state));
 localStorage.setItem('slat-test-seeded','1');
}
