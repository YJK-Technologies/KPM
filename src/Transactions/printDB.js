import Dexie from 'dexie';

const printDB = new Dexie("PrintDatabase");

printDB.version(1).stores({
  reportData: 'key' // We’ll store 3 records with keys: PheaderData, PdetailData, PtaxData
});

export default printDB;